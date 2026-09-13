import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateLead } from "../src/lib/validation.ts";
import { sameOrigin, readBody } from "../src/lib/request.ts";
import { flushNotifications } from "../src/lib/notifications.ts";
process.env.DATABASE_PATH = join(
  mkdtempSync(join(tmpdir(), "khalq-test-")),
  "leads.sqlite",
);
const { db, saveLead, allowRequest } = await import("../src/lib/db.ts");
const base = {
  name: "Test Person",
  contact: "test@example.com",
  requirement: "We need to automate our inventory workflow.",
  requirementType: "Automate a process",
  company: "",
  sourcePage: "/",
  website: "",
  startedAt: Date.now() - 5000,
};
test("validates email and normalizes phone enquiries", () => {
  assert.equal(validateLead(base).email, "test@example.com");
  const phone = validateLead({ ...base, contact: "+971 50 123 4567" });
  assert.equal(phone.email, "");
  assert.equal(phone.phone, "+971 50 123 4567");
});
test("rejects missing, oversized, invalid and spam submissions", () => {
  for (const patch of [
    { name: "" },
    { contact: "invalid" },
    { requirement: "short" },
    { requirement: "x".repeat(5001) },
    { website: "spam" },
    { startedAt: Date.now() },
    { requirementType: "injected" },
    { sourcePage: "https://elsewhere.test" },
  ])
    assert.throws(() => validateLead({ ...base, ...patch }));
  assert.throws(() => validateLead(null));
});
test("keeps campaign attribution and removes referrer query data", () => {
  const lead = validateLead({
    ...base,
    utmSource: "newsletter",
    referrer: "https://example.com/path?private=1",
  });
  assert.equal(lead.utmSource, "newsletter");
  assert.equal(lead.referrer, "https://example.com");
});
test("atomically saves a private lead and notification with initial status", () => {
  const id = saveLead(validateLead(base));
  const lead = db()
    .prepare("SELECT status,email FROM leads WHERE id=?")
    .get(id);
  assert.equal(lead?.status, "New");
  assert.equal(lead?.email, "test@example.com");
  const outbox = db()
    .prepare("SELECT status FROM notification_outbox WHERE lead_id=?")
    .get(id);
  assert.equal(outbox?.status, "pending");
});
test("rate limits persist in the database", () => {
  for (let i = 0; i < 5; i++) assert.equal(allowRequest("test", 5), true);
  assert.equal(allowRequest("test", 5), false);
});
test("lead statuses enforce the CRM pipeline", () => {
  assert.throws(() =>
    db()
      .prepare("UPDATE leads SET status='Invalid' WHERE email=?")
      .run("test@example.com"),
  );
});
test("rejects cross-origin requests and oversized bodies", async () => {
  process.env.SITE_URL = "https://khalq.io";
  assert.equal(
    sameOrigin(
      new Request("https://khalq.io/api/leads", {
        headers: { origin: "https://attacker.example" },
      }),
    ),
    false,
  );
  assert.equal(
    sameOrigin(
      new Request("https://khalq.io/api/leads", {
        headers: { origin: "https://khalq.io" },
      }),
    ),
    true,
  );
  const request = new Request("https://khalq.io/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "x".repeat(20001) }),
  });
  await assert.rejects(() => readBody(request), /too large/);
});
test("notification failures retain the job and successful retries mark it sent", async (t) => {
  process.env.LEAD_NOTIFICATION_WEBHOOK = "https://notifications.example/test";
  const mocked = t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("", { status: 503 }),
  );
  assert.equal((await flushNotifications()).sent, 0);
  const pending = db()
    .prepare(
      "SELECT status,attempts,next_attempt FROM notification_outbox LIMIT 1",
    )
    .get();
  assert.equal(pending?.status, "pending");
  assert.equal(pending?.attempts, 1);
  db().prepare("UPDATE notification_outbox SET next_attempt=0").run();
  mocked.mock.mockImplementation(async () => new Response("", { status: 200 }));
  assert.equal((await flushNotifications()).sent, 1);
  assert.equal(
    db().prepare("SELECT status FROM notification_outbox LIMIT 1").get()
      ?.status,
    "sent",
  );
  delete process.env.LEAD_NOTIFICATION_WEBHOOK;
});
