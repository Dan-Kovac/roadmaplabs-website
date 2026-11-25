# /intake: user testing and security review

Branch `claude/intake-growth-addon`, preview only. Tested 25 November 2026 against the local build of this branch, using fake data only ("Test Co (delete me)"). Nothing was sent to Jotform or Supabase, and no dummy submission was made. Every send in the tests was caught inside the test browser before it left the machine.

Screenshots: `docs/testing/` (test runs, error messages) and `docs/intro-redesign/` (before/after of every wording change).

---

## 1. Critical and high risks

### 1.1 There is no login. Anyone with the link can fill in the intake and send it (High)

The "name as username and a simple password" screen exists only as a visual mock (`/intake?mock=login`). It checks nothing, stores nothing and gates nothing. The `?client=` part of the link is only a label on the screen and in the submission.

What this means today:
- **One client can't see another client's answers.** There is no way to read answers back from the server. Answers live in the person's own browser until they press Send, then go straight to Jotform. No page or API returns them.
- **Anyone can send a submission under any client name.** Nothing proves who filled it in.
- **Anyone can create spam submissions in Jotform.** I added a same-site check and a per-address limit (see 2.1). A determined script can still fake the headers, so this slows people down; it doesn't stop them.

Needs Dan's call: real sign-in (for example a one-time link per client, or a short code tied to the client in Supabase), checked on the server before the send and recording endpoints accept anything.

### 1.2 Screen recordings: open upload slots, and viewing links that last a year (High)

How it works now (`src/pages/api/intake-recording.ts`):
- **Bucket:** private. Created by code and by `supabase/migrations/20261117000000_intake_recordings_bucket.sql` with `public: false`, a 50MB file limit and only `video/webm` and `video/mp4` allowed. No storage rules are added, so only the server key can touch it. I could not confirm the live settings (see 4).
- **Upload links:** Supabase signed upload URLs, one fresh random path per recording (date, client-name slug, random ID). They work for one upload. Supabase's default lifetime is 2 hours; the code doesn't shorten it. Size and type are enforced by the bucket.
- **Viewing links:** after upload, the server makes a signed viewing link valid for **one year**. That link goes into the Jotform submission. Anyone who sees the submission, or a forwarded email of it, can watch the recording for a year.
- **No sign-in:** anyone can ask for upload slots. Before this change, a script could fill the bucket with 50MB files with no limit. Now: same-site only, 12 requests per address per 30 minutes, per server instance.

Needs Dan's call: tie uploads to a signed-in client (1.1), shorten the viewing link (for example 7 days, with Dan's team making fresh links from the stored path when needed), and set a storage alert or quota in Supabase.

### 1.3 Nothing is deleted. The "deleted after handoff" claim is not true yet (High, compliance)

What exists, exactly:

| Where | What | How long |
|---|---|---|
| The person's browser (`localStorage`, key `rl-intake-v3`) | Every answer, links, the voice/chat choice. Attached files are in memory only. | Until they press Send (verified: cleared after a successful send), press "Start over", or clear their browser. If they never send, it stays on that device, including on a shared computer. |
| Jotform (form 263198186491065) | All answers, attached files, links, recording links, client name, role | Kept until someone deletes them in Jotform. No code deletes anything. |
| Supabase storage (`intake-recordings`) | Screen recordings | Kept until someone deletes them. No code deletes anything. |
| Signed viewing links in Jotform | Access to each recording | One year |
| ElevenLabs (voice mode, once switched on) | The voice call; ElevenLabs keeps conversation history by its own settings | Per the ElevenLabs agent's settings |
| OpenRouter / Anthropic (only if the chat helper key is set) | A question the person types to Harry, up to 600 characters, plus the question on screen | Per OpenRouter's policy |

No handoff process, scheduled job or deletion step exists in this repo.

The privacy page (`/privacy`) names only Formspree. It does not mention Jotform, Supabase, ElevenLabs or OpenRouter, several of which store data in the United States. Needs Dan's call, ideally with advice: update the privacy page, decide how long intake data is kept, and add a deletion step (manual checklist or a scheduled job).

### 1.4 The AI chat helper can be used to spend money (Medium, High if the key is set)

`/api/chat` passes a visitor's question to Claude Haiku through OpenRouter when `OPENROUTER_API_KEY` is set. I can't see Vercel's settings, so I don't know if it is.

Before: anyone could call it with no limit, 2,000 characters in and 300 tokens out each time. The on-screen question was pasted into the system instructions, so a caller could rewrite them.

Now: same-site only, 15 calls per address per 10 minutes (per instance), 600 characters in (the page only ever sends under 240), and the on-screen question goes in the visitor's message, not the system instructions. The instructions also tell Harry to treat visitor text as data. A real cap needs a shared rate limit store (Vercel KV or Upstash) or a spend limit in OpenRouter. Needs Dan's call.

### 1.5 Answers will be read by AI later: treat them as untrusted (Medium)

Answers are stored word for word, as they should be. In testing, `<script>alert(1)</script>` and instructions-style text went into the submission unchanged. They are never shown as HTML on this page (checked: no answer, link or file name is ever inserted as HTML), so the page itself is safe.

The risk is downstream. Whatever process later feeds these answers, or uploaded files, to an AI to write the client's files must treat them as data. Someone could write "ignore your instructions and..." in an answer or a PDF. Whoever views submissions in Jotform also relies on Jotform escaping them, which I could not check.

