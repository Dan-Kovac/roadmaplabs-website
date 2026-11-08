# roadmaplabs.com.au

The Roadmap Labs website. Static Astro site, hosted on Vercel. See `BUILD-BRIEF.md` for the spec.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs dist/
npm run preview  # serves dist/
```

## How it's put together

- `src/pages/`: one file per URL. Clean URLs with no trailing slash (`build.format: 'file'` in Astro, `cleanUrls` and `trailingSlash: false` in `vercel.json`).
- `src/layouts/Base.astro`: the `<head>` (title, description, canonical, Open Graph, favicons, font preloads) and the sitewide JSON-LD.
- `src/components/`: Header, Footer, ClosingCTA, Mockup (laptop and phone), Img (AVIF/WebP/JPEG `<picture>`), Faq.
- `src/data/site.ts`: site constants, case studies and FAQ text. The FAQ text renders on the page and in the FAQPage JSON-LD from the same source, so they always match.
- `src/data/schema.ts`: Article, BreadcrumbList and Person JSON-LD.
- `src/styles/`: the design canvas CSS (`rl-tokens`, `bundle`, `rl-motion`, `rl-elevated`) plus `site.css` for fonts and page-level styles.
- `public/`: self-hosted Inter, logos, favicons, share images (`og/`), robots.txt. The sitemap is generated at build time.

## Common edits

- **LinkedIn**: set `SITE.linkedin` in `src/data/site.ts`. It adds the footer link and the `sameAs` in the Organization JSON-LD.
- **Case study publish date**: `SITE.launchDate` in `src/data/site.ts`.
- **Contact form**: posts to Formspree (`xdeeekqw`) with fetch and shows an inline thank-you. Without JavaScript it falls back to a normal POST. `/thanks` exists (noindex) if you want to set it as the redirect in Formspree.
