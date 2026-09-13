import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import { validateLead } from "../src/lib/validation.ts";
import { sameOrigin, readBody, rateKey } from "../src/lib/request.ts";
import { flushNotifications } from "../src/lib/notifications.ts";
import {
  database,
  saveLead,
  allowRequest,
  closeDatabase,
  recordEvent,
  type Database,
} from "../src/lib/db.ts";
import type { Row, SqlValue } from "../src/lib/database/types.ts";
import { openSqlite } from "../src/lib/database/sqlite.ts";
import { openPostgres } from "../src/lib/database/postgres.ts";
import { migrate } from "../src/lib/database/migrations.ts";
import {
  cleanAttribution,
  signAttribution,
  verifyAttribution,
} from "../src/lib/attribution.ts";
import { validateRuntime, appUrl } from "../src/lib/config.ts";
import { healthResponse } from "../src/lib/health.ts";
import { buildEnquiryEmail, mimeSubject } from "../src/lib/email.ts";

// Tests never use the application's DATABASE_URL or a real notification destination.
delete process.env.DATABASE_URL;
delete process.env.EMAIL_API_KEY;
delete process.env.LEAD_NOTIFICATION_WEBHOOK;
Object.assign(process.env, { NODE_ENV: "test" });
process.env.APP_URL = "http://localhost:3000";
process.env.EMAIL_PROVIDER = "disabled";
process.env.DATABASE_PATH = join(
  mkdtempSync(join(tmpdir(), "khalq-tests-")),
  "leads.sqlite",
);
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
after(async () => {
  await closeDatabase();
});

test("validates email and normalizes phone enquiries", () => {
  assert.equal(validateLead(base).email, "test@example.com");
  const phone = validateLead({ ...base, contact: "+971 50 123 4567" });
  assert.equal(phone.email, "");
  assert.equal(phone.phone, "+971501234567");
  for (const number of [
    "+44 20 7946 0958",
    "001 415 555 2671",
    "+91 98765 43210",
    "+49 30 901820",
  ])
    assert.match(
      validateLead({ ...base, contact: number }).phone,
      /^\+[1-9]\d{6,14}$/,
    );
});
test("rejects missing, oversized, invalid and spam submissions", () => {
  for (const patch of [
    { name: "" },
    { name: "Name\r\nBcc: test@example.com" },
    { contact: "invalid" },
    { contact: "a..b@example.com" },
    { contact: "0501234567" },
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
    utmTerm: "custom software",
    utmContent: "a",
    referrer: "https://example.com/path?private=1",
  });
  assert.equal(lead.utmSource, "newsletter");
  assert.equal(lead.utmTerm, "custom software");
  assert.equal(lead.referrer, "https://example.com");
});
test("atomically saves a private lead and notification with initial status", async () => {
  const result = await saveLead(validateLead(base));
  const db = await database();
  const [lead] = await db.query(
    "SELECT id,status,email FROM leads WHERE reference=$1",
    [result.reference],
  );
  assert.equal(lead.status, "new");
  assert.equal(lead.email, "test@example.com");
  assert.equal(
    (
      await db.query(
        "SELECT status FROM notification_outbox WHERE lead_id=$1",
        [String(lead.id)],
      )
    )[0].status,
    "pending",
  );
});
test("rate limits persist in the database", async () => {
  for (let i = 0; i < 5; i++) assert.equal(await allowRequest("test", 5), true);
  assert.equal(await allowRequest("test", 5), false);
});
test("lead statuses enforce the CRM pipeline", async () => {
  const db = await database();
  await assert.rejects(() =>
    db.query("UPDATE leads SET status='Invalid' WHERE email=$1", [
      "test@example.com",
    ]),
  );
});
test("rejects cross-origin requests and oversized bodies", async () => {
  assert.equal(
    sameOrigin(
      new Request("http://localhost:3000/api/leads", {
        headers: { origin: "https://attacker.example" },
      }),
    ),
    false,
  );
  assert.equal(
    sameOrigin(
      new Request("http://localhost:3000/api/leads", {
        headers: { origin: "http://localhost:3000" },
      }),
    ),
    true,
  );
  await assert.rejects(
    () =>
      readBody(
        new Request("http://localhost:3000/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: "x".repeat(20001) }),
        }),
      ),
    /too large/,
  );
});
test("notification failures retain the job and successful retries mark it sent", async (t) => {
  process.env.EMAIL_PROVIDER = "webhook";
  process.env.LEAD_NOTIFICATION_WEBHOOK = "https://notifications.example/test";
  const mocked = t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("", { status: 503 }),
  );
  assert.equal((await flushNotifications()).sent, 0);
  const db = await database();
  const [pending] = await db.query(
    "SELECT status,attempts FROM notification_outbox LIMIT 1",
  );
  assert.equal(pending.status, "pending");
  assert.equal(pending.attempts, 1);
  assert.equal(
    (await db.query("SELECT COUNT(*) AS total FROM leads"))[0].total,
    1,
  );
  await db.query("UPDATE notification_outbox SET next_attempt=0");
  mocked.mock.mockImplementation(async () => new Response("", { status: 200 }));
  assert.equal((await flushNotifications()).sent, 1);
  assert.equal(
    (await db.query("SELECT status FROM notification_outbox LIMIT 1"))[0]
      .status,
    "sent",
  );
  delete process.env.LEAD_NOTIFICATION_WEBHOOK;
  process.env.EMAIL_PROVIDER = "disabled";
});