---

## 2. What I fixed

Small commits on this branch:

| Commit | What |
|---|---|
| `dfbe5e2` | API protection: same-site check, rate limits, file limits, chat prompt |
| `b6fcde5` | Page: clearer errors, file and link checks, keyboard and contrast fixes |
| `29680aa` | Security headers |
| `b429158` | Plain words in place of jargon (chat, notes panel, header, voice prompt) |
| `b5a1119` | ElevenLabs widget script pinned to a fixed version |

### 2.1 Security

- **Same-site check on all three API routes** (`src/lib/api-guard.ts`). A call from another website, or with no browser origin headers, now gets "Please use the form on roadmaplabs.com.au." (403). Tested locally: the page's own calls pass, other origins and header-less calls are refused.
- **Rate limits per IP address:**
  - send: 6 per 15 minutes
  - recordings: 12 per 30 minutes
  - chat: 15 per 10 minutes

  Over the limit, the person sees "That's a lot of requests in a short time. Please wait a few minutes and try again." Tested locally: the 7th send and the 12th recording request are refused. These limits live in one server instance's memory, so on Vercel they are best effort (see 3).
- **Guard runs first.** The same-site check and rate limit now run before anything else. Previously the "not set up" check came first.
- **Files:**
  - Program and script files are refused, in the page and on the server: .exe, .msi, .bat, .cmd, .com, .scr, .ps1, .vbs, .js, .mjs, .jar, .sh, .app, .dmg, .apk, .html, .svg, .hta, .lnk, .dll.
  - No more than 20 files.
  - The 4MB total limit was already there.
- **Links:** only web addresses (http or https) are kept. Before, any text, including `javascript:alert(1)`, was stored as a "link". Nothing ever made these clickable on this page, but they went to Jotform.
- **Chat prompt hardening:** see 1.4.
- **Headers** (`vercel.json`):
  - `/intake` now also sends `Content-Security-Policy: frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'` and `Cross-Origin-Opener-Policy: same-origin`.
  - `/api/*` sends `Cache-Control: no-store` and `X-Robots-Tag: noindex`.
  - HSTS, nosniff, X-Frame-Options, Referrer-Policy and Permissions-Policy were already in place.
  - I did not add a script-blocking CSP, because the voice widget loads code from unpkg and I can't test it without the agent (see 3).
- **Voice widget script pinned:** `https://unpkg.com/@elevenlabs/convai-widget-embed` (whatever was newest) changed to `@0.25.2/dist/index.js`. An unpinned script runs whatever ElevenLabs publishes next, with full access to the page.

### 2.2 Bugs and user experience

- **Failed network on Send:**
  - Before: "Failed to fetch Nothing is lost: your answers are still saved here."
  - After: "We couldn't reach our server. Check your internet connection, then try again. Nothing is lost: your answers are still saved here."
  - The same fix applies to recording uploads.
  - Screenshots: `docs/testing/before-send-failed-*.png` and `after-send-failed-*.png`.
- **A typed "link" that isn't a web address** used to vanish with no message. Now:
  - "That doesn't look like a web link. Paste the full address from your browser, starting with https://"
  - or "You've already added that link."
  - Screenshots: `docs/testing/before-invalid-link-*.png` and `after-invalid-link-*.png`.
- **Very long answers:** the server keeps at most 20,000 characters per field and used to cut longer answers silently. The answer box now stops at 20,000 characters, so nothing is cut without the person seeing it.

### 2.3 Accessibility

- **Keyboard trap:** keyboard focus could land on invisible buttons inside the hidden voice panel in chat mode. The panel is now `inert` while hidden.
- **Contrast:** "Your role only changes which questions you're asked." was 4.48:1, just under the 4.5:1 minimum. It now uses the darker secondary text colour.
- **Answer box label:** the box now has an accessible name, "Your answer". Before, a screen reader only had the placeholder text.

### 2.4 Jargon removed

Full exact old and new wording is in the appendix at the end. The main changes:

| Where | Before | After |
|---|---|---|
| Side panel title | Your folder | Your notes |
| Side panel note | Roadmap Labs writes the finished files after the interview. | What we've picked up so far. After the interview, we write it up properly as clear instructions for AI. |
| Panel items | README.md, brand.md, customer.md, reference.md, workflows/, growth.md, quoting.md | Your business, Your brand, Your customers, Your tools, Your jobs, Growth ideas, and each job by its own name |
| Panel levels | Empty / Thin / Solid | Nothing yet / A start / Plenty |
| Panel footnote | Depth is a rough, early guide from your answers: empty, thin or solid. Provisional rules. | The bars are a rough guide to how much we have on each topic so far. |
| Header | Tool stack · Test Co OS/ | Your tools · Test Co |
| Section names | Setup, Tool stack, The journey, Acquire, Deliver, Operate | The basics, Your tools, How the work flows, Winning work, Doing the work, Running the business |
| Progress lines | README.md has the business and what you've handed over, but only a little on how you use AI so far. | On your business, we now have the business and what you've handed over, but only a little on how you use AI so far. |
| Starting a job | Let's start with Quoting. It gets its own file: workflows/quoting.md. | Let's start with Quoting. |
| Job questions | ...This becomes the skill: the written instructions. / ...the quality bar in the skill. / ...a reference file next to the skill... / That's the routine. | ...This becomes the written instructions for the job. / This tells AI what a good result is. / We keep it with the instructions so AI can follow it. / That tells AI when to step in. |
| List questions | Name each workflow, one per line | List each way / List the main jobs, one per line |
| Milestone button | Keep going into the journey | Keep going |
| Finish screen | Everything you shared becomes files: your README, brand, customer and reference files, plus one workflow file for each job you described. | We'll turn what you shared into clear written notes on your business, your brand, your customers and your tools, plus step-by-step instructions for each job you described. |
| Finish list | 3 workflows mapped | 3 jobs walked through |
| Voice agent prompt | ...files in one folder: workflows, routines and skills... use those words... | Plain words only: "job", "the written instructions for the job", "what starts it". Never names files, folders, the journey or Acquire/Deliver/Operate. |

