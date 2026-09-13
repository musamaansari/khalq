import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

await mkdir("test-results", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.screenshot({
  path: "test-results/home-desktop.png",
  fullPage: true,
});
assert.equal(await page.locator("h1").innerText(), "Create\nwhat’s next.");
await page
  .locator("#project")
  .getByRole("button", { name: "Start a Project" })
  .click();
await page.locator("#hero-error").waitFor();
await page
  .locator("#hero-requirement")
  .fill("Browser QA: automate weekly inventory reporting for our team.");
await page
  .locator("#project")
  .getByRole("button", { name: "Start a Project" })
  .click();
await page
  .getByRole("button", { name: "Automate a process", exact: true })
  .click();
await page.getByRole("button", { name: "Continue", exact: true }).click();
await page.locator("#hero-name").fill("Website QA");
await page.locator("#hero-contact").fill("qa@example.com");
await page.locator("#hero-company").fill("Local QA");
// Respect the form's minimum completion time, as a real visitor would.
await page.waitForTimeout(2100);
const submitted = page.waitForResponse((r) => r.url().endsWith("/api/leads"));
await page.getByRole("button", { name: "Send My Requirement" }).click();
const submission = await submitted;
assert.equal(submission.status(), 201, await submission.text());
await page.getByRole("heading", { name: "A good place to start." }).waitFor();
await page.screenshot({ path: "test-results/form-success.png" });
for (const path of [
  "/solutions",
  "/products",
  "/about",
  "/privacy",
  "/terms",
]) {
  const response = await page.goto(`http://localhost:3000${path}`, {
    waitUntil: "networkidle",
  });
  assert.equal(response.status(), 200, path);
  assert.equal(await page.locator("h1").count(), 1);
}
const missing = await page.goto("http://localhost:3000/not-a-real-page");
assert.equal(missing.status(), 404);
for (const width of [390, 768, 1440]) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `No overflow at ${width}px`,
  );
  await page.screenshot({
    path: `test-results/home-${width}.png`,
    fullPage: true,
  });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: "Open menu" }).click();
await page
  .getByRole("navigation", { name: "Mobile navigation" })
  .getByRole("link", { name: "About" })
  .click();
await page
  .getByRole("heading", { name: "We create technology around real problems." })
  .waitFor();
assert.equal(
  await page.getByRole("navigation", { name: "Mobile navigation" }).count(),
  0,
);
await page
  .locator("#closing-requirement")
  .fill("Browser QA: improve the scheduling process for our business.");
await page.getByRole("button", { name: "Let’s Build It" }).click();
await page.getByRole("button", { name: "Skip for now" }).click();
await page.locator("#closing-name").fill("Mobile QA");
await page.locator("#closing-contact").fill("+971 50 123 4567");
await page.waitForTimeout(2100);
await page.screenshot({
  path: "test-results/mobile-contact.png",
  fullPage: true,
});
assert.ok(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.getByRole("button", { name: "Send My Requirement" }).click();
await page.getByRole("heading", { name: "A good place to start." }).waitFor();
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "Browser checks passed: desktop/mobile enquiries, mobile navigation, all pages, 404, responsive overflow, no runtime errors.",
);
