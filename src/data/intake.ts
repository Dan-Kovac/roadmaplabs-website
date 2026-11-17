// The business OS intake: the spine from intake/QUESTIONS.md.
// Stage 0 Setup, Stage 1 AI today, Stage 2 Tool stack (the core, about 10 minutes), then Stage 3 the business
// journey (Acquire, Deliver, Operate) with the 8-question process drill. Each question maps to its Jotform field (qid)
// on form 263198186491065. The /intake page, the voice agent tools and /api/intake-submit all read from here.

export interface CoreQuestion {
  /** Spine id, e.g. "A3". The voice agent uses these ids. */
  id: string;
  qid: number;
  /** Stage number: 0 Setup, 1 AI today, 2 Tool stack. */
  stage: 0 | 1 | 2;
  text: string;
  /** What this answer gives us, for Harry's end-of-stage recap ("I've got your CRM, ..."). */
  topic: string;
  /** Optional example line shown under the question. */
  hint?: string;
}

export const CORE_STAGES = [
  { n: 0, title: 'Setup', recap: 'the setup', intro: 'First, the basics, which go in your README.md.' },
  { n: 1, title: 'AI today', recap: 'your AI today', intro: 'Next, how AI shows up in the business today, which also goes in your README.md. Small jobs count.' },
  { n: 2, title: 'Tool stack', recap: 'your tool stack', intro: 'Next, your tool stack, which goes in reference.md.' },
] as const;

export const CORE_QUESTIONS: CoreQuestion[] = [
  // Stage 0: Setup
  { id: 'S1', qid: 145, stage: 0, text: "What's the business called, and what's a short name for the folder?", topic: 'the business name' },
  { id: 'S2', qid: 146, stage: 0, text: 'Is there anything you can hand over now: a website, a price list, a proposal, a report? Attach it or paste a link.', topic: 'what you can hand over', hint: 'Use the paperclip to attach a file, paste a link, or record your screen.' },
  // Stage 1: AI today
  { id: 'A1', qid: 147, stage: 1, text: 'How are you using AI in the business today? Name the jobs it does, even small ones.', topic: 'how you use AI', hint: 'For example: drafting quotes, summarising calls, writing social posts, answering enquiries. "Not at all yet" is a fine answer.' },
  { id: 'A2', qid: 148, stage: 1, text: 'Which AI tools, and who uses which?', topic: 'the AI tools and who uses them', hint: 'For example: ChatGPT for the owner, Copilot in Outlook for the office manager.' },
  { id: 'A3', qid: 149, stage: 1, text: "What's been the best result so far? Give me one specific example.", topic: 'your best result' },
  { id: 'A4', qid: 150, stage: 1, text: 'Roughly what do you spend on AI tools a month, in total?', topic: 'your monthly AI spend' },
  { id: 'A5', qid: 151, stage: 1, text: 'What are your biggest challenges with AI right now?', topic: 'your challenges with AI' },
  { id: 'A6', qid: 152, stage: 1, text: "What have you tried that didn't work, or that you stopped using?", topic: "what didn't stick" },
  { id: 'A7', qid: 153, stage: 1, text: 'If AI took over three jobs in the next 90 days, which three, and what would "worked" look like: hours back, dollars saved, more sales?', topic: 'the three jobs you would hand to AI' },
  // Stage 2: Tool stack
  { id: 'T1', qid: 154, stage: 2, text: 'What software does the business run on day to day? List everything, with a rough monthly cost if you know it.', topic: 'your software and what it costs', hint: 'For example, a trades firm: Xero, ServiceM8, Google Workspace. A clinic: Cliniko, Mailchimp. An agency: Asana, Slack, HubSpot. A shop: Shopify, Square.' },
  { id: 'T2', qid: 155, stage: 2, text: "What's your CRM (or the nearest thing: a spreadsheet, an inbox), and how well does it get used?", topic: 'your CRM' },
  { id: 'T3', qid: 157, stage: 2, text: 'Where does work get stuck, get re-typed, or fall between tools?', topic: 'where work gets stuck', hint: 'For example: job details typed from email into the job system, then again into Xero.' },
  { id: 'T4', qid: 158, stage: 2, text: 'What does your team like using?', topic: 'what the team likes' },
  { id: 'T5', qid: 159, stage: 2, text: 'What do they avoid, work around or complain about?', topic: 'what the team avoids' },
];