Before/after screenshots, desktop and mobile, are in `docs/intro-redesign/`:
- `before-jargon-*.png` and `after-jargon-*.png`
- screens: `panel`, `milestone`, `journey-start`, `drill-steps`, `drill-example`, `drill-starts`, `another-one`, `finish`

What I deliberately did not change:
- **Kept as asked:** the "Core takes about 10 minutes" chip, and the matching "That's the core done" milestone.
- **Behind the scenes:** the labels sent to Jotform ("Workflow:", "More workflows:", "Acquire:") and the internal file names. Dan's team reads these, and the payload tests depend on them.

---

## 3. What needs Dan's call

1. **Sign-in** (1.1). Real per-client access before anything is accepted.
2. **Recording links** (1.2). Shorten the one-year viewing link; add a storage quota or alert.
3. **Retention and deletion** (1.3). Decide how long Jotform, Supabase and ElevenLabs keep intake data, then build or document the deletion step. Until then, don't promise "deleted after handoff".
4. **Privacy page.** Add Jotform, Supabase, ElevenLabs and OpenRouter, and say that data is stored overseas.
5. **Shared rate limiting.** Vercel KV or Upstash, so limits hold across all server instances. Set a spend cap in OpenRouter (1.4).
6. **Keys.** Nothing in this repo or its history looks like a leaked secret, so nothing needs rotating because of this review. Where things live:
   - The Jotform key, Supabase service key and OpenRouter key are read only in server code: `src/pages/api/*`.
   - `PUBLIC_ELEVENLABS_AGENT_ID` is public by design.
   - `.env.example` holds the Supabase URL and the publishable key. Both are public by design, so the safety of that Supabase project rests on its row rules, which I couldn't check (see 4).
   - `intake-submit.ts` sends the Jotform key in a URL query string when it reads a submission back (server to Jotform only). Jotform's API requires this for that call. It's fine, but it means the key can appear in Jotform-side logs.
7. **Voice agent prompt.** `docs/intake-voice-agent.md` is updated, but the live agent reads its prompt from the ElevenLabs dashboard. Paste the new system prompt there when voice goes live.
8. **Full Content-Security-Policy.** Lock scripts to this site plus the pinned unpkg file and ElevenLabs hosts, after testing with a real agent. Add a Subresource Integrity hash for the pinned widget file.
9. **Intro screen wording.** The intro screens still say "AI agents", "files and folders" and show `README.md`, `workflows/`, `routines/`, `skills/` and `workflows/quoting.md` in the example boxes. That copy and those boxes were specified earlier, with captions that explain them, so I left them. Say if they should change too.
10. **Small UX gaps found in testing (not changed):**
    - There is no way to go back and edit an earlier answer. Only the role can be changed, from Your notes.
    - The name of a job is taken from the first line of whatever is typed, so a sentence becomes the job name.
    - "CRM" appears in one question: "What's your CRM (or the nearest thing: a spreadsheet, an inbox)...". It explains itself, but it is still a term.
    - Each job's answers are combined into one Jotform field. Very long answers across one job (over 20,000 characters together) would still be cut on the server.

---

## 4. What I could not test

- **The Vercel preview.** This environment can't reach vercel.app, so I couldn't load the preview or confirm its build. Everything was tested against the local build of the same code.
- **Real Jotform sends.** No Jotform key here, and I didn't make a dummy submission. Sends were checked by catching them in the test browser: 23 fields, emoji and pasted text intact. The "not connected" and failure paths were tested for real.
- **Real Supabase uploads, and the live bucket and row rules.** The site's Supabase project is not in the Supabase account connected to this session; only two unrelated projects are visible. The bucket settings above come from the code and migration, not the live project.
- **A real screen picker on real browsers, mic narration mixed into a recording, and a full 5-minute recording.**
  - Tested with a fake screen: start, timer, stop, "Stop sharing", upload flow, server error, "not switched on yet", permission denied, double click.
  - The 5-minute and 45MB stops were checked by reading the code, not by recording for 5 minutes.
- **Voice mode with a real agent.** No agent ID is set. With none set, the person sees "Voice interview coming online. Harry's voice is nearly ready. For now you can still talk your answers: the mic in the chat turns speech into text." plus a button back to chat. That's clear (screenshot `docs/testing/voice-not-set-up-desktop.png`).
- **Speech-to-text (the mic button).** It needs a real browser with a microphone.
- **The AI chat helper's replies.** No OpenRouter key. With none, questions are treated as answers, which works.
- **Real screen readers** (VoiceOver, NVDA, TalkBack), **real phones**, and **iOS Safari**, where screen recording isn't available. On those, the tip screen shows a note to attach screenshots or a Loom link instead.
- **Rate limits on Vercel across several server instances.**

