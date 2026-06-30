// Renders scripts/resume.html → public/Vatsal-Mehra-Resume.pdf via Playwright.
// Run from the project root: `node scripts/build-resume.mjs`
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, "resume.html");
const outPath = resolve(__dirname, "..", "public", "Vatsal-Mehra-Resume.pdf");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("file://" + htmlPath, { waitUntil: "networkidle" });
await page.pdf({
  path: outPath,
  format: "Letter",
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();
console.log("Wrote", outPath);
