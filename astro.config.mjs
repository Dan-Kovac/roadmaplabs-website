// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

const EXCLUDE = ['/404', '/thanks', '/intake', '/intake-admin'];

export default defineConfig({
  site: 'https://roadmaplabs.com.au',
  // Clean URLs with no trailing slash: /work, /work/flexfolio. trailingSlash:false redirects /work/ to /work.
  // The Vercel adapter builds pages in directory format (work/index.html), which Vercel serves at /work.
  trailingSlash: 'never',
  // Static output with the Vercel adapter: every page is prerendered, and only routes that opt out
  // with `export const prerender = false` (the /api endpoints) run as serverless functions.
  output: 'static',
  // Intake endpoints are public, unauthenticated form handlers; Vercel's proxy makes Astro's
  // origin check false-positive on POSTs, so the check is disabled. No authenticated state is
  // read or written cross-origin.
  security: { checkOrigin: false },
  adapter: vercel(),
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