---

## 5. Test log

All runs used reduced motion, fake data, and sends caught in the browser.

| Run | Result |
|---|---|
| Owner, desktop 1280 and mobile 390 | Welcome, intro, role, all core questions, milestone (kept going), all three parts with one job each, growth (8 questions), last question, share, Send, finish screen. 54 steps, 10 skipped. No errors. No sideways scrolling. Answers cleared from the browser after sending. |
| Marketing, desktop and mobile | Same, in the marketing order. 54 steps. No errors. |
| Admin/team, desktop and mobile | Shorter team route (25 steps, "Your week", and no growth offer on this route). No errors. |
| Refresh mid-way (step 6) | Picks up where it left off: same 5 answers, "Welcome back. Picked up where you left off" with "Start over". |
| Very long answer (32,500 characters) | Accepted before the fix (the server would have cut it at 20,000). The box now stops at 20,000. |
| Empty answer | Send does nothing; "Skip for now" records "to fill". |
| Emoji, pasted multi-line text, `<b>` and `<script>` text | Shown as plain text, sent unchanged. |
| Slow send (6 seconds) | Button shows "Sending…", then the finish screen. |
| Failed send | Plain error and "Try again"; answers kept (fixed wording, see 2.2). |
| Big file (5MB) | "That's too big to send through the page (about 4MB in total). Put it in Google Drive or Dropbox and paste the link instead." |
| .exe and .html files | Refused with a plain message (new). |
| 25 files | First 20 kept, then a plain message (new). |
| Links: `docs.google.com/...` / `javascript:` / plain words / `ftp://` | Kept / refused / refused / refused (new messages). |
| Screen recording | Denied, cancelled, stopped from the browser bar, server error, "not switched on", double click: all handled with plain messages. |
| Voice mode, no agent | Clear "coming online" message, and a way back to chat. |
| Keyboard only | Tab order: site menu, Chat/Voice switch, Start. Then Next/arrow keys through the intro, focus lands in the answer box, Enter sends, focus returns to the box. Escape closes the intro and Your notes. |
| Automated accessibility checks (axe, WCAG 2 A and AA) | Welcome, intro screens, every chat stage, milestone, growth offer, share and finish: no issues left after the fixes in 2.3. |
| Reduced motion | No looping animations run on any screen. |

---

## Appendix: exact old and new wording (jargon pass)

Each item is copied from the code. Text inside `${...}` is filled in on the page, for example with the business or job name.

#### Questions and section text (src/data/intake.ts)
- Old:

  ```
  { n: 0, title: 'Setup', recap: 'the setup', intro: 'First, the basics, which go in your README.md.' }
  ```
  New:

  ```
  { n: 0, title: 'The basics', recap: 'the setup', intro: 'First, the basics about the business.' }
  ```
- Old:

  ```
  { n: 1, title: 'AI today', recap: 'your AI today', intro: 'Next, how AI shows up in the business today, which also goes in your README.md. Small jobs count.' }
  ```
  New:

  ```
  { n: 1, title: 'AI today', recap: 'your AI today', intro: 'Next, how you use AI in the business today. Small jobs count.' }
  ```
- Old:

  ```
  { n: 2, title: 'Tool stack', recap: 'your tool stack', intro: 'Next, your tool stack, which goes in reference.md.' }
  ```
  New:

  ```
  { n: 2, title: 'Your tools', recap: 'your tool stack', intro: 'Next, the software and tools you use day to day.' }
  ```
- Old:

  ```
  title: 'Acquire',
  ```
  New:

  ```
  title: 'Acquire',
        /** What people see. `title` stays as the label in the Jotform payload. */
        label: 'Winning work',
  ```
- Old:

  ```
  title: 'Deliver',
  ```
  New:

  ```
  title: 'Deliver',
        label: 'Doing the work',
  ```
- Old:

  ```
  title: 'Operate',
  ```
  New:

  ```
  title: 'Operate',
        label: 'Running the business',
  ```
- Old:

  ```
  text: 'How do new customers and business come in? Name each workflow, one per line: marketing, word of mouth, partnerships, outbound, anything.',
  ```
  New:

  ```
  text: 'How do new customers and business come in? List each way, one per line: marketing, word of mouth, partnerships, reaching out to people, anything.',
  ```
- Old:

  ```
  intro: 'Now the journey, in three parts: how work comes in, how it gets done, and what runs around it. Each workflow you describe becomes its own workflow file. First, how new business comes in.',
  ```
  New:

  ```
  intro: "Now, how the work flows, in three parts: how work comes in, how it gets done, and what runs around it. For each job you name, I'll ask a few questions so we can write down how it's done. First, how new business comes in.",
  ```
- Old:

  ```
  text: 'How does the work you sold actually get done and delivered? Name each workflow, one per line.',
  ```
  New:

  ```
  text: 'How does the work you sold actually get done and delivered? List the main jobs, one per line.',
  ```
- Old:

  ```
  text: 'What runs around the work: looking after customers, keeping them happy, reaching back out, running the business day to day? Name each workflow, one per line.',
  ```
  New:

  ```
  text: 'What runs around the work: looking after customers, keeping them happy, reaching back out, running the business day to day? List the main jobs, one per line.',
  ```