/** Stage 3: the business journey. Each stage opens with a list question, then the process drill per process. */
export const JOURNEY = [
  {
    id: 'J1',
    key: 'acquire',
    title: 'Acquire',
    qid: 160,
    slots: [163, 164, 165],
    text: 'How do new customers and business come in? Name each workflow, one per line: marketing, word of mouth, partnerships, outbound, anything.',
    hint: 'For example, a trades firm: builder referrals, Google reviews, a Facebook page. A clinic: GP referrals, online booking. An agency: LinkedIn, past clients. A shop: Instagram, walk-ins, an email list.',
    intro: 'Now the journey, in three parts: how work comes in, how it gets done, and what runs around it. Each workflow you describe becomes its own workflow file. First, how new business comes in.',
    example: 'referrals',
  },
  {
    id: 'J2',
    key: 'deliver',
    title: 'Deliver',
    qid: 161,
    slots: [167, 168, 169],
    text: 'How does the work you sold actually get done and delivered? Name each workflow, one per line.',
    hint: 'For example, a trades firm: quote, schedule the job, do the work, invoice. A clinic: intake forms, appointment, treatment notes. An agency: brief, drafts, review rounds, launch. A shop: pick, pack, ship.',
    intro: 'Next, how the work you sell actually gets done.',
    example: 'quoting',
  },
  {
    id: 'J3',
    key: 'operate',
    title: 'Operate',
    qid: 162,
    slots: [170, 171, 172],
    text: 'What runs around the work: looking after customers, keeping them happy, reaching back out, running the business day to day? Name each workflow, one per line.',
    hint: 'For example, a trades firm: chasing unpaid invoices, warranty call-backs. A clinic: recall reminders. An agency: monthly reporting. A shop: returns, reorders, asking for reviews.',
    intro: 'Last part: everything that runs around the work.',
    example: 'invoicing',
  },
] as const;

/** The drill: identical for every workflow, saved as one labelled block in the stage's next slot.
 *  The answers fill that workflow's files: the skill (D1, D3), its reference file (D4) and the routine that starts it (D9). */
export const DRILL = [
  { id: 'D1', label: 'How', text: 'Walk me through it step by step. This becomes the skill: the written instructions.' },
  { id: 'D2', label: 'Tools', text: 'Which tools are involved?' },
  { id: 'D3', label: 'Good looks like', text: 'What does good look like? This becomes the quality bar in the skill.' },
  { id: 'D4', label: 'Example', text: 'Do you have a real example? It becomes a reference file next to the skill: a real email, proposal, checklist or screenshot.' },
  { id: 'D5', label: 'Hand to AI', text: 'Would you want to hand this to AI, keep it with a person, or split it? Why?' },
  { id: 'D6', label: 'Time', text: 'How long does it take, how often? (e.g. 2 hours, twice a week)' },
  { id: 'D7', label: 'Value', text: "What's it worth: what does it bring in or protect when it goes well?" },
  { id: 'D8', label: 'Cost', text: "Roughly what does it cost? Tell me who does it, the hours per week, and their hourly cost or annual pay." },
  { id: 'D9', label: 'Starts when', text: "What starts it: a time or an event? That's the routine." },
] as const;

/** Light example under D9. */
export const D9_HINT = 'For example: every Monday at 9am, or when a new enquiry lands in the inbox.';

export const D5_CHIPS = ['Hand it over', 'Split it', 'Keep it with a person'] as const;

/** Up to three workflows are drilled per journey stage; any more go into the closing answer under "More workflows". */
export const MAX_PROCESSES = 3;

/** Rough benchmark for the D8 helper: annual pay divided by about 1,800 working hours, about 48 working weeks a year. */
export const BENCHMARK = { hoursPerYear: 1800, weeksPerYear: 48 } as const;

/** Rough minutes, for "about N min left". The core is about 10 minutes; the journey adds about 20. */
export const TIMING = { coreSeconds: 43, journeySeconds: 40, closingSeconds: 45 } as const;

export const CLOSING = {
  anythingElse: { qid: 194, text: "Anything we didn't ask that we should know?" },
  files: 195,
  link: 196,
  employee: 197,
  client: 198,
} as const;

/** Every text field the submit endpoint accepts: the core, the journey lists, the nine workflow slots, the closing fields. */
export const TEXT_QIDS = new Set<number>([
  ...CORE_QUESTIONS.map((q) => q.qid),
  ...JOURNEY.flatMap((j) => [j.qid, ...j.slots]),
  CLOSING.anythingElse.qid,
  CLOSING.link,
  CLOSING.employee,
  CLOSING.client,
]);

export const SKIPPED = 'to fill';

/** Vercel rejects serverless request bodies over ~4.5MB; keep uploads under this. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Screen recordings: uploaded straight to a private Supabase Storage bucket (free tier caps files at 50MB). */
export const RECORDING = {
  bucket: 'intake-recordings',
  maxBytes: 50 * 1024 * 1024,
  /** Stop recording well before the cap. */
  stopAtBytes: 45 * 1024 * 1024,
  maxSeconds: 5 * 60,
  videoBitsPerSecond: 1_000_000,
} as const;
