// Renders report.html to a PDF.
// Usage: node docs/example-report/build.cjs [out.pdf] [previewDir]
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const out = process.argv[2] || path.join(__dirname, 'roadmap-labs-example-report.pdf');
  const previewDir = process.argv[3];
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(__dirname, 'report.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: out, format: 'A4', printBackground: true });
  if (previewDir) {
    await page.setViewportSize({ width: 794, height: 1123 });
    const pages = await page.$$('.page');
    for (let i = 0; i < pages.length; i++) {
      const overflow = await pages[i].evaluate((e) => e.scrollHeight - e.clientHeight);
      await pages[i].screenshot({ path: path.join(previewDir, 'page-' + (i + 1) + '.png') });
      console.log('page ' + (i + 1) + ' overflow ' + overflow + 'px');
    }
  }
  await browser.close();
  console.log('wrote', out);
})();