- Old:

  ```
  text: 'Walk me through it step by step. This becomes the skill: the written instructions.' }
  ```
  New:

  ```
  text: 'Walk me through it step by step. This becomes the written instructions for the job.' }
  ```
- Old:

  ```
  text: 'What does good look like? This becomes the quality bar in the skill.' }
  ```
  New:

  ```
  text: 'What does good look like? This tells AI what a good result is.' }
  ```
- Old:

  ```
  text: 'Do you have a real example? It becomes a reference file next to the skill: a real email, proposal, checklist or screenshot.' }
  ```
  New:

  ```
  text: 'Do you have a real example, like an email, proposal, checklist or screenshot? We keep it with the instructions so AI can follow it.' }
  ```
- Old:

  ```
  text: "What starts it: a time or an event? That's the routine." }
  ```
  New:

  ```
  text: 'What starts it: a set time, or something that happens? That tells AI when to step in.' }
  ```

#### Your notes panel (src/data/intake-depth.ts)
- Old:

  ```
  export const DEPTH_LABEL: Record<Depth, string> = { empty: 'Empty', thin: 'Thin', solid: 'Solid' };
  ```
  New:

  ```
  export const DEPTH_LABEL: Record<Depth, string> = { empty: 'Nothing yet', thin: 'A start', solid: 'Plenty' };
  ```
- Old:

  ```
  [2, 'what good looks like', 'no quality bar yet'],
  ```
  New:

  ```
  [2, 'what good looks like', 'not what good looks like yet'],
  ```

#### Growth offer (src/data/intake-growth.ts)
- Old:

  ```
  text: "That's the journey done. There are eight optional growth questions,
  ```
  New:

  ```
  text: "That covers how the work flows. There are eight optional growth questions,
  ```

#### Chat, panel, header and finish (src/pages/intake.astro)
- Old:

  ```
  description="The Roadmap Labs client intake: answer the business OS interview by chat or by voice, and share any files or links that help."
  ```
  New:

  ```
  description="The Roadmap Labs client intake: answer a short interview about your business by chat or by voice, and share any files or links that help."
  ```
- Old:

  ```
  aria-label="Your folder: what we've captured so far"
  ```
  New:

  ```
  aria-label="Your notes: what we've captured so far"
  ```
- Old:

  ```
  <span class="ik-panel__eyebrow">Your folder</span>
  ```
  New:

  ```
  <span class="ik-panel__eyebrow">Your notes</span>
  ```
- Old:

  ```
  aria-label="Close your folder"
  ```
  New:

  ```
  aria-label="Close your notes"
  ```
- Old:

  ```
  <p class="ik-panel__note">Roadmap Labs writes the finished files after the interview.</p>
  ```
  New:

  ```
  <p class="ik-panel__note">What we've picked up so far. After the interview, we write it up properly as clear instructions for AI.</p>
  ```
- Old:

  ```
  <p class="ik-panel__fine">Depth is a rough, early guide from your answers: empty, thin or solid. Provisional rules.</p>
  ```
  New:

  ```
  <p class="ik-panel__fine">The bars are a rough guide to how much we have on each topic so far.</p>
  ```
- Old:

  ```
  <p class="ik-finish__lead">Everything you shared becomes files: your README, brand, customer and reference files, plus one workflow file for each job you described. We'll follow up within 2 business days.</p>
  ```
  New:

  ```
  <p class="ik-finish__lead">We'll turn what you shared into clear written notes on your business, your brand, your customers and your tools, plus step-by-step instructions for each job you described. We'll follow up within 2 business days.</p>
  ```
- Old:

  ```
  const CHOICE_TEXT = "That's the core done, about 10 minutes. Want to keep going into the journey? It's about 20 more minutes
  ```
  New:

  ```
  const CHOICE_TEXT = "That's the core done, about 10 minutes. Want to keep going? It's about 20 more minutes
  ```
- Old:

  ```
  [qid, `${J.title} workflow ${p + 1}`]
  ```
  New:

  ```
  [qid, `${J.label}: job ${p + 1}`]
  ```
- Old:

  ```
  const jTitle = (j: J) => (teamWeek(j) ? 'Your week' : JOURNEY[j].title);
  ```
  New:

  ```
  const jTitle = (j: J) => (teamWeek(j) ? 'Your week' : JOURNEY[j].label);
      /** "Another one for winning work?" */
      const anotherText = (j: J) => (teamWeek(j) ? 'Another task from your week?' : `Another one for ${JOURNEY[j].label.toLowerCase()}?`);
  ```
- Old:

  ```
  case 'another': return teamWeek(s.j) ? 'Another task from your week?' : `Another one in ${JOURNEY[s.j].title}?`;
  ```
  New:

  ```
  case 'another': return anotherText(s.j);
  ```
- Old:

  ```
  s?.type === 'name' ? 'Name the workflow…'
  ```
  New:

  ```
  s?.type === 'name' ? 'Name the job…'
  ```
- Old:

  ```
  const folder = folderName();
        let label = '';
  ```
  New:

  ```
  const folder = displayName();
        let label = '';
  ```
