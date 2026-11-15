import { expect, test, type Page } from '@playwright/test';
import { FAQ_OPEN_ID } from '../src/data/faq';
import { SHOW_COMPASS_PROJECT_LINK } from '../src/data/services';

const pages = [
  {
    path: '/services',
    title: 'AI Consulting Services Australia | Roadmap Labs',
    description:
      'AI consulting for established Australian businesses. Automations and custom tools built on the systems you already run on. Book a free 1-hour session.',
    h1: 'AI work built on the systems you already run on',
  },
  {
    path: '/process',
    title: 'Our AI Consulting Process, Step by Step | Roadmap Labs',
    description:
      'How our AI automation agency works with Australian businesses: a free 1-hour strategy session, then a scoped build and training for your team.',
    h1: 'Get clear on the work before anything gets built',
  },
  {
    path: '/faq',
    title: 'AI Consulting FAQs: Cost and Your Data | Roadmap Labs',
    description:
      'What AI consulting costs in Australia and how we handle your data. A typical engagement ranges from $5,000 to $50,000.',
    h1: 'Questions we get before a project starts',
  },
] as const;

const forbidden = ['[DAN', 'NOT SITE COPY', '30 PMs', '2012'];

function canonicalFor(route: string) {
  return `https://roadmaplabs.com.au${route}`;
}

async function expectNoOverflow(page: Page) {
  const box = await page.evaluate(() => ({
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    innerWidth: window.innerWidth,
  }));
  expect(box.scrollWidth, `horizontal overflow ${box.scrollWidth} > ${box.innerWidth}`).toBeLessThanOrEqual(box.innerWidth);
}

for (const entry of pages) {
  test(`${entry.path} loads cleanly`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    const response = await page.goto(entry.path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(entry.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', entry.description);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonicalFor(entry.path));
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(entry.h1);
    await expect(page.locator('.bp-hero a.rl-btn')).toHaveText('Book your free session');
    await expect(page.locator('.bp-hero a.rl-btn')).toHaveAttribute('href', '/contact');
    await expect(page.locator('.ev-cta h2')).toHaveText('Book your free AI strategy session');

    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/\blorem\b/i);
    expect(text).not.toMatch(/\bTODO\b/);
    expect(text).not.toMatch(/\bTBD\b/);
    expect(text.toLowerCase()).not.toContain('gst');

    const html = await page.content();
    for (const needle of forbidden) expect(html, needle).not.toContain(needle);

    await expectNoOverflow(page);
    expect(errors, errors.join('\n')).toEqual([]);
  });
}

test('header Services and footer Process and FAQ', async ({ page }, testInfo) => {
  const mobile = testInfo.project.name.startsWith('mobile');
  await page.goto('/services');
  await expectNoOverflow(page);

  if (mobile) {
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menu = page.locator('#mobile-menu');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('link', { name: 'Services', exact: true })).toHaveAttribute('aria-current', 'page');
    await expectNoOverflow(page);
    await page.keyboard.press('Escape');
  } else {
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'Services', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Services', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Process', exact: true })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'FAQ', exact: true })).toHaveCount(0);
  }

  await expect(page.locator('footer a[href="/process"]')).toBeVisible();
  await expect(page.locator('footer a[href="/faq"]')).toBeVisible();
  await expect(page.locator('footer a[href="/services"]')).toHaveCount(0);

  await page.locator('footer a[href="/process"]').click();
  await expect(page).toHaveURL(/\/process$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Get clear on the work before anything gets built');

  await page.locator('footer a[href="/faq"]').click();
  await expect(page).toHaveURL(/\/faq$/);

  if (mobile) {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('#mobile-menu').getByRole('link', { name: 'Services', exact: true }).click();
  } else {
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Services', exact: true }).click();
  }
  await expect(page).toHaveURL(/\/services$/);
  await expectNoOverflow(page);
});

