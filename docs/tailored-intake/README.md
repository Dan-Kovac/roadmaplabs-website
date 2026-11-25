# Tailored intake (v1, preview only)

Branch `claude/intake-tailored-brief`, built from production (`claude/gracious-newton-ni1d3a`). Nothing here is live. The standard `/intake` works exactly as before for anyone without a brief link.

## What it does

When Dan has already talked to a business, he prepares a **brief**: what we already know, the questions to skip, an opening line, and questions written for that business. The client gets a private link, `/intake?brief=<token>`. Their interview then:

- shows their name, and their logo and brand colour if the brief has them, on the welcome screen and in the chat header
- opens with Harry checking what we know ("From your site I've got that... Is that still the right picture?")
- skips the questions we already know, and lists what we know under **Already know** in the notes panel
- puts the tailored questions in the right place:

  | Stage in the brief | Where Harry asks it |
  |---|---|
  | `winning` | at the start of "Winning work" |
  | `doing` | at the start of "Doing the work" |
  | `running` | at the start of "Running the business" |
  | `connections` | straight after the tools questions |
  | `gaps` | before the last question |
  | `marketing` | before the last question, each followed by one follow-up |

- keeps the standard questions and the per-job questions in the same order, so every client's files come out comparable
- adds two follow-ups to every job: "What do you hate about it?" and "What goes wrong when it's rushed?" (brief interviews only)
- sends the tailored answers in the closing field, in two labelled sections:
  - `--- Tailored questions (from the brief) ---`
  - `--- Gaps and ideas: marketing and growth (from the brief) ---`, which feeds the gaps and ideas file

  They come before the optional growth answers, so if space ever runs short, the growth answers are cut first. Skipped questions are sent as "Not asked: already known from the brief", and the business name comes from the brief.

## How Dan uses it (v1)

