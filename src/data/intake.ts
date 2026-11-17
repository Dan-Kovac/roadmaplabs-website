// The business OS intake interview: 44 questions, each mapped to its Jotform field (qid).
// Ask them verbatim. The /intake page and /api/intake-submit both read from here.

export interface IntakeQuestion {
  /** Interview number, 1 to 44. */
  n: number;
  /** Jotform field id on form 263198186491065. */
  qid: number;
  text: string;
  /** Section the question belongs to; shown as a divider on the full path. */
  session: 1 | 2 | 3 | 4;
}

export const SESSIONS: Record<IntakeQuestion['session'], string> = {
  1: 'The offer and the customer',
  2: "The customer's world and the brand",
  3: 'The workflows',
  4: 'The tools and the wrap',
};

const Q: [number, number, string][] = [
  [1, 145, "What's the business called, and what's a short name for the folder?"],
  [2, 146, 'In a sentence or two, what does it sell, and to whom?'],
  [3, 147, 'Is there anything you can hand me now: a website, a brand guide, a price list, existing documents?'],
  [4, 148, 'Who else in the business should run this interview, so I get more than one perspective?'],
  [5, 149, 'Where should the master copy live: the project files, a doc you edit, or Google Drive?'],
  [6, 150, 'In one sentence, why does the business exist, and for whom?'],
  [7, 151, "What does it look like in 3 to 5 years when it's working?"],
  [8, 152, 'What 3 to 5 numbers would make the next 12 months a good year? Where is each one now?'],
  [9, 153, "What do you do that competitors don't?"],
  [10, 154, "What rules would you want followed when you're not in the room?"],
  [11, 155, 'What work or customers do you say no to?'],
  [12, 157, 'How does the business make money?'],
  [13, 158, 'Walk me through every step a customer can take with you, from first contact to ongoing. What do they get and pay at each step?'],
  [14, 159, "What's the one call to action you want on everything?"],
  [15, 160, 'What proof are you allowed to use: results, names, reviews?'],
  [16, 161, 'What are the top 3 priorities this quarter?'],
  [17, 162, 'Who is the person who buys, and what kind of business or household are they in?'],
  [18, 163, "Tell me about one real customer who's the clearest example."],
  [19, 164, "What's happening in their world when they reach out?"],
  [20, 165, 'What have they already tried?'],
  [21, 167, 'What are they afraid of, biggest fear first?'],
  [22, 168, 'What questions do they ask before buying?'],
  [23, 169, 'What does success look like for them a year later?'],
  [24, 170, "Who isn't a fit?"],
  [25, 171, 'Where do they spend time, and who do they trust?'],
  [26, 172, "Is there an existing brand guide or design system? If so, that's the master and this file summarises it."],
  [27, 173, 'Three words for how the brand should feel?'],
  [28, 174, 'Logo, colours and fonts: what exists, and where are the files?'],
  [29, 175, 'Who\'s speaking on each channel: a named person, or "we"?'],
  [30, 176, 'Any spelling, punctuation or wording rules? Any phrases that are banned?'],
  [31, 177, 'One line that sounds exactly right, and one that sounds wrong?'],
  [32, 179, 'How do customers find you today? (Attract)'],
  [33, 180, 'How does a lead become a customer? (Convert)'],
  [34, 181, 'What happens between a yes and the work being delivered? (Deliver)'],
  [35, 182, 'What keeps them coming back or referring? (Keep and grow)'],
  [36, 183, 'What starts each workflow: a time, or an event?'],
  [37, 184, "Walk me through it step by step. For each step: what's done, in which tool, by whom, and what's handed on?"],
  [38, 185, 'Where does someone have to say yes?'],
  [39, 186, "How do you know it's working?"],
  [40, 188, 'Which tools does the business pay for, and what does each cost a month?'],
  [41, 189, 'Where does the data live: customers, sales, files?'],
  [42, 190, 'Is anything already automated or scheduled?'],
  [43, 191, 'Who are the key people outside the business: customers, partners, suppliers?'],
  [44, 192, 'What assets does the business keep improving: a website, a list, a product, a template? Rate each 1 to 5.'],
];

const sessionOf = (n: number): IntakeQuestion['session'] => (n <= 16 ? 1 : n <= 31 ? 2 : n <= 39 ? 3 : 4);

export const QUESTIONS: IntakeQuestion[] = Q.map(([n, qid, text]) => ({ n, qid, text, session: sessionOf(n) }));

/** Core path (~10 minutes), always asked, in this order. */
export const CORE = [1, 2, 3, 8, 12, 13, 17, 19, 21, 32, 33, 34, 35, 37, 40];

/** Full path: everything not in the core, in the original order. */
export const FULL = QUESTIONS.map((q) => q.n).filter((n) => !CORE.includes(n));

export const CLOSING = {
  anythingElse: { qid: 194, text: "Anything we didn't ask that we should know?" },
  files: 195,
  link: 196,
  employee: 197,
  client: 198,
} as const;

/** Every text field the submit endpoint accepts. Files go to CLOSING.files. */
export const TEXT_QIDS = new Set<number>([
  ...QUESTIONS.map((q) => q.qid),
  CLOSING.anythingElse.qid,
  CLOSING.link,
  CLOSING.employee,
  CLOSING.client,
]);

export const SKIPPED = 'to fill';

/** Vercel rejects serverless request bodies over ~4.5MB; keep uploads under this. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