test("signed attribution rejects tampering and expires", () => {
  const first = cleanAttribution({
    landingPage: "/solutions",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "software_dubai",
    utmTerm: "software",
    utmContent: "hero",
    referrer: "https://search.example/query?q=private",
  });
  const token = signAttribution(first);
  assert.deepEqual(verifyAttribution(token), first);
  assert.equal(
    verifyAttribution(token.replace(token[0], token[0] === "a" ? "b" : "a")),
    null,
  );
  assert.equal(
    verifyAttribution(
      signAttribution({ ...first, issuedAt: Date.now() - 86400001 }),
    ),
    null,
  );
  assert.equal(
    cleanAttribution({
      landingPage: "//evil.example",
      referrer: "javascript:alert(1)",
    }).landingPage,
    "/",
  );
});
test("production configuration fails closed and contains only field names", () => {
  assert.throws(() => validateRuntime({ NODE_ENV: "production" }));
  const valid = {
    NODE_ENV: "production",
    APP_URL: "https://khalq.io",
    DATABASE_URL: "postgresql://user:fake@database:5432/khalq",
    RATE_LIMIT_SECRET: "x".repeat(32),
    ATTRIBUTION_SECRET: "y".repeat(32),
    TRUST_PROXY: "true",
    TRUSTED_IP_HEADER: "x-real-ip",
    EMAIL_PROVIDER: "resend",
    EMAIL_API_KEY: "fake-key",
    EMAIL_FROM: "sender@example.com",
    NOTIFICATION_EMAIL: "team@example.com",
  };
  assert.equal(validateRuntime(valid).production, true);
  for (const patch of [
    { APP_URL: "http://localhost:3000" },
    { DATABASE_URL: "" },
    { EMAIL_API_KEY: "" },
    { TRUST_PROXY: "false" },
    { EMAIL_PROVIDER: "disabled" },
  ])
    assert.throws(() => validateRuntime({ ...valid, ...patch }));
  assert.equal(appUrl({ APP_URL: "https://khalq.io" }), "https://khalq.io");
  assert.throws(() => appUrl({ APP_URL: "https://user:secret@khalq.io" }));
});
test("trusted proxy parsing ignores forged leftmost hops", () => {
  process.env.TRUST_PROXY = "true";
  process.env.TRUSTED_IP_HEADER = "x-forwarded-for";
  const request = (value: string) =>
    new Request("http://localhost:3000", {
      headers: { "x-forwarded-for": value },
    });
  assert.equal(
    rateKey(request("1.1.1.1, 203.0.113.7"), "leads"),
    rateKey(request("8.8.8.8, 203.0.113.7"), "leads"),
  );
  assert.throws(() => rateKey(request("not-an-ip"), "leads"));
  delete process.env.TRUST_PROXY;
  delete process.env.TRUSTED_IP_HEADER;
});
test("health only exposes readiness and rejects missing migrations", async () => {
  const good = await healthResponse();
  assert.equal(good.status, 200);
  assert.deepEqual(await good.json(), { status: "ok" });
  const empty = openSqlite(":memory:");
  const bad = await healthResponse(empty);
  assert.equal(bad.status, 503);
  assert.deepEqual(await bad.json(), { status: "unavailable" });
  await empty.close();
});
test("SQLite V1 migration preserves leads, outbox and analytics", async () => {
  const old = openSqlite(":memory:");
  await old.exec(await readFile("migrations/sqlite/001_initial.sql", "utf8"));
  const id = randomUUID();
  await old.query(
    "INSERT INTO leads(id,name,email,phone,company,requirement,requirement_type,source_page,utm_source,utm_medium,utm_campaign,referrer,status) VALUES($1,'Original','original@example.com','','','Existing enquiry','Not sure','/','','','','','Reviewing')",
    [id],
  );
  await old.query("INSERT INTO notification_outbox(id,lead_id) VALUES($1,$2)", [
    randomUUID(),
    id,
  ]);
  await old.query(
    "INSERT INTO events VALUES('2026-01-01','start_project','/',3)",
  );
  await migrate(old);
  await migrate(old);
  const [lead] = await old.query("SELECT * FROM leads WHERE id=$1", [id]);
  assert.equal(lead.status, "reviewing");
  assert.equal(lead.requirement, "Existing enquiry");
  assert.equal(
    (await old.query("SELECT COUNT(*) AS total FROM notification_outbox"))[0]
      .total,
    1,
  );
  assert.equal((await old.query("SELECT count FROM events"))[0].count, 3);
  assert.equal((await old.query("PRAGMA foreign_key_check")).length, 0);
  await old.close();
});

