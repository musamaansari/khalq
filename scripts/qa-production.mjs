import { createServer, request as httpRequest } from "node:http";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

await mkdir("test-results", { recursive: true });
const directory = await mkdtemp(resolve("test-results/production-qa-"));
const emailMessages = [];
let rejectEmail = false;
const emailServer = createServer(async (request, response) => {
  let body = "";
  for await (const chunk of request) body += chunk;
  emailMessages.push(JSON.parse(body));
  response.writeHead(rejectEmail ? 503 : 200, {
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify({ id: "qa-provider-message" }));
});
await new Promise((resolve) => emailServer.listen(0, "127.0.0.1", resolve));
const emailPort = emailServer.address().port;
const portProbe = createServer();
await new Promise((resolve) => portProbe.listen(0, "127.0.0.1", resolve));
const appPort = portProbe.address().port;
await new Promise((resolve) => portProbe.close(resolve));
const root = `http://localhost:${appPort}`;
const env = {
  ...process.env,
  NODE_ENV: "production",
  APP_ENV: "local",
  APP_URL: root,
  PORT: String(appPort),
  DATABASE_URL: "",
  DATABASE_PATH: join(directory, "qa.sqlite"),
  RATE_LIMIT_SECRET: randomUUID() + randomUUID(),
  ATTRIBUTION_SECRET: randomUUID() + randomUUID(),
  TRUST_PROXY: "false",
  TRUSTED_IP_HEADER: "",
  EMAIL_PROVIDER: "resend",
  EMAIL_FROM: "sender@example.com",
  NOTIFICATION_EMAIL: "team@example.com",
  EMAIL_API_KEY: "qa-not-a-real-key",
  ANALYTICS_ENABLED: "true",
  KHALQ_QA_EMAIL_URL: `http://127.0.0.1:${emailPort}/email`,
  NODE_OPTIONS: `--import=${pathToFileURL(resolve("tests/fixtures/mock-email.mjs")).href}`,
};
const application = spawn(
  process.execPath,
  ["--experimental-strip-types", "scripts/start.ts"],
  { env, stdio: ["ignore", "pipe", "pipe"] },
);
let output = "";
application.stdout.on("data", (chunk) => (output += chunk));
application.stderr.on("data", (chunk) => (output += chunk));
let browser;
let raw;
async function until(check, description) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(description);
}
try {
  await until(async () => {
    try {
      return (await fetch(root + "/api/health")).status === 200;
    } catch {
      return false;
    }
  }, "App health did not become ready");
  raw = new DatabaseSync(env.DATABASE_PATH);
  raw.exec("PRAGMA busy_timeout=5000");
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await desktopContext.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(
    root +
      "/?utm_source=google&utm_medium=cpc&utm_campaign=software_dubai&utm_term=software&utm_content=hero",
    { waitUntil: "networkidle" },
  );
  const canonical = await page
    .locator("link[rel=canonical]")
    .getAttribute("href");
  assert.equal(new URL(canonical).href, "https://khalq.io/");
  const desktopAxe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await writeFile(
    join(directory, "desktop-accessibility.json"),
    JSON.stringify(desktopAxe.violations, null, 2),
  );
  await page.screenshot({
    path: join(directory, "desktop.png"),
    fullPage: true,
  });
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Solutions" })
    .click();
  await page
    .getByRole("link", { name: /Software.*Discuss a Project/s })
    .click();
  await page
    .locator("#hero-requirement")
    .fill("QA: build an inventory system for our team.");
  await page
    .locator("#project")
    .getByRole("button", { name: "Start a Project" })
    .click();
  await page.getByRole("button", { name: "New idea", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator("#hero-name").fill("Desktop QA");
  await page.locator("#hero-contact").fill("desktop@example.com");
  await page.getByRole("button", { name: "← Back", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  assert.equal(await page.locator("#hero-name").inputValue(), "Desktop QA");
  await page.waitForTimeout(2100);
  const responsePromise = page.waitForResponse((r) =>
    r.url().endsWith("/api/leads"),
  );
  await page.getByRole("button", { name: "Send My Requirement" }).click();
  const response = await responsePromise;
  assert.equal(response.status(), 201, await response.text());
  await page
    .getByRole("heading", { name: "Your idea is with Khalq." })
    .waitFor();
  const lead = raw
    .prepare("SELECT * FROM leads WHERE email=?")
    .get("desktop@example.com");
  assert.equal(lead.utm_source, "google");
  assert.equal(lead.utm_campaign, "software_dubai");
  assert.equal(lead.utm_term, "software");
  assert.equal(lead.landing_page, "/");
  assert.equal(lead.project_type, "software");
  assert.equal(lead.status, "new");
  assert.match(lead.reference, /^KHQ-[A-F0-9]{12}$/);
  await until(() => emailMessages.length === 1, "Email was not triggered");
  assert.match(emailMessages[0].text, /software_dubai/);
  assert.match(emailMessages[0].text, /Desktop QA/);
  await until(
    () =>
      raw
        .prepare(
          "SELECT count(*) AS total FROM notification_outbox WHERE status='sent'",
        )
        .get().total === 1,
    "Email outbox not marked sent",
  );
  for (const event of [
    "visit",
    "requirement_started",
    "requirement_completed",
    "lead_submitted",
  ])
    assert.ok(
      raw
        .prepare("SELECT count(*) AS total FROM analytics_events WHERE event=?")
        .get(event).total > 0,
      event,
    );
  // Separate browser context models a new mobile visitor and first-touch campaign.
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const mobile = await mobileContext.newPage();
  await mobile.goto(root + "/?utm_source=mobile_test", {
    waitUntil: "networkidle",
  });
  await mobile.getByRole("button", { name: "Open menu" }).click();
  await mobile
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "About" })
    .click();
  await mobile
    .locator("#closing-requirement")
    .fill("QA: improve our international scheduling process.");
  await mobile.getByRole("button", { name: "Let’s Build It" }).click();
  await mobile.getByRole("button", { name: "Skip for now" }).click();
  await mobile.locator("#closing-name").fill("Mobile QA");
  await mobile.locator("#closing-contact").fill("not-an-email");
  await mobile.waitForTimeout(2100);
  await mobile.getByRole("button", { name: "Send My Requirement" }).click();
  await mobile.locator("#closing-error").waitFor();
  assert.equal(await mobile.locator("#closing-name").inputValue(), "Mobile QA");
  await mobile.locator("#closing-contact").fill("+44 20 7946 0958");
  const mobileAxe = await new AxeBuilder({ page: mobile })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await writeFile(
    join(directory, "mobile-accessibility.json"),
    JSON.stringify(mobileAxe.violations, null, 2),
  );
  await mobile.screenshot({ path: join(directory, "mobile-contact.png") });
  assert.ok(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  rejectEmail = true;
  await mobile.getByRole("button", { name: "Send My Requirement" }).click();
  await mobile
    .getByRole("heading", { name: "Your idea is with Khalq." })
    .waitFor();
  await until(
    () => emailMessages.length >= 2,
    "Failure-path email not attempted",
  );
  const mobileLead = raw
    .prepare("SELECT * FROM leads WHERE name=?")
    .get("Mobile QA");
  assert.equal(mobileLead.phone, "+442079460958");
  assert.equal(mobileLead.utm_source, "mobile_test");
  assert.equal(mobileLead.source_page, "/about");
  await until(
    () =>
      raw
        .prepare(
          "SELECT last_error_code FROM notification_outbox WHERE lead_id=?",
        )
        .get(mobileLead.id).last_error_code === "delivery_failed",
    "Failed notification not queued",
  );
  rejectEmail = false;
  raw
    .prepare(
      "UPDATE notification_outbox SET next_attempt=0 WHERE status='pending'",
    )
    .run();
  await promisify(execFile)(
    process.execPath,
    ["--experimental-strip-types", "scripts/notifications.ts"],
    { env },
  );
  assert.equal(
    raw
      .prepare("SELECT status FROM notification_outbox WHERE lead_id=?")
      .get(mobileLead.id).status,
    "sent",
  );
  // Also exercise the primary mobile hero using keyboard activation.
  await mobile.goto(root, { waitUntil: "networkidle" });
  await mobile
    .locator("#hero-requirement")
    .fill("QA: create a useful mobile business application.");
  await mobile.keyboard.press("Tab");
  await mobile.keyboard.press("Enter");
  await mobile.getByRole("button", { name: "Continue", exact: true }).click();
  await mobile.locator("#hero-name").fill("Mobile Hero QA");
  await mobile.locator("#hero-contact").fill("mobile-hero@example.com");
  await mobile.waitForTimeout(2100);
  await mobile.getByRole("button", { name: "Send My Requirement" }).click();
  await mobile
    .getByRole("heading", { name: "Your idea is with Khalq." })
    .waitFor();
  assert.ok(
    raw
      .prepare("SELECT id FROM leads WHERE email=?")
      .get("mobile-hero@example.com"),
  );
  for (const path of [
    "/privacy",
    "/terms",
    "/products",
    "/api/health",
    "/sitemap.xml",
    "/robots.txt",
    "/opengraph-image",
  ])
    assert.equal((await fetch(root + path)).status, 200, path);
  assert.equal((await fetch(root + "/missing-page")).status, 404);
  assert.equal((await fetch(root + "/api/leads")).status, 405);
  assert.equal(
    (
      await fetch(root + "/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://attacker.example",
        },
        body: "{}",
      })
    ).status,
    403,
  );
  const www = await new Promise((resolve, reject) => {
    const request = httpRequest(
      root + "/solutions?x=1",
      { headers: { Host: "www.khalq.io" } },
      (response) => {
        response.resume();
        resolve({
          status: response.statusCode,
          location: response.headers.location,
        });
      },
    );
    request.on("error", reject);
    request.end();
  });
  assert.equal(www.status, 308);
  assert.equal(www.location, "https://khalq.io/solutions?x=1");
  assert.deepEqual(errors, []);
  assert.deepEqual(desktopAxe.violations, []);
  assert.deepEqual(mobileAxe.violations, []);
  const report = {
    desktopFlow: true,
    mobileFlow: true,
    attribution: true,
    emailCapture: true,
    notificationRetry: true,
    analytics: true,
    health: true,
    canonical,
    redirect: true,
    desktopAccessibilityViolations: desktopAxe.violations.map((v) => ({
      id: v.id,
      count: v.nodes.length,
    })),
    mobileAccessibilityViolations: mobileAxe.violations.map((v) => ({
      id: v.id,
      count: v.nodes.length,
    })),
  };
  await writeFile(
    join(directory, "report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify({ directory, ...report }, null, 2));
} finally {
  if (browser) await browser.close();
  if (raw) raw.close();
  application.kill("SIGTERM");
  emailServer.close();
  await writeFile(join(directory, "server.log"), output);
}
