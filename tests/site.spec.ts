import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const routes: { path: string; nav: string | null }[] = [
  { path: '/', nav: null },
  { path: '/work', nav: 'Work' },
  { path: '/work/compass-buyers-agency', nav: 'Work' },
  { path: '/work/reviewbuddy', nav: 'Work' },
  { path: '/work/flexfolio', nav: 'Work' },
  { path: '/services', nav: 'Services' },
  { path: '/process', nav: null },
  { path: '/faq', nav: null },
  { path: '/articles', nav: 'Articles' },
  { path: '/about', nav: 'About' },
  { path: '/contact', nav: null },
  { path: '/privacy', nav: null },
  { path: '/thanks', nav: null },
  { path: '/404', nav: null },
];

function canonicalFor(route: string) {
  return route === '/' ? 'https://roadmaplabs.com.au/' : `https://roadmaplabs.com.au${route}`;
}

async function expectNoOverflow(page: Page) {
  const box = await page.evaluate(() => ({
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    innerWidth: window.innerWidth,
  }));
  expect(box.scrollWidth, `horizontal overflow ${box.scrollWidth} > ${box.innerWidth}`).toBeLessThanOrEqual(box.innerWidth);
}

async function expectImagesLoaded(page: Page) {
  await page.evaluate(async () => {
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += Math.max(window.innerHeight, 1)) {
      window.scrollTo(0, y);
      await wait(30);
    }
    window.scrollTo(0, height);
    await Promise.all(
      [...document.images].map(
        (img) =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.addEventListener('load', () => resolve(undefined), { once: true });
                img.addEventListener('error', () => resolve(undefined), { once: true });
              }),
      ),
    );
  });
  const broken = await page.evaluate(() =>
    [...document.images]
      .filter((img) => {
        const box = img.getBoundingClientRect();
        const hidden = box.width === 0 && box.height === 0;
        return !hidden && (img.naturalWidth === 0 || box.height < 1);
      })
      .map((img) => img.currentSrc || img.getAttribute('src') || img.alt),
  );
  expect(broken, 'images with naturalWidth 0').toEqual([]);
  const logo = page.locator('footer img[alt="Roadmap Labs"]');
  await expect(logo).toBeVisible();
  await expect.poll(async () => logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
}

async function expectFaqToggles(page: Page) {
  const details = page.locator('main details');
  if ((await details.count()) === 0) return;
  const item = details.first();
  const summary = item.locator('summary');
  await summary.scrollIntoViewIfNeeded();
  const opened = await item.evaluate((el: HTMLDetailsElement) => el.open);
  await summary.click();
  await expect.poll(async () => item.evaluate((el: HTMLDetailsElement) => el.open)).toBe(!opened);
  await summary.click();
  await expect.poll(async () => item.evaluate((el: HTMLDetailsElement) => el.open)).toBe(opened);
}

async function expectHeaderNav(page: Page, project: string, current: string | null) {
  if (project === 'mobile') {
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menu = page.locator('#mobile-menu');
    await expect(menu).toBeVisible();
    if (current) await expect(menu.getByRole('link', { name: current, exact: true })).toHaveAttribute('aria-current', 'page');
    await expectNoOverflow(page);
    await menu.getByRole('link', { name: 'Services', exact: true }).click();
  } else {
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'Services', exact: true })).toBeVisible();
    await expect(page.locator('footer a[href="/process"]')).toBeVisible();
    if (current) await expect(nav.getByRole('link', { name: current, exact: true })).toHaveAttribute('aria-current', 'page');
    await nav.getByRole('link', { name: 'Services', exact: true }).click();
  }
  await expect(page).toHaveURL(/\/services$/);
}

for (const route of routes) {
  test(`${route.path} loads`, async ({ page }, testInfo) => {
    const response = await page.goto(route.path);
    expect(response, 'navigation response').not.toBeNull();
    expect(response!.status(), route.path).toBe(200);
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonicalFor(route.path));
    await expect(page.locator('footer a[href="/services"]')).toBeVisible();
    await expect(page.locator('footer a[href="/process"]')).toBeVisible();
    await expect(page.locator('footer a[href="/faq"]')).toBeVisible();
    await expect(page.locator('footer a[href="/articles"]')).toBeVisible();
    await expectNoOverflow(page);
    await expectImagesLoaded(page);
    await expectFaqToggles(page);
    await expectNoOverflow(page);
    await expectHeaderNav(page, testInfo.project.name, route.nav);
  });
}

