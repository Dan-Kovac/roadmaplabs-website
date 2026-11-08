# Roadmap Labs website: build brief

Everything a fresh session needs to build, deploy and launch roadmaplabs.com.au.

**Source of truth:** the design canvas "Roadmap Labs Website",
https://claude.ai/artifact/PUVcdEiuhb2MGYdeS8hEVX. Build the pages on the
**Website v1** page of the canvas. The **Mobile** page shows the same pages at
390px wide (they import the desktop pages, so the layouts are fluid, not
separate designs). Ignore the **Later** page (Services, Articles, Process,
FAQ, SEO keyword map); none of it is linked from v1.

Read the canvas files with the Artifact tool (`read` with `paths`). Each
artboard is `project/<Name>.dc.html`. Shared parts: `Header`, `Footer`,
`ClosingCTA`. Styles: `project/rl-tokens.css`, `project/rl-motion.css`,
`project/rl-elevated.css`, `project/ds/roadmap-labs/components/bundle.css`.
Copy the copy exactly. It has been through a voice and SEO pass.

## Stack (recommended)

- Static site. Astro is a good fit: per-page `<head>`, components for
  Header/Footer/ClosingCTA, zero JS by default, built-in sitemap.
- Host on Netlify, Vercel or Cloudflare Pages. Custom domain
  `roadmaplabs.com.au`, `www` redirects to the apex (or the reverse, pick one),
  HTTPS forced.
- The only JS needed: the mobile menu toggle in the header, and the FAQ
  `<details>` elements work without JS.

## Pages, URLs and SEO

One H1 per page. Titles under 60 characters, descriptions around 155.
Canonical URL on every page, self-referencing, absolute, no trailing-slash
inconsistency.

| Canvas file | URL | Title tag | H1 |
|---|---|---|---|
| Main | `/` | AI Consultant for Australian Businesses \| Roadmap Labs | The AI consulting partner for established Australian businesses |
| Work | `/work` | AI and Automation Case Studies \| Roadmap Labs | AI and automation case studies |
| CaseCompass | `/work/compass-buyers-agency` | Compass Buyers Agency: Website and Web App \| Roadmap Labs | Compass Buyers Agency |
| CaseReviewBuddy | `/work/reviewbuddy` | ReviewBuddy: Automated Reviews Platform \| Roadmap Labs | ReviewBuddy |
| CaseFlexfolio | `/work/flexfolio` | Flexfolio: Portfolios for Product Managers \| Roadmap Labs | Flexfolio |
| About | `/about` | About Dan Kovac, AI Consultant in Melbourne \| Roadmap Labs | Hi, I'm Dan, an AI consultant helping Aussie businesses scale |
| Contact | `/contact` | Book a Free AI Strategy Session \| Roadmap Labs | A free hour on where AI fits in your business |
| Privacy | `/privacy` | Privacy Policy \| Roadmap Labs | Privacy policy |
| (new) | `/404` | Page not found \| Roadmap Labs | Simple page, link home and to /contact |

Meta descriptions are in each canvas file's `<head>`. Use them as written.

Rewrite every `*.dc.html` link to the URLs above (`Main.dc.html` becomes `/`,
`CaseCompass.dc.html` becomes `/work/compass-buyers-agency`, and so on).

### On every page

