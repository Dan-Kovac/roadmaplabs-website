// Copy-ready prompts for the back office (/intake-admin) and docs/tailored-intake/README.md.
// Paste into Claude on its best model, then review what comes back before using it.

import { CORE_QUESTIONS } from './intake.ts';
import { GROWTH_QUESTIONS } from './intake-growth.ts';

const skippable = [...CORE_QUESTIONS, ...GROWTH_QUESTIONS].map((q) => `${q.id}: ${q.text}`).join('\n');

export const BRIEF_PROMPT = `You are helping Roadmap Labs prepare a tailored client interview. Roadmap Labs is an Australian AI consultancy. Its interviewer, Harry, asks business owners how their business really runs, so Roadmap Labs can write it down as clear instructions that AI can follow.

I'll give you the client's website and my notes. Read the website (public pages only) and write a brief in the JSON format below. Return only the JSON, nothing else.

My inputs:
- Website: [PASTE THE WEBSITE ADDRESS]
- My notes (what I already know from talking to them): [PASTE YOUR NOTES, OR "none"]

Rules:
1. Plain Australian English. Short sentences. No jargon a business owner would need explained. No long dashes (use a comma or a full stop). No links, no < or > characters, no line breaks inside any text.
2. "known": short facts. Mark a fact "confirmed" only if it is stated on their website. Anything from my notes, anything you inferred, and anything we still need to find out is "to-check". "to-check" items are never shown to the client.
3. "opening": one or two sentences Harry says first, saying what we've got from their site and asking if it's still right.
4. "skip": ids of standard questions we already know the answer to, from the list below. Only skip a question if the website or my notes clearly answer it. If unsure, don't skip.
5. "questions": bespoke questions for each stage, aimed at the work they dislike and the jobs that eat their time, not stock questions. Refer to what they actually do (their product, their process, what their site promises). Two to five per stage. Stages:
   - "winning": how they win work (enquiries, demos, quotes, sales)
   - "doing": how the work gets done and delivered (onboarding, delivery, support)
   - "running": what runs around the work (checks, reporting, admin, the jobs nobody wrote down)
   - "connections": how AI sees their business today (pasted in or connected), which tools AI can't read, where AI got them wrong
   - "gaps": competitors and gaps. Don't name competitors unless my notes name them. Ask what prospects mention, what bothers them, what they'd do with spare time
   - "marketing": marketing and growth, as objects: { "text": "..." }. Use these in plain words, adapted to them:
     * Search: "When people look for [what they do] in [place], do you know where you show up, and has anything been tried to show up higher?"
     * Ads: "How are your ads doing today? What have you tried before, what worked, and where did you get burned?"
     * Marketing in general: "What marketing has actually brought in good customers, and what looked promising but wasted money?"
     * "Where have you been burned by an agency or a freelancer?"
     * "Which channel do you feel you should be doing more of?"
6. Never state a number, ranking or search figure in any question unless I give you that figure with its source. Never invent figures or use example numbers. If I give you a sourced figure, add it to "evidence" (with "pulled" as the date I give) and write the question as { "text": "...with the figure...", "uses": ["e1"], "fallback": "...the same question with no figure..." }.
7. "token": always "GENERATE". The back office makes a real one. "slug": short lowercase name, letters, numbers and hyphens only.
8. "accent": a dark enough version of their main brand colour for white button text, like "#1a5bb5", or leave it out. "logoUrl": the full https address of their logo image if you can see it on their site, or leave it out. Add a "to-check" item saying which colour and logo you used.

Standard questions that can be skipped:
${skippable}

The JSON format:
{
  "slug": "example-co",
  "token": "GENERATE",
  "businessName": "Example Co",
  "website": "https://example.com.au",
  "logoUrl": "https://example.com.au/logo.svg",
  "accent": "#1a5bb5",
  "known": [
    { "text": "A plumbing business in Geelong", "status": "confirmed" },
    { "text": "Team size", "status": "to-check" }
  ],
  "evidence": [],
  "skip": ["S1"],
  "opening": "From your site I've got that Example Co is a plumbing business in Geelong. Is that still the right picture?",
  "questions": {
    "winning": ["..."],
    "doing": ["..."],
    "running": ["..."],
    "connections": ["..."],
    "gaps": ["..."],
    "marketing": [{ "text": "..." }]
  }
}`;

export const SEARCH_PROMPT = `Use the DataForSEO tools in Composio (our Roadmap Labs DataForSEO account: [NAME OF THE DATAFORSEO ACCOUNT CONNECTED IN COMPOSIO]) to pull search figures for a client brief. Read only. Don't change anything in any account.

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
Use "unverified" for any figure the tool marked as an estimate or that you couldn't get directly. Never make up a figure. If something isn't available, leave that item out and say so after the JSON.`;
