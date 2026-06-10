import { chromium } from "playwright";

const OUT = "/Users/vats/Programming/personal-website/src/assets/previews";

const sites = [
  { file: "rationality-workshops.jpg", url: "https://rationalityworkshops.com" },
  { file: "rational-resilience.jpg", url: "https://rationalresilience.org" },
  { file: "portal.jpg", url: "https://enterportal.org" },
];

const browser = await chromium.launch();

for (const site of sites) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1.5,
  });
  const page = await ctx.newPage();
  try {
    await page.goto(site.url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: `${OUT}/${site.file}`,
      type: "jpeg",
      quality: 78,
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    });
    console.log("captured", site.url);
  } catch (e) {
    console.log("FAILED", site.url, "-", e.message);
  }
  await ctx.close();
}

await browser.close();
console.log("done");
