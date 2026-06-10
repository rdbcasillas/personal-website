// One-off site audit: screenshots at three viewports + console error capture.
// Usage: node scripts/audit-site.mjs (dev server must be running on :5173)
import { chromium } from "playwright";
import fs from "node:fs";

const OUT = "/tmp/site-audit";
fs.mkdirSync(OUT, { recursive: true });

const URL = "http://localhost:5173/";
const browser = await chromium.launch();

async function slowScroll(page) {
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 280) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 110));
    }
  });
}

async function newPage(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning")
      errors.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  await page.goto(URL, { waitUntil: "networkidle" });
  return { page, errors };
}

// ---- Desktop ----------------------------------------------------------------
{
  const { page, errors } = await newPage(1440, 900);
  await slowScroll(page);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/desktop-full.png`, fullPage: true });

  // Story card open
  await page.locator("#timeline").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2800);
  await page.locator(".marker-hit").nth(7).click({ force: true });
  await page.waitForTimeout(600);
  await page.locator("#timeline").screenshot({ path: `${OUT}/desktop-storycard.png` });
  console.log("desktop errors:", errors.length ? errors : "none");
  await page.close();
}

// ---- Tablet -----------------------------------------------------------------
{
  const { page, errors } = await newPage(768, 1024);
  await slowScroll(page);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/tablet-full.png`, fullPage: true });
  console.log("tablet errors:", errors.length ? errors : "none");
  await page.close();
}

// ---- Phone ------------------------------------------------------------------
{
  const { page, errors } = await newPage(390, 844);
  await slowScroll(page);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/phone-full.png`, fullPage: true });

  // Spiral story card
  await page.locator("#timeline").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2800);
  await page.locator(".marker-hit").nth(9).click({ force: true });
  await page.waitForTimeout(600);
  await page.locator("#timeline").screenshot({ path: `${OUT}/phone-storycard.png` });

  // List view
  await page.locator(".tl-mobile-toggle button", { hasText: "List" }).click();
  await page.waitForTimeout(400);
  await slowScroll(page);
  await page.waitForTimeout(800);
  await page.locator("#timeline").screenshot({ path: `${OUT}/phone-list.png` });
  console.log("phone errors:", errors.length ? errors : "none");
  await page.close();
}

await browser.close();
console.log("done →", OUT);