async function persistenceContract(db: Database) {
  await migrate(db);
  await migrate(db);
  const key = randomUUID(),
    visitor = randomUUID();
  const lead = validateLead({
    ...base,
    submissionKey: key,
    projectType: "software",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "software_dubai",
    utmTerm: "software",
    utmContent: "a",
    landingPage: "/solutions",
  });
  const first = await saveLead(lead, {
    database: db,
    event: {
      id: "",
      visitorId: visitor,
      event: "lead_submitted",
      page: "/",
      ctaLocation: "hero",
      projectType: "software",
    },
  });
  const duplicate = await saveLead(lead, { database: db });
  assert.equal(duplicate.reference, first.reference);
  assert.equal(duplicate.duplicate, true);
  const [saved] = await db.query("SELECT * FROM leads WHERE reference=$1", [
    first.reference,
  ]);
  assert.equal(saved.utm_term, "software");
  assert.equal(saved.landing_page, "/solutions");
  assert.equal(saved.status, "new");
  assert.equal((await db.query("SELECT * FROM notification_outbox")).length, 1);
  assert.equal((await db.query("SELECT * FROM analytics_events")).length, 1);
  const parallel = await Promise.all(
    Array.from({ length: 10 }, () => allowRequest("parallel", 5, 10000, db)),
  );
  assert.equal(parallel.filter(Boolean).length, 5);
  const event = {
    id: randomUUID(),
    visitorId: visitor,
    event: "visit",
    page: "/",
    ctaLocation: "page",
    projectType: "not-sure",
  };
  await recordEvent(event, db);
  await recordEvent(event, db);
  assert.equal(
    (await db.query("SELECT * FROM analytics_events WHERE event='visit'"))
      .length,
    1,
  );
  await db.exec(
    "CREATE TRIGGER test_fail_outbox " +
      (db.dialect === "sqlite"
        ? "BEFORE INSERT ON notification_outbox BEGIN SELECT RAISE(ABORT, 'outbox rejected'); END;"
        : "BEFORE INSERT ON notification_outbox FOR EACH ROW EXECUTE FUNCTION test_reject_outbox();"),
  );
  await assert.rejects(() =>
    saveLead(validateLead({ ...base, submissionKey: randomUUID() }), {
      database: db,
    }),
  );
  assert.equal((await db.query("SELECT * FROM leads")).length, 1);
}
test("SQLite shared persistence, deduplication, rollback and concurrent rate-limit contract", async () => {
  const db = openSqlite(":memory:");
  try {
    await persistenceContract(db);
  } finally {
    await db.close();
  }
});
test("PostgreSQL engine runs migrations and the same persistence contract", async () => {
  const pg = new PGlite();
  const db: Database = {
    dialect: "postgres",
    async query<T extends Row>(sql: string, values: SqlValue[] = []) {
      return (await pg.query<T>(sql, values)).rows;
    },
    async exec(sql) {
      await pg.exec(sql);
    },
    async transaction(work) {
      return pg.transaction(async (tx) =>
        work({
          async query<T extends Row>(sql: string, values: SqlValue[] = []) {
            return (await tx.query<T>(sql, values)).rows;
          },
          async exec(sql) {
            await tx.exec(sql);
          },
        }),
      );
    },
    async close() {
      await pg.close();
    },
  };
  try {
    await db.exec(
      "CREATE FUNCTION test_reject_outbox() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'outbox rejected'; END; $$ LANGUAGE plpgsql",
    );
    await persistenceContract(db);
  } finally {
    await db.close();
  }
});
test(
  "real PostgreSQL driver contract (CI service)",
  { skip: !process.env.TEST_DATABASE_URL },
  async () => {
    const url = process.env.TEST_DATABASE_URL!;
    const pool = new Pool({ connectionString: url });
    const schema = "khq_test_" + randomUUID().replaceAll("-", "");
    await pool.query(`CREATE SCHEMA ${schema}`);
    const scoped = new URL(url);
    scoped.searchParams.set("options", `-c search_path=${schema}`);
    const db = openPostgres(scoped.toString());
    try {
      await db.exec(
        "CREATE FUNCTION test_reject_outbox() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'outbox rejected'; END; $$ LANGUAGE plpgsql",
      );
      await persistenceContract(db);
    } finally {
      await db.close();
      await pool.query(`DROP SCHEMA ${schema} CASCADE`);
      await pool.end();
    }
  },
);

