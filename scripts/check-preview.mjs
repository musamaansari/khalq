import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const root = "http://localhost:3000";
for (const [path, status] of [
  ["/", 200],
  ["/opengraph-image", 200],
  ["/sitemap.xml", 200],
  ["/robots.txt", 200],
  ["/api/leads", 405],
  ["/data/khalq.sqlite", 404],
]) {
  const response = await fetch(root + path);
  assert.equal(response.status, status, path);
}
const rejected = await fetch(root + "/api/leads", {
  method: "POST",
  headers: {
    Origin: "https://other.example",
    "Content-Type": "application/json",
  },
  body: "{}",
});
assert.equal(rejected.status, 403);
try {
  const apache = await fetch("http://localhost/khalq/package.json", {
    signal: AbortSignal.timeout(3000),
  });
  assert.equal(apache.status, 403);
  console.log("Apache source-file protection: verified.");
} catch (e) {
  if (e.name === "AssertionError") throw e;
  console.log(
    "Apache is not running; .htaccess protection configured but not runtime-tested.",
  );
}
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await page.goto(root, { waitUntil: "networkidle" });
  assert.equal(
    await page
      .locator("#hero-requirement")
      .evaluate((el) => getComputedStyle(el).fontSize),
    "16px",
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({ path: "test-results/mobile-final.png" });
  await page.getByRole("button", { name: "Open menu" }).click();
  const event = page.waitForResponse((r) => r.url().endsWith("/api/events"));
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Products" })
    .click();
  assert.equal((await event).status(), 204);
  await page
    .getByRole("heading", { name: "Built by Khalq. Made to be useful." })
    .waitFor();
  assert.equal(
    await page.getByRole("link", { name: "Explore Khalq products" }).count(),
    0,
  );
  console.log(
    "Final preview: metadata, API protection, mobile input size, product analytics and navigation passed.",
  );
} finally {
  await browser.close();
}