test('services page hides the Compass link until the flag is on', async ({ page }) => {
  await page.goto('/services');
  const compass = page.getByRole('link', { name: /Read the case study/ });
  const label = page.getByText('A website we built for Compass Buyers Agency');
  if (SHOW_COMPASS_PROJECT_LINK) {
    await expect(label).toBeVisible();
    await expect(compass).toHaveAttribute('href', '/work/compass-buyers-agency');
  } else {
    await expect(compass).toHaveCount(0);
    await expect(label).toHaveCount(0);
    await expect(page.locator('main').getByText('Compass')).toHaveCount(0);
  }
  await expect(page.getByRole('link', { name: /See ReviewBuddy/ })).toHaveAttribute('href', '/work/reviewbuddy');
  await expect(page.getByRole('link', { name: /See Flexfolio/ })).toHaveAttribute('href', '/work/flexfolio');
});

test('process shows the four steps and the optional label', async ({ page }) => {
  await page.goto('/process');
  await expect(page.locator('.bp-num')).toHaveText(['01', '02', '03', '04']);
  await expect(page.getByText('Step 4 · Optional')).toBeVisible();
  await expect(page.getByRole('link', { name: /Why the simple sum is usually too big/ })).toHaveAttribute(
    'href',
    '/blog/ai-automation-agency-savings',
  );
  await expect(page.getByText('$5,000 to $50,000')).toBeVisible();
});

test('faq accordion toggles, deep-links and keeps a visible focus ring', async ({ page }, testInfo) => {
  await page.goto('/faq');
  const price = page.locator(`#${FAQ_OPEN_ID} button`);
  const next = page.locator('#what-changes-the-price button');
  await expect(price).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator(`#${FAQ_OPEN_ID}-answer`)).toBeVisible();
  await expect(next).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#what-changes-the-price-answer')).toBeHidden();

  await next.click();
  await expect(next).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#what-changes-the-price-answer')).toBeVisible();
  await next.click();
  await expect(next).toHaveAttribute('aria-expanded', 'false');

  await price.evaluate((element) => {
    (element as HTMLElement).focus({ focusVisible: true } as FocusOptions);
  });
  const outline = await price.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
  });
  expect(outline.style).not.toBe('none');
  expect(outline.width).toBeGreaterThan(0);

  await price.press('Enter');
  await expect(price).toHaveAttribute('aria-expanded', 'false');
  await price.press('Enter');
  await expect(price).toHaveAttribute('aria-expanded', 'true');

  await page.goto('/faq#is-it-secure');
  const secure = page.locator('#is-it-secure button');
  await expect(secure).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#is-it-secure-answer')).toBeVisible();
  await expect(page.locator('#is-it-secure-answer')).toContainText('tech stack');

  await page.goto('/faq#security');
  await expect(page.locator('#security')).toBeVisible();
  await expect(page.locator('#security h2')).toHaveText('Security, data and ownership');
  await expect(page.locator('a[href="#security"]')).toBeVisible();
  await expect(page.locator('a[href="#price"]')).toBeVisible();
  await expect(page.locator('a[href="#team"]')).toHaveText('Your team, your systems and support');

  const gap = await page.evaluate(() => {
    const links = document.querySelector('.bp-jump');
    const heading = document.querySelector('#price h2');
    if (!links || !heading) return -1;
    return heading.getBoundingClientRect().top - links.getBoundingClientRect().bottom;
  });
  const mobile = testInfo.project.name.startsWith('mobile');
  expect(Math.round(gap)).toBe(mobile ? 44 : 32);
});

test('sitemap lists the three pages', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1440', 'once');
  const index = await (await request.get('/sitemap-index.xml')).text();
  const loc = index.match(/<loc>([^<]+)<\/loc>/)?.[1];
  expect(loc).toBeTruthy();
  const child = await (await request.get(new URL(loc!).pathname)).text();
  for (const path of ['/services', '/process', '/faq']) {
    expect(child).toContain(`https://roadmaplabs.com.au${path}`);
  }
});

for (const path of ['/', '/work', '/about', '/contact', '/blog', '/privacy']) {
  test(`${path} still loads`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });
}
