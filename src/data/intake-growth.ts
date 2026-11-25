// Stage 3b: the optional Growth add-on, from intake/QUESTIONS.md ("Stage 3b: Growth add-on").
// Eight optional questions, offered after the three journey stages and their workflow drills, before the closing
// question. About 5 minutes, skippable as a whole or one at a time, and never part of the core 10 minutes.
//
// Storage: Jotform has no growth fields and none are added. The answers travel inside the closing field
// "Anything we didn't ask that we should know?" (194), as one clearly delimited block after the person's own text,
// the same way "More workflows" already does. Nothing is added when no growth question was answered.
//
// Self-contained on purpose (no imports), so the payload builder can be unit tested with plain Node.

export interface GrowthQuestion {
  id: string;
  text: string;
  /** Example line shown under the question, in the same style as the core hints. */
  hint: string;
  /** What this answer gives us, for the folder panel ("where good customers come from"). */
  topic: string;
}

export const GROWTH_QUESTIONS: GrowthQuestion[] = [
  {
    id: 'G1',
    text: 'Think of your last three best customers. How did each one find you?',
    hint: 'For example, a trades firm: a builder referral, a Google search, a past customer\'s neighbour. A clinic: a GP referral. An agency: a LinkedIn post. A shop: Instagram.',
    topic: 'where good customers come from',
  },
  {
    id: 'G2',
    text: 'What do you most want to sell more of, and what do you want less of?',
    hint: 'For example, a trades firm: more bathroom renovations, fewer small call-outs. A clinic: more ongoing care, fewer one-off visits. An agency: more retainers, fewer one-off logos. A shop: more of the best sellers, less slow stock.',
    topic: 'what to sell more of',
  },
  {
    id: 'G3',
    text: 'If ten more good enquiries came in next month, could you take them? What gives first: people, time or materials?',
    hint: 'For example, a trades firm: we\'d need another apprentice. A clinic: Mondays are already full. An agency: design time runs out first. A shop: stock would run short.',
    topic: 'how much more you could take on',
  },
  {
    id: 'G4',
    text: 'Roughly what is a typical job or customer worth, and what is left after costs?',
    hint: 'Rough is fine. For example, a trades firm: a $4,000 job, about $1,200 left after materials and wages. A clinic: a patient over a year. An agency: a monthly retainer. A shop: an average order.',
    topic: 'what a customer is worth',
  },
  {
    id: 'G5',
    text: 'Have you run ads, discounts or promotions before? What happened, and what did it cost?',
    hint: 'For example, a trades firm: three months of Google Ads. A clinic: a new-patient discount. An agency: a paid LinkedIn campaign. A shop: a 20% off sale. "Never tried" is a fine answer.',
    topic: 'what you have tried before',
  },
  {
    id: 'G6',
    text: 'What could you offer to win someone new, such as a first-job discount, a package or a guarantee, without hurting the business?',
    hint: 'For example, a trades firm: a fixed-price first service. A clinic: a short first consult. An agency: a small paid trial project. A shop: a starter bundle. "Not sure yet" is fine.',
    topic: 'an offer for new customers',
  },
  {
    id: 'G7',
    text: 'Who in the business knows the most and would be happy to be seen sharing it, in writing, on video or on LinkedIn?',
    hint: 'For example, a trades firm: the lead electrician, on short site videos. A clinic: the senior physio, writing short articles. An agency: a founder on LinkedIn. A shop: the owner, on product videos.',
    topic: 'who could share what they know',
  },
  {
    id: 'G8',
    text: 'What do you already have that we could reuse: a customer list, past customers, reviews, photos, case studies?',
    hint: 'For example, a trades firm: past customers in Xero, Google reviews, before-and-after photos. A clinic: a patient email list. An agency: case studies. A shop: product photos. You can share files at the end.',
    topic: 'what we could reuse',
  },
];

/** The offer before the first growth question. */
export const GROWTH_OFFER = {
  title: 'Optional: growth',
  text: "That covers how the work flows. There are eight optional growth questions, about 5 minutes, on where good customers come from and what you could offer them. They're not part of the core. Answer them, or skip to the last question.",
  yes: 'Answer growth questions',
  yesSub: 'About 5 minutes · optional · skip any one',
  no: 'Skip growth questions',
  noSub: 'Go to the last question',
} as const;

/** Rough seconds per growth question (8 × ~38s ≈ 5 minutes). */
export const GROWTH_SECONDS = 38;

const SKIPPED = 'to fill';
const filled = (v?: string) => v !== undefined && v !== SKIPPED && v.trim() !== '';

/** Field 194 is stored as a Jotform text field; the submit endpoint keeps at most this many characters per field. */
export const TEXT_MAX = 20000;

export const GROWTH_START = '--- Growth (optional add-on) ---';
export const GROWTH_END = '--- End of growth ---';

/**
 * The Growth block for field 194, or '' when nothing was answered (all skipped, declined or never reached).
 * Only questions that were offered appear: answered as typed, or "to fill" if skipped, in G1-G8 order.
 */
export function growthBlock(answers: (string | undefined)[]): string {
  if (!answers.some(filled)) return '';
  const lines = [GROWTH_START];
  GROWTH_QUESTIONS.forEach((q, i) => {
    const v = answers[i];
    if (v === undefined) return;
    lines.push(`${q.id}. ${q.text}`, filled(v) ? v.trim() : SKIPPED);
  });
  lines.push(GROWTH_END);
  return lines.join('\n');
}

/** Cut the growth block to fit `room` characters, keeping its start and end markers. '' if it can't fit at all. */
export function fitGrowth(block: string, room: number): string {
  if (!block || block.length <= room) return block;
  const tail = `\n[growth answers cut to fit]\n${GROWTH_END}`;
  const keep = room - tail.length;
  if (keep <= GROWTH_START.length) return '';
  return `${block.slice(0, keep).trimEnd()}${tail}`;
}

export interface PayloadParts {
  /** Every question answer by qid, including the person's own closing answer (194). */
  answers: Map<number, string>;
  /** The journey workflow slots: qid to the labelled drill block. */
  slots: [number, string][];
  /** The "More workflows" overflow, or ''. */
  more: string;
  /** The "Answered as" line, or ''. */
  answeredAs: string;
  /** The eight growth answers (undefined = not offered). */
  growth?: (string | undefined)[];
  /** The closing field "Anything we didn't ask that we should know?". */
  anythingElseQid: number;
}

/**
 * Everything for Jotform, by qid. With no growth answers this is exactly the payload from before the add-on:
 * the person's own 194 text, then "More workflows", then "Answered as", each separated by a blank line.
 * With growth answers, one Growth block goes after "More workflows" and before the "Answered as" line, so the
 * person's own text stays first and untouched and the attribution line still closes the field. The block is cut
 * (never the person's text) so the field stays within TEXT_MAX.
 */
export function buildPayload(p: PayloadParts): [number, string][] {
  const out = new Map(p.answers);
  for (const [qid, v] of p.slots) out.set(qid, v);
  const Q = p.anythingElseQid;
  const append = (block: string) => {
    if (!block) return;
    const base = out.get(Q);
    out.set(Q, base ? `${base}\n\n${block}` : block);
  };
  append(p.more);
  const g = growthBlock(p.growth ?? []);
  if (g) {
    const used = (out.get(Q)?.length ?? 0) + (out.has(Q) ? 2 : 0) + (p.answeredAs ? p.answeredAs.length + 2 : 0);
    append(fitGrowth(g, TEXT_MAX - used));
  }
  append(p.answeredAs);
  return [...out];
}