test('work rows stay visible', async ({ page }) => {
  await page.goto('/work');
  const rows = page.locator('main .rl-split');
  await expect(rows).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    const row = rows.nth(i);
    await row.scrollIntoViewIfNeeded();
    await expect(row).toBeVisible();
    const opacity = await row.evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacity).toBe(1);
  }
});

test('public copy does not say live pilot', async ({ page }) => {
  for (const path of ['/', '/work', '/work/reviewbuddy', '/about', '/work/flexfolio', '/work/compass-buyers-agency']) {
    await page.goto(path);
    const text = (await page.locator('body').innerText()).toLowerCase();
    expect(text, path).not.toContain('live pilot');
    expect(text, path).not.toContain('live in pilot');
  }
});

test('draft article is not a route', async ({ page }) => {
  const response = await page.goto('/articles/draft-example');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("We couldn't find that page");
  await expect(page.getByText('DRAFT_FIXTURE_DO_NOT_PUBLISH')).toHaveCount(0);
  await expect(page.getByText('Draft example, not for publication')).toHaveCount(0);
});

test('articles index is the empty state', async ({ page }) => {
  await page.goto('/articles');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Put AI to work with a clearer idea of how');
  await expect(page.getByRole('heading', { name: 'The first articles are being prepared' })).toBeVisible();
  await expect(page.getByText('There are no published articles here yet. Check back for practical guides you can use in your own business.')).toBeVisible();
  await expect(page.getByText('Draft example, not for publication')).toHaveCount(0);
  await expect(page.getByText('DRAFT_FIXTURE_DO_NOT_PUBLISH')).toHaveCount(0);
});

test('build output excludes the draft and lists the new pages', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'filesystem check once');
  const dist = path.resolve('dist');
  const files = walk(dist);
  const htmlAndXml = files.filter((file) => /\.(html|xml)$/.test(file));
  for (const file of htmlAndXml) {
    const text = fs.readFileSync(file, 'utf8');
    const lower = text.toLowerCase();
    expect(lower, file).not.toContain('growing on');
    expect(lower, file).not.toContain('seo automation');
    expect(text, file).not.toContain('DRAFT_FIXTURE_DO_NOT_PUBLISH');
    expect(text, file).not.toContain('Draft example, not for publication');
    expect(text, file).not.toContain('/articles/draft-example');
  }
  expect(files.some((file) => file.includes('draft-example'))).toBe(false);

  const index = await (await request.get('/sitemap-index.xml')).text();
  expect(index).not.toContain('draft-example');
  const loc = index.match(/<loc>([^<]+)<\/loc>/)?.[1];
  expect(loc).toBeTruthy();
  const childPath = new URL(loc!).pathname;
  const child = await (await request.get(childPath)).text();
  for (const url of ['/services', '/process', '/faq', '/articles', '/work/compass-buyers-agency']) {
    expect(child).toContain(`https://roadmaplabs.com.au${url}`);
  }
  expect(child).not.toContain('/thanks');
  expect(child).not.toContain('/404');
  expect(child).not.toContain('draft-example');
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
    await page.locator('#contact-form button[type="submit"]').click();
    await expect(page.locator('#contact-thanks')).toBeVisible();
    await expect(page.locator('#contact-form')).toBeHidden();
    await expect(page.locator('#contact-thanks')).toContainText('Thanks, Dan will be in touch to find a time.');
    expect(hits).toBe(1);
  });

  test('shows the error state without calling Formspree', async ({ page }) => {
    let hits = 0;
    await page.route('https://formspree.io/**', (route) => {
      hits += 1;
      return route.fulfill({ status: 422, contentType: 'application/json', body: '{"error":"nope"}' });
    });
    await page.goto('/contact');
    await page.locator('#c-name').fill('Test Person');
    await page.locator('#c-email').fill('test@example.com');
    await page.locator('#c-phone').fill('0400000000');
    await page.locator('#contact-form button[type="submit"]').click();
    await expect(page.locator('#contact-error')).toBeVisible();
    await expect(page.locator('#contact-form')).toBeVisible();
    await expect(page.locator('#contact-thanks')).toBeHidden();
    expect(hits).toBe(1);
  });
});

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const next = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(next) : [next];
  });
}