- Old:

  ```
  else if (s.type === 'gchoice') { label = `Journey done · ${folder}`; pct = 95; }
  ```
  New:

  ```
  else if (s.type === 'gchoice') { label = `Main questions done · ${folder}`; pct = 95; }
  ```
- Old:

  ```
  s.type === 'choice' ? "That's the core done. Into the journey, or finish here?"
  ```
  New:

  ```
  s.type === 'choice' ? "That's the core done. Keep going, or finish here?"
  ```
- Old:

  ```
  interface FolderFile { path: string; state: FileState; kind: 'core' | 'docs' | 'workflow' | 'growth' }
  ```
  New:

  ```
  interface FolderFile { path: string; state: FileState; kind: 'core' | 'docs' | 'workflow' | 'growth'; name?: string }
      /** What people see in place of file names. The paths stay internal. */
      const FILE_LABEL: Record<string, [label: string, topic: string]> = {
        'README.md': ['Your business', 'your business'],
        'brand.md': ['Your brand', 'your brand'],
        'customer.md': ['Your customers', 'your customers'],
        'reference.md': ['Your tools', 'your tools'],
        'growth.md': ['Growth ideas', 'growth'],
      };
      const labelOf = (f: FolderFile) => (f.kind === 'workflow' ? f.name ?? 'A job' : FILE_LABEL[f.path]?.[0] ?? f.path);
      const topicOf = (f: FolderFile) => (f.kind === 'workflow' ? `"${f.name}"` : FILE_LABEL[f.path]?.[1] ?? f.path);
  ```
- Old:

  ```
  const folderName = () => folderFor(answers.get(CORE_QUESTIONS[0].qid));
  ```
  New:

  ```
  const folderName = () => folderFor(answers.get(CORE_QUESTIONS[0].qid));
      /** The business name as people say it (no "OS/"), or "Your business" until one is given. */
      const displayName = () => businessName(answers.get(CORE_QUESTIONS[0].qid)) || 'Your business';
  ```
- Old:

  ```
  out.push({ path: `workflows/${f}`, state: workflow(pr.answers), kind: 'workflow' });
  ```
  New:

  ```
  out.push({ path: `workflows/${f}`, state: workflow(pr.answers), kind: 'workflow', name: pr.name });
  ```
