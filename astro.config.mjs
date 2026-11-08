// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const EXCLUDE = ['/404', '/thanks'];

export default defineConfig({
  site: 'https://roadmaplabs.com.au',
  // Clean URLs with no trailing slash: /work, /work/flexfolio. Vercel's cleanUrls
  // serves work.html at /work and trailingSlash:false redirects /work/ to /work.
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  compressHTML: true,
  prefetch: false,
  integrations: [
    sitemap({
      filter: (page) => !EXCLUDE.some((p) => page.replace(/\/$/, '').endsWith(p)),
      serialize(item) {
        item.url = item.url.replace(/\/$/, '') || item.url;
        if (item.url === 'https://roadmaplabs.com.au') item.url = 'https://roadmaplabs.com.au/';
        item.lastmod = new Date().toISOString().slice(0, 10);
        return item;
      },
    }),
  ],
  image: { responsiveStyles: false },
});