1. Open `/intake-admin` and sign in with the back office key (`INTAKE_ADMIN_TOKEN`).
2. Copy the **Claude prompt** from that page into Claude on its best model. Fill in the client's website and your notes. Claude returns the brief as JSON, with `"token": "GENERATE"`.
3. Optional: to quote search figures, also run the **search prompt** (see below) and paste what it returns into the brief's `evidence` list.
4. Paste the JSON into **Check the brief**. The page shows:
   - every problem, in plain words (it won't pass with any)
   - any warnings, such as figures older than 30 days
   - the opening line, what we know (shown to the client, or "to check" and kept private), the skip list, and the tailored questions in interview order
   - the evidence table with pull dates, a fresh random token, and the client link
5. Read it. Change anything that isn't right and check again.
6. **v1 only:** save the JSON (with its new token) as `src/data/briefs/<slug>.json`, commit, and deploy. The link works once that deploy is live. In production this step becomes a Save button (see below).
7. Send the client the link.

## Briefs on this branch

| Brief | Link (local or preview) | Notes |
|---|---|---|
| `inzant.json` | `/intake?brief=tHgzcbHXc9oqSaYcNCY027iAUx9XkYwB` | From their public site only. Not sent to them; nobody at Inzant was contacted. |
| `test-co.json` | `/intake?brief=lcBxk3b3DLjFDLzQzl00ZZDTPWTnLdM9` | Made up for testing the logo, colour, skips, and an unverified figure falling back to the figure-free question. |

What's in the Inzant brief:
- **Known:** facts from inzant.com.au are "confirmed". Everything else is "to check" and never shown to the client: team size, customer count, what Dan discussed, who he spoke to, the brand feel, the colour and the logo.
- **Colour:** a placeholder blue. Swap in their exact colour.
- **Logo:** none yet, because I didn't fetch their site. Add their logo address.
- **Skip:** only S1, the business name. The other items Dan listed (what they do, who they sell to, where, how long, the product, integrations, guided onboarding) aren't questions in today's interview at all. So they appear under "Already know" rather than as skipped questions.
- **Questions:** as provided, plus five marketing questions with no figures.
- **Wording:** "ERP" stays in Dan's opening line and in one question, because it's Inzant's own word for their customers' systems.

## Marketing and growth: figures and evidence

A marketing question may quote a number or a ranking only when the brief backs it.

1. The figure is in the brief's `evidence` list. Each evidence item records:
   - what kind of figure it is
   - the figure itself
   - its source, for example "DataForSEO via Composio (account name)" or "from Dan"
   - the date it was pulled
   - confirmed or unverified
2. The question lists that item in `uses`, and the number in the wording matches the evidence.
3. The question has a `fallback`: the same question with no figure.

The client sees the figure version only if every item it uses is **confirmed**. Otherwise they get the fallback. The back office refuses any marketing question that quotes a number without a sourced evidence item, or that has no fallback. It also warns about evidence older than 30 days. Evidence is never sent to the client's browser. **No figure is ever shown to a client unless it is in the brief with a source.** We never invent or show example numbers.

### How to pull search figures (by hand, through Composio)

Search figures come from DataForSEO, pulled in Claude through Composio by Dan or his assistant, then pasted into the brief by hand. **No search tool or key is wired into the site.**

Paste this into Claude, with Composio's DataForSEO tools connected. Fill in the account name, website, location and terms. The same text is on the back office page.

```
Use the DataForSEO tools in Composio (our Roadmap Labs DataForSEO account: [NAME OF THE DATAFORSEO ACCOUNT CONNECTED IN COMPOSIO]) to pull search figures for a client brief. Read only. Don't change anything in any account.

Client website: [PASTE THE WEBSITE ADDRESS]
Location: Australia[, or the city or region if they're local]
Search terms to check (three to five): [PASTE TERMS, or "suggest five terms a new customer would search for, then use those"]

For each term, get:
1. Monthly searches in that location (the latest monthly average).
2. Where the client's website currently ranks in Google for that term in that location, or "not in the top 100".

Return only a JSON list in this exact format, one item per figure, with today's date as "pulled" (YYYY-MM-DD) and the source as "DataForSEO via Composio ([account name])":
[
  { "id": "e1", "kind": "search-term", "value": "the search term", "source": "DataForSEO via Composio ([account name])", "pulled": "YYYY-MM-DD", "status": "confirmed" },
  { "id": "e2", "kind": "monthly-searches", "value": "1300", "source": "DataForSEO via Composio ([account name])", "pulled": "YYYY-MM-DD", "status": "confirmed" },
  { "id": "e3", "kind": "ranking", "value": "position 14", "source": "DataForSEO via Composio ([account name])", "pulled": "YYYY-MM-DD", "status": "confirmed" }
]
Use "unverified" for any figure the tool marked as an estimate or that you couldn't get directly. Never make up a figure. If something isn't available, leave that item out and say so after the JSON.
```

Then write the marketing question with the figure, list the evidence ids in `uses`, and give it a figure-free `fallback`.

**Needs Dan's decision on cost:** DataForSEO charges per request. Pulling by hand keeps that under Dan's control. Wiring it into the site would need a paid account and a key, and isn't built.

## What's built

| Piece | Where |
|---|---|
| Brief format, checks, client-safe view, output sections | `src/data/brief.ts` |
| Brief files (v1 storage) | `src/data/briefs/*.json` |
| Server-only loader, constant-time token match | `src/lib/briefs.ts` |
| Brief route: POST only, same-site, rate limited, client-safe view only | `src/pages/api/intake-brief.ts` |
| Tailored interview | `src/pages/intake.astro` (only runs with `?brief=`) |
| Back office | `src/pages/intake-admin.astro` |
| Claude prompts | `src/data/brief-prompt.ts` |
| Tests | `tests/intake-brief.test.ts` |

Safety, as tested:
- **Briefs and tokens stay on the server.** They're never in any page's source or script. The page asks the server for the brief and gets only what the client may see: no token, no website, no evidence, no "to check" notes.
- **A wrong or missing token gets the standard interview,** with a plain note: "That link didn't open a prepared interview, so this is the standard one...". The server gives the same answer for a wrong token as for a missing one.
- **The brief route only accepts POST from this site,** and is rate limited (20 tries per 10 minutes per address).
- **The back office:**
  - checks the key on every request, and is switched off (503) if `INTAKE_ADMIN_TOKEN` isn't set
  - stores only a hash of the key in an HttpOnly, SameSite=Strict cookie limited to `/intake-admin`, lasting 8 hours
  - only accepts forms from this site
  - limits sign-in attempts to 8 per 15 minutes
  - is noindex, uncached, kept out of the sitemap, and can't be framed by other sites
- **Brief text is always shown as plain text,** never as HTML, and the checks reject anything that isn't plain text.
- **Logos load without sending the page address.** The address holds the token, so `referrerpolicy="no-referrer"` is set on the logo.
- **A brief interview saves under its own key on the device,** so it never mixes with a standard one.

## What's not built yet

- A Save button. Briefs are files in the repo, so each new brief needs a commit and deploy.
- Turning a brief off or expiring its link. For now, delete the file and deploy.
- AI writing briefs inside the site. Briefs are written by Claude outside the site and reviewed by Dan.
- Any live search data in the site.
- Voice mode with a real agent. The tailored steps are wired into the voice agent's instructions, but untested without an agent.
- On the team route ("Admin / team"), the "winning" and "doing" tailored questions aren't asked, because that route doesn't go through those parts. The rest still are.

## What production needs

1. **A Supabase table for briefs** instead of files. For example `intake_briefs (slug, token_hash, brief jsonb, created_at, disabled_at)`, with row-level security on and no public access. Only the server, using the service key, reads or writes it. Store a hash of the token, not the token. The back office gets a Save and a Turn off button.
2. **`INTAKE_ADMIN_TOKEN` in Vercel,** for Production and Preview: a long random value, kept in a password manager. Until it's set, `/intake-admin` stays switched off.
3. **An AI spend cap before any live AI tailoring.** Nothing in v1 calls an AI. If briefs are ever written by AI inside the site, set a spend limit in the AI provider first, and add a shared rate limit (for example Vercel KV or Upstash).
4. **Dan's review of the Inzant brief** (colour, logo, the "to check" items) before any link is sent.

## Things to know

- **A full brief interview is long.** Inzant, as briefed, is about 79 steps if the client goes through everything: 18 tailored questions, 5 marketing questions with follow-ups, and two extra follow-ups per job. Dan may want fewer questions per stage.
- **Answer length.** Tailored answers share the closing field with everything else. The server keeps 20,000 characters per field, so very long answers could be cut. The growth answers go first, then the tailored ones, each with a clear "cut to fit" marker.

## Screenshots (in this folder)

| Files | What they show |
|---|---|
| `before-welcome-*`, `before-opening-*`, `before-notes-panel-*` | the standard interview, unchanged |
| `after-inzant-welcome-*`, `-opening-*`, `-notes-panel-*`, `-tailored-winning-*`, `-job-hate-*`, `-marketing-*`, `-marketing-follow-up-*`, `-share-*`, `-finish-*` | the Inzant brief |
| `after-testco-*` | the test brief with a logo and its own colour |
| `after-wrong-token-*` | a wrong link: the standard interview with a plain note |
| `admin-signin-*`, `admin-preview-inzant-*`, `admin-flags-figure-*`, `admin-warns-stale-*` | the back office |

Each set is at desktop (1280 wide) and mobile (390 wide).
