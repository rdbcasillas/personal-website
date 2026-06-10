import { chromium } from "playwright";

const OUT = "/Users/vats/Programming/personal-website/src/assets/previews";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1500, height: 760 },
  deviceScaleFactor: 1.5,
});
const page = await ctx.newPage();
try {
  await page.goto("https://vats.substack.com", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  // Dismiss any subscribe modal that may have popped up
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `${OUT}/clear-and-muddy.jpg`,
    type: "jpeg",
    quality: 80,
    clip: { x: 0, y: 0, width: 1500, height: 720 },
  });
  console.log("captured substack homepage");
} catch (e) {
  console.log("FAILED -", e.message);
}
await browser.close();
console.log("done");