test("Resend email contains required enquiry fields without infrastructure data", async (t) => {
  const db = openSqlite(":memory:");
  await migrate(db);
  process.env.EMAIL_PROVIDER = "resend";
  process.env.EMAIL_FROM = "sender@example.com";
  process.env.NOTIFICATION_EMAIL = "team@example.com";
  process.env.EMAIL_API_KEY = "unit-test-secret";
  const result = await saveLead(
    validateLead({ ...base, utmCampaign: "software_dubai" }),
    { database: db },
  );
  let body: Record<string, unknown> = {};
  t.mock.method(
    globalThis,
    "fetch",
    async (_url: Parameters<typeof fetch>[0], options?: RequestInit) => {
      body = JSON.parse(String(options?.body));
      return Response.json({ id: "provider-test" });
    },
  );
  assert.equal((await flushNotifications(db)).sent, 1);
  assert.equal(body.subject, "New Khalq Project Enquiry — Test Person");
  assert.match(String(body.text), /software_dubai/);
  assert.match(String(body.text), new RegExp(result.reference));
  assert.ok(!JSON.stringify(body).includes("unit-test-secret"));
  assert.ok(!JSON.stringify(body).includes("abuse_hash"));
  process.env.EMAIL_PROVIDER = "disabled";
  delete process.env.EMAIL_API_KEY;
  await db.close();
});
test("Gmail uses OAuth refresh and a base64url MIME message", async (t) => {
  const db = openSqlite(":memory:");
  await migrate(db);
  process.env.EMAIL_PROVIDER = "gmail";
  process.env.GOOGLE_CLIENT_ID = "test-client";
  process.env.GOOGLE_CLIENT_SECRET = "test-secret";
  process.env.GOOGLE_REFRESH_TOKEN = "test-refresh";
  await saveLead(validateLead(base), { database: db });
  let mime = "";
  t.mock.method(
    globalThis,
    "fetch",
    async (url: Parameters<typeof fetch>[0], options?: RequestInit) => {
      if (String(url).includes("oauth2.googleapis.com")) {
        assert.match(String(options?.body), /grant_type=refresh_token/);
        return Response.json({ access_token: "test-access" });
      }
      const body = JSON.parse(String(options?.body));
      mime = Buffer.from(body.raw, "base64url").toString();
      return Response.json({ id: "test-message" });
    },
  );
  assert.equal((await flushNotifications(db)).sent, 1);
  assert.match(mime, /Content-Type: text\/plain; charset=UTF-8/);
  assert.match(mime, /To: team@example.com/);
  assert.ok(!mime.includes("test-refresh"));
  process.env.EMAIL_PROVIDER = "disabled";
  await db.close();
});
test("notification formatter keeps user content out of headers", () => {
  const fake = {
    id: "id",
    reference: "KHQ-ABC",
    name: "Safe",
    company: "Company\r\nBcc: someone",
    email: "test@example.com",
    phone: "",
    requirement: "<script>alert(1)</script>",
    requirement_type: "Not sure",
    project_type: "not-sure",
    source_page: "/",
    landing_page: "/",
    referrer: "",
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
    status: "new",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const result = buildEnquiryEmail(fake);
  assert.ok(!/[\r\n]/.test(result.subject));
  assert.match(result.text, /<script>/);
});
test("Gmail MIME subjects preserve international names within header limits", () => {
  const subject = "New Khalq Project Enquiry — " + "إنشاء".repeat(30);
  const encoded = mimeSubject(subject);
  const parts = encoded.split("\r\n ");
  assert.ok(parts.every((part) => part.length <= 75));
  assert.equal(
    parts
      .map((part) => Buffer.from(part.slice(10, -2), "base64").toString())
      .join(""),
    subject,
  );
});
