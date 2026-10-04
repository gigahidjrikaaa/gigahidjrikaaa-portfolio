// QA capture: waits for entrance animations and scrolls through the page so
// useInView-gated sections render before screenshots.
import { chromium } from "playwright";

const BASE = process.env.QA_URL || "http://localhost:3112";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

// Scroll through the page to trigger all in-view animations and lazy loads.
await page.evaluate(async () => {
  const step = 600;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, document.body.scrollHeight);
});
await page.waitForTimeout(1500);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1200);

await page.screenshot({ path: "qa-desktop-hero.png" });
await page.screenshot({ path: "qa-desktop-full.png", fullPage: true });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(BASE, { waitUntil: "networkidle" });
await mobile.waitForTimeout(2500);
await mobile.screenshot({ path: "qa-mobile-hero.png" });

await browser.close();
console.log("captured: qa-desktop-hero.png, qa-desktop-full.png, qa-mobile-hero.png");
