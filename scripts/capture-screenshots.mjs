import { chromium } from '@playwright/test';

const routes = [
  ['/', 'index'],
  ['/work', 'work'],
  ['/work/compass-buyers-agency', 'work-compass-buyers-agency'],
  ['/work/reviewbuddy', 'work-reviewbuddy'],
  ['/work/flexfolio', 'work-flexfolio'],
  ['/services', 'services'],
  ['/process', 'process'],
  ['/faq', 'faq'],
  ['/articles', 'articles'],
  ['/about', 'about'],
  ['/contact', 'contact'],
  ['/privacy', 'privacy'],
  ['/thanks', 'thanks'],
  ['/404', '404'],
];

const viewports = [
  ['desktop', { width: 1280, height: 800 }],
  ['mobile', { width: 390, height: 844 }],
];

const base = process.env.SCREENSHOT_BASE || 'http://127.0.0.1:4321';
const browser = await chromium.launch();

for (const [name, viewport] of viewports) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  for (const [route, file] of routes) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += Math.max(window.innerHeight, 1)) {
        window.scrollTo(0, y);
        await wait(40);
      }
      window.scrollTo(0, height);
      await Promise.all(
        [...document.images].map(
          (img) =>
            img.complete && img.naturalWidth > 0
              ? Promise.resolve()
              : new Promise((resolve) => {
                  const done = () => resolve(undefined);
                  img.addEventListener('load', done, { once: true });
                  img.addEventListener('error', done, { once: true });
                  setTimeout(done, 4000);
                }),
        ),
      );
      window.scrollTo(0, 0);
      await wait(100);
    });
    const out = `/opt/cursor/artifacts/screenshots/${name}/${file}.png`;
    await page.screenshot({ path: out, fullPage: true });
    const failed = await page.evaluate(() =>
      [...document.images]
        .filter((img) => img.getBoundingClientRect().height > 0 && !(img.complete && img.naturalWidth > 0))
        .map((img) => img.alt || img.currentSrc),
    );
    if (failed.length) console.error(name, route, failed);
    console.log(out);
  }
  await context.close();
}

await browser.close();
