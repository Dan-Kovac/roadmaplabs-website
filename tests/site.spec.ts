import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const site = 'https://roadmaplabs.com.au';

const routes: { path: string; nav: string | null; noindex?: boolean }[] = [
  { path: '/', nav: 'Home' },
  { path: '/work', nav: 'Our work' },
  { path: '/work/compass-buyers-agency', nav: null },
  { path: '/work/reviewbuddy', nav: null },
  { path: '/work/flexfolio', nav: null },
  { path: '/about', nav: 'About' },
  { path: '/blog', nav: 'Insights' },
  { path: '/blog/ai-automation-agency-savings', nav: null },
  { path: '/blog/business-process-automation-ai-or-process', nav: null },
  { path: '/blog/topics/where-ai-fits', nav: null },
  { path: '/contact', nav: 'Contact' },
  { path: '/privacy', nav: null },
  { path: '/thanks', nav: null, noindex: true },
  { path: '/404', nav: null, noindex: true },
];

const canonicalFor = (route: string) => (route === '/' ? `${site}/` : `${site}${route}`);

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectImagesLoaded(page: Page) {
  await page.evaluate(async () => {
    const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += Math.max(window.innerHeight, 1)) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    window.scrollTo(0, 0);
    await Promise.all(
      [...document.images].map(
        (img) =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise((resolve) => {
                const done = () => resolve(undefined);
                img.addEventListener('load', done, { once: true });
                img.addEventListener('error', done, { once: true });
              }),
      ),
    );
  });
  const broken = await page.evaluate(() =>
    [...document.images]
      .filter((img) => {
        const box = img.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && img.naturalWidth === 0;
      })
      .map((img) => img.currentSrc || img.alt),
  );
  expect(broken, 'visible images that did not load').toEqual([]);
}

async function expectHeaderNav(page: Page, project: string, current: string | null) {
  if (project === 'mobile') {
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menu = page.locator('#mobile-menu');
    await expect(menu).toBeVisible();
    if (current) await expect(menu.getByRole('link', { name: current, exact: true })).toHaveAttribute('aria-current', 'page');
    await menu.getByRole('link', { name: 'Our work', exact: true }).click();
  } else {
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'Insights', exact: true })).toBeVisible();
    if (current) await expect(nav.getByRole('link', { name: current, exact: true })).toHaveAttribute('aria-current', 'page');
    await nav.getByRole('link', { name: 'Our work', exact: true }).click();
  }
  await expect(page).toHaveURL(/\/work$/);
}

for (const route of routes) {
  test(`${route.path} loads`, async ({ page }, testInfo) => {
    const response = await page.goto(route.path);
    expect(response, 'navigation response').not.toBeNull();
    expect(response!.status(), route.path).toBe(200);
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    if (route.noindex) {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    } else {
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonicalFor(route.path));
    }
    await expect(page.locator('footer a[href="/blog"]')).toBeVisible();
    await expectNoOverflow(page);
    await expectImagesLoaded(page);
    await expectNoOverflow(page);
    await expectHeaderNav(page, testInfo.project.name, route.nav);
  });
}

test('public copy drops the unproven phrases', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route.path);
    const text = (await page.locator('body').innerText()).toLowerCase();
    expect(text, route.path).not.toContain('live pilot');
    expect(text, route.path).not.toContain('live in pilot');
    expect(text, route.path).not.toContain('growing on');
    expect(text, route.path).not.toContain('seo automation');
    expect(text, route.path).not.toContain('30 pms');
  }
});

test('built html drops the unproven phrases', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'filesystem check once');
  const files = walk(path.resolve('dist')).filter((file) => file.endsWith('.html'));
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    const lower = fs.readFileSync(file, 'utf8').toLowerCase();
    expect(lower, file).not.toContain('live pilot');
    expect(lower, file).not.toContain('growing on');
    expect(lower, file).not.toContain('seo automation');
    expect(lower, file).not.toContain('30 pms');
  }
});

test('reviewbuddy does not serve the original widget photo', async ({ page }) => {
  await page.goto('/work/reviewbuddy');
  const urls = await page.evaluate(() =>
    [...document.querySelectorAll('img, source')]
      .flatMap((el) => [el.getAttribute('src'), el.getAttribute('srcset'), (el as HTMLImageElement).currentSrc])
      .filter((value): value is string => Boolean(value))
      .join('\n'),
  );
  expect(urls).toContain('reviewbuddy-widget-redacted');
  expect(urls).not.toMatch(/reviewbuddy-widget(?!-redacted)/);
  const html = await page.content();
  expect(html).not.toMatch(/reviewbuddy-widget(?!-redacted)/);
});

test.describe('contact form', () => {
  test('shows the thank-you state without calling Formspree', async ({ page }) => {
    let hits = 0;
    await page.route('https://formspree.io/**', (route) => {
      hits += 1;
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.goto('/contact');
    await page.locator('#c-name').fill('Test Person');
    await page.locator('#c-email').fill('test@example.com');
    await page.locator('#c-phone').fill('0400000000');
    await page.getByRole('button', { name: 'Book my free session' }).click();
    await expect(page.locator('#contact-thanks')).toBeVisible();
    expect(hits).toBe(1);
  });

  test('shows the error state without calling Formspree', async ({ page }) => {
    let hits = 0;
    await page.route('https://formspree.io/**', (route) => {
      hits += 1;
      return route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"no"}' });
    });
    await page.goto('/contact');
    await page.locator('#c-name').fill('Test Person');
    await page.locator('#c-email').fill('test@example.com');
    await page.locator('#c-phone').fill('0400000000');
    await page.getByRole('button', { name: 'Book my free session' }).click();
    await expect(page.locator('#contact-error')).toBeVisible();
    expect(hits).toBe(1);
  });
});