- Old:

  ```
  /** One line about a file, in the system's words: "reference.md has your tools, but not costs yet." */
      function describe(path: string) {
        const f = fileOf(path);
        if (!f || f.state.depth === 'empty') return `${path} is still empty; we'll fill it in on the call.`;
        if (f.state.depth === 'solid') return `${path} is solid: ${listJoin(f.state.has)}.`;
        return f.state.has.length ? `${path} has ${listJoin(f.state.has)}, but ${f.state.gap}.` : `${path} has a start, but ${f.state.gap}.`;
      }
  ```
  New:

  ```
  /** One line about what we have, in plain words: "On your tools, we now have your tools and your CRM, but not costs yet." */
      function describe(path: string) {
        const f = fileOf(path);
        if (!f) return '';
        const topic = topicOf(f);
        if (f.state.depth === 'empty') return `Nothing yet on ${topic}; we'll cover it on the call.`;
        if (f.state.depth === 'solid') return `That's plenty on ${topic}: ${listJoin(f.state.has)}.`;
        return f.state.has.length ? `On ${topic}, we now have ${listJoin(f.state.has)}, but ${f.state.gap}.` : `We have a start on ${topic}, but ${f.state.gap}.`;
      }
  ```
- Old:

  ```
  r.append(el('span', 'ik-file__name', f.path.replace(/^workflows\//, '')));
  ```
  New:

  ```
  r.append(el('span', 'ik-file__name', labelOf(f)));
  ```
- Old:

  ```
  depth.setAttribute('aria-label', `Depth: ${DEPTH_LABEL[f.state.depth].toLowerCase()}`);
  ```
  New:

  ```
  depth.setAttribute('aria-label', `How much we have: ${DEPTH_LABEL[f.state.depth].toLowerCase()}`);
  ```
- Old:

  ```
  dir(folderName());
  ```
  New:

  ```
  dir(displayName());
  ```
- Old:

  ```
  dir('workflows/', 'ik-dir--sub');
  ```
  New:

  ```
  dir('Your jobs', 'ik-dir--sub');
  ```
- Old:

  ```
  tree.append(el('p', 'ik-placeholder', 'One file for each workflow you name in the journey.'));
  ```
  New:

  ```
  tree.append(el('p', 'ik-placeholder', 'Each job you walk us through shows up here.'));
  ```
- Old:

  ```
  const paths = procs[j].map((pr, p) => (pr && !pr.skipped ? workflowPath(j, p) : '')).filter(Boolean);
        const title = JOURNEY[j].title;
        return paths.length ? `That's ${title} captured: ${listJoin(paths)}.` : `That's ${title} done; we'll go through it on the call.`;
  ```
  New:

  ```
  const names = procs[j].filter((pr) => pr && !pr.skipped).map((pr) => pr!.name);
        const title = jTitle(j).toLowerCase();
        return names.length ? `That's ${title} covered: ${listJoin(names)}.` : `That's ${title} done; we'll go through it on the call.`;
  ```
- Old:

  ```
  if (route() === 'team' && j === 2) return "Let's start with your own week. Each task you name becomes its own workflow file.";
  ```
  New:

  ```
  if (route() === 'team' && j === 2) return "Let's start with your own week. For each task you name, I'll ask a few questions so we can write down how it's done.";
  ```
- Old:

  ```
  return ['Now how new business comes in. Each workflow you describe becomes its own workflow file.',
  ```
  New:

  ```
  return ["Now, how new business comes in. For each one you name, I'll ask a few questions so we can write down how it's done.",
  ```
- Old:

  ```
  await harrySays(s.p === 0 ? `Let's start with ${name}. It gets its own file: ${workflowPath(s.j, s.p)}.` : `Next: ${name}, in ${workflowPath(s.j, s.p)}.`);
  ```
  New:

  ```
  await harrySays(s.p === 0 ? `Let's start with ${name}.` : `Next: ${name}.`);
  ```
- Old:

  ```
  `${recapOf(last)}${fromJourney ? " That's the journey done." : ''} One last question.`
  ```
  New:

  ```
  `${recapOf(last)}${fromJourney ? ' That covers how the work flows.' : ''} One last question.`
  ```
- Old:

  ```
  else if (s.type === 'list') section(`${partLabel('journey')} · The journey`, jTitle(s.j));
  ```
  New:

  ```
  else if (s.type === 'list') section(`${partLabel('journey')} · How the work flows`, jTitle(s.j));
  ```
- Old:

  ```
  section(`${JOURNEY[s.j].title} · workflow ${s.p + 1} of up to ${MAX_PROCESSES}`, procs[s.j][s.p].name, true);
  ```
  New:

  ```
  section(`${jTitle(s.j)} · job ${s.p + 1} of up to ${MAX_PROCESSES}`, procs[s.j][s.p].name, true);
  ```
- Old:

  ```
  ? option('Keep going into the journey', 'About 20 min: how work comes in, gets done and gets looked after', true,
  ```
  New:

  ```
  ? option('Keep going', 'About 20 min: how work comes in, gets done and gets looked after', true,
  ```
- Old:

  ```
  opts.push({ label: `No, move on${s.j < 2 ? ` to ${JOURNEY[s.j + 1].title}` : ''}`, v: 'done' });
  ```
  New:

  ```
  opts.push({ label: `No, move on${s.j < 2 ? ` to ${JOURNEY[s.j + 1].label.toLowerCase()}` : ''}`, v: 'done' });
  ```
- Old:

  ```
  ? `That was the core, about 10 minutes. ${describe('reference.md')} Keep going into the journey? About 20 more minutes on how work comes in, gets done and gets looked after; each job you describe becomes a workflow file. Or finish here.`
  ```
  New:

  ```
  ? `That was the core, about 10 minutes. ${describe('reference.md')} Keep going? About 20 more minutes on how work comes in, gets done and gets looked after. For each job you describe, we write down how it's done. Or finish here.`
  ```
- Old:

  ```
  Keep going into your tools and the rest of the journey? Or finish here.`
  ```
  New:

  ```
  Keep going with your tools and how the work gets done? Or finish here.`
  ```
- Old:

  ```
  s.echo = "Thanks. I'll carry on where we were. Your role only changes which questions I ask; you can change the focus from your folder panel.";
  ```
  New:

  ```
  s.echo = "Thanks. I'll carry on where we were. Your role only changes which questions I ask; you can change it any time under Your notes.";
  ```
- Old:

  ```
  prompt: 'What would you call that workflow, in a few words?'
  ```
  New:

  ```
  prompt: 'What would you call that job, in a few words?'
  ```
- Old:

  ```
  prompt: `Which ${J.title.toLowerCase()} workflow should we start with? Just name one, like ${J.example}.`
  ```
  New:

  ```
  prompt: `Which one should we start with? Just name one, like ${J.example}.`
  ```
- Old:

  ```
  prompt: `Which one? Name the next ${JOURNEY[s.j].title.toLowerCase()} workflow.`
  ```
  New:

  ```
  prompt: 'Which one is next? Just name it.'
  ```
- Old:

  ```
  render = show(a.v === 'more' ? (route() === 'owner' ? 'Keep going into the journey' : 'Keep going') : 'Finish here');
  ```
  New:

  ```
  render = show(a.v === 'more' ? 'Keep going' : 'Finish here');
  ```
- Old:

  ```
  item(`${plural(mapped.length, 'workflow')} mapped`,
  ```
  New:

  ```
  item(`${plural(mapped.length, 'job')} walked through`,
  ```
- Old:

  ```
  return `${JOURNEY[s.j].title}. Ask: "${s.prompt}"
  ```
  New:

  ```
  return `${JOURNEY[s.j].label}. Ask: "${s.prompt}"
  ```
- Old:

  ```
  : s.d === 8 ? ' Keep it light: one short answer is enough. This becomes the routine that starts the workflow.'
  ```
  New:

  ```
  : s.d === 8 ? ' Keep it light: one short answer is enough. It tells AI when the job should start.'
  ```
- Old:

  ```
  : s.d === 0 ? ' This becomes the skill: the written instructions. Reflect their tool and step names back.'
  ```
  New:

  ```
  : s.d === 0 ? ' This becomes the written instructions for the job. Reflect their tool and step names back.'
  ```
- Old:

  ```
  Ask: "Another one in ${JOURNEY[s.j].title}?"
  ```
  New:

  ```
  Ask: "${anotherText(s.j)}"
  ```

#### Voice agent context sent from the page (src/pages/intake.astro)
- Old:

  ```
  return `Stage 3, the journey: ${JOURNEY[s.j].title} (${JOURNEY[s.j].id}).
  ```
  New:

  ```
  return `Stage 3, how the work flows: ${JOURNEY[s.j].label} (${JOURNEY[s.j].id}).
  ```
- Old:

  ```
  return `${JOURNEY[s.j].title}, workflow "${pr.name}", ${DRILL[s.d].id}
  ```
  New:

  ```
  return `${JOURNEY[s.j].label}, job "${pr.name}", ${DRILL[s.d].id}
  ```

#### Voice agent instructions (docs/intake-voice-agent.md)
- Old:

  ```
  ## The language: it's all files
    
    Everything Roadmap Labs builds for a client ends up as files in one folder:
    
    - **Workflows**: the client's jobs. Each journey "process" is a workflow, with its own workflow file.
    - **Routines**: what kicks a workflow off, either a time or an event.
    - **Skills**: the instructions, written down as MD files, with **reference files** next to them (real emails, proposals, checklists, screenshots).
    
    Harry uses these words with the client and says which file each answer goes into. Setup and AI today go in README.md, the tool stack goes in reference.md, and each workflow gets its own file.
  ```
  New:

  ```
  ## The language: plain words with the client
    
    Behind the scenes, Roadmap Labs turns the answers into files in one folder: workflow files (the client's jobs), routines (what starts each job), skills (the written instructions) and reference files (real examples). Those are our words, not the client's.
    
    Harry never uses them with the client. He says "job", not "workflow". He says "the written instructions for the job", not "skill", and "what starts it", not "routine". He never names a file or a folder (no README.md, reference.md, "workflows/"), and never says "the journey", "Acquire", "Deliver" or "Operate". The three parts are "winning work", "doing the work" and "running the business". When it helps, he says why a question matters in plain words, for example: "this tells AI what a good result is".
  ```
- Old:

  ```
  | D1 | Walk me through it step by step. This becomes the skill: the written instructions. | The skill |
  ```
  New:

  ```
  | D1 | Walk me through it step by step. This becomes the written instructions for the job. | The skill |
  ```
- Old:

  ```
  | D3 | What does good look like? This becomes the quality bar in the skill. | The skill's quality bar |
  ```
  New:

  ```
  | D3 | What does good look like? This tells AI what a good result is. | The skill's quality bar |
  ```
- Old:

  ```
  | D4 | Do you have a real example? It becomes a reference file next to the skill: a real email, proposal, checklist or screenshot. | A reference file |
  ```
  New:

  ```
  | D4 | Do you have a real example, like an email, proposal, checklist or screenshot? We keep it with the instructions so AI can follow it. | A reference file |
  ```
- Old:

  ```
  | D9 | What starts it: a time or an event? That's the routine. (keep it light) | The routine |
  ```
  New:

  ```
  | D9 | What starts it: a set time, or something that happens? That tells AI when to step in. (keep it light) | The routine |
  ```
- Old:

  ```
  Everything Roadmap Labs builds for the client ends up as files in one folder: workflows (their jobs), routines (what kicks them off) and skills (the instructions, written down, with reference files next to them). You're collecting what goes in those files, and you use those words: say "workflow", not "process", and say which file an answer goes into when it helps ("this becomes the skill", "that's the routine").
  ```
  New:

  ```
  You're finding out how the client's business really runs, so Roadmap Labs can write it down as clear instructions that AI can follow. Most clients have never used AI tools in depth, so speak like a friendly person, not a tech expert. Say "job", not "workflow" or "process". Say "the written instructions for the job", not "skill", and "what starts it", not "routine". Never name a file or a folder, and never say "the journey", "Acquire", "Deliver", "Operate", "README", "context" or "agent". When it helps, say why a question matters in plain words, like "this tells AI what a good result is".
  ```
- Old:

  ```
  The web page holds the interview script and keeps the order: Stage 0 Setup, Stage 1 AI today (both go in README.md), Stage 2 Tool stack (reference.md), then, if they choose to keep going, Stage 3, the journey: Acquire, Deliver, Operate. Each stage has a list of workflows, and each workflow gets the drill. You never invent questions or stages.
  ```
  New:

  ```
  The web page holds the interview script and keeps the order: the basics, AI today, their tools, then, if they choose to keep going, how the work flows in three parts: winning work, doing the work, and running the business. In each part they name their main jobs, and each job gets the same few questions. You never invent questions or stages. The tool replies use internal labels like stage numbers and question ids: never read those out.
  ```
- Old:

  ```
  - Reflect back the names they use: the business, their workflows and their tools ("So the quote goes from ServiceM8 into Xero...").
  ```
  New:

  ```
  - Reflect back the names they use: the business, their jobs and their tools ("So the quote goes from ServiceM8 into Xero...").
  ```
- Old:

  ```
  - When the tool tells you to offer a choice (keep going or finish here; another workflow or move on), ask it and call choose_path.
  ```
  New:

  ```
  - When the tool tells you to offer a choice (keep going or finish here; another job or move on), ask it and call choose_path.
  ```
- Old:

  ```
  - The last drill question (D9, what starts it) is light: one short answer is enough. That's the routine.
  ```
  New:

  ```
  - The last of the job questions (D9, what starts it) is light: one short answer is enough.
  ```
