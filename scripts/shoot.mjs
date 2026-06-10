import { chromium } from "playwright";
import { mkdirSync } from "fs";

const OUT = "/tmp/site-shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

// Desktop
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await desktop.newPage();
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/desktop-top.png` });

// Full page desktop
await page.screenshot({ path: `${OUT}/desktop-full.png`, fullPage: true });

// Timeline is always visible now — scroll to it and screenshot
const timeline = await page.locator("#timeline").boundingBox();
if (timeline) {
  await page.screenshot({
    path: `${OUT}/desktop-timeline.png`,
    clip: { x: 0, y: timeline.y, width: 1440, height: Math.min(timeline.height, 1100) },
  });
}
await desktop.close();

// Mobile
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const mpage = await mobile.newPage();
await mpage.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await mpage.waitForTimeout(500);
await mpage.screenshot({ path: `${OUT}/mobile-top.png` });
await mpage.screenshot({ path: `${OUT}/mobile-full.png`, fullPage: true });
await mobile.close();

await browser.close();
console.log("done");