- `<html lang="en-AU">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Open Graph and Twitter tags: `og:title`, `og:description`, `og:url`,
  `og:type` (`website`, `article` for case studies), `og:image` (1200x630),
  `og:locale` `en_AU`, `og:site_name` Roadmap Labs, `twitter:card`
  `summary_large_image`. Make one branded share image for the site, plus one
  per case study from its laptop mockup.
- Favicon set (SVG + 180px apple-touch-icon) from the Roadmap Labs logo.
- `robots.txt` allowing everything and pointing at the sitemap.
- XML sitemap of the 8 public pages (not 404). Submit it in Google Search
  Console once live.

### Structured data (JSON-LD)

- Sitewide (in the layout): `ProfessionalService` (also typed
  `Organization`) with name Roadmap Labs, url, logo, email
  dan@roadmaplabs.com.au, address locality Melbourne, region VIC, country AU,
  areaServed Australia, founder Person Dan Kovac, `taxID` ABN 44 108 955 374.
  Add `sameAs` with the LinkedIn company URL once it exists.
- Home: `FAQPage` built from the home page FAQ (7 questions). Contact:
  `FAQPage` from its 4 questions. Questions and answers must match the
  visible text exactly.
- About: `Person` for Dan Kovac (jobTitle AI consultant, worksFor Roadmap Labs).
- Case studies: `Article` with headline, description, image, author Dan Kovac,
  publisher Roadmap Labs, datePublished on launch day.
- `BreadcrumbList` on case studies: Home, Our work, the case study.

## Images

Images on the canvas are uploads (`/_blob/<id>`). Download each from the
artifact (Artifact `read` with the blob's path or asset id) and save them in
the repo with descriptive file names (for example
`compass-buyers-agency-laptop.webp`).

- Serve as WebP/AVIF with a JPEG/PNG fallback, responsive `srcset`, explicit
  `width` and `height` to stop layout shift.
- `loading="lazy"` on everything below the fold. The home hero image and the
  logo load eagerly, and the hero gets `fetchpriority="high"`.
- Keep the alt text from the canvas. Images inside the "More case studies"
  cards are decorative (`alt=""`), which is correct.

## Performance and accessibility

- Self-host Inter (400, 500, 600) as WOFF2 with `font-display: swap` and a
  preload for the main weight, instead of the Google Fonts link. That also
  avoids sending visitor IPs to Google (matches the privacy policy).
- Target Lighthouse 95+ on Performance, Accessibility, Best Practices and SEO
  on mobile.
- Keep the 44px touch targets, visible focus outlines and the
  `prefers-reduced-motion` handling in `rl-motion.css`.
- Check colour contrast on the dark bands and the small grey text.

## Contact form (Formspree)

Already wired in the Contact canvas file. Keep it as is:

- `action="https://formspree.io/f/xdeeekqw"`, `method="POST"`.
- Fields: `name`, `email`, `phone` (required), `website`, `notes` (optional).
- Hidden `_subject` ("New session enquiry from the Roadmap Labs website") and
  the `_gotcha` honeypot.
- Add a thank-you state: either a `/thanks` page (set Formspree's redirect
  setting, or a hidden `_next` field) or submit with fetch and show an inline
  confirmation: "Thanks, Dan will be in touch to find a time." Add `/thanks` to
  `noindex`.
- After launch, submit a real test and confirm the email arrives. Formspree
  asks you to confirm the first submission.

## Analytics and ads

None installed yet. If Google Analytics or Google Ads tags are added, add a
cookie notice and check the privacy policy still matches what's collected
(it already allows for analytics cookies and Google Ads remarketing).

## Launch checklist

- [ ] All 8 pages built at the URLs above, links rewritten, 404 page in place
- [ ] Titles, descriptions, canonicals, OG tags and JSON-LD on every page
      (validate with Google's Rich Results Test)
- [ ] Sitemap and robots.txt live
- [ ] Images optimised, fonts self-hosted, Lighthouse 95+ on mobile
- [ ] Contact form tested end to end, thank-you state works
- [ ] Domain, HTTPS and www redirect working
- [ ] If an old site exists on the domain, 301 its old URLs to the closest new page
- [ ] Google Search Console: verify the domain, submit the sitemap
- [ ] Google Business Profile for Roadmap Labs, Melbourne (backs the local
      "AI consultant Melbourne" searches)

## Still to come (not blocking launch)

- LinkedIn company page URL: add to the footer and to `sameAs`.
- Have the privacy policy checked before Google Ads or analytics go on.
- Articles, Services, Process and FAQ pages are designed on the "Later" page
  of the canvas for a future release.
