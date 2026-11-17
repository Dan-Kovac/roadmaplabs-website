// PROVISIONAL rules for the /intake folder panel: how "deep" each file's context is, from the answers so far.
// A first version for Dan to react to. Everything here is a simple length-and-content check; no model is called.
// Depth is shown as a three-step bar (empty, thin, solid), never a percentage.
//
// The panel shows what has been captured from the person's answers, not finished files:
// Roadmap Labs writes the finished files after the interview.

export type Depth = 'empty' | 'thin' | 'solid';

export const DEPTH_LABEL: Record<Depth, string> = { empty: 'Empty', thin: 'Thin', solid: 'Solid' };

const SKIPPED = 'to fill';

/** Common tools, so a short answer that names one still counts as real content. Extend freely. */
export const TOOL_WORDS = [
  'xero', 'myob', 'quickbooks', 'servicem8', 'tradify', 'simpro', 'fergus', 'cliniko', 'halaxy', 'shopify', 'square',
  'woocommerce', 'hubspot', 'salesforce', 'pipedrive', 'zoho', 'mailchimp', 'klaviyo', 'canva', 'asana', 'trello',
  'monday', 'clickup', 'notion', 'slack', 'teams', 'outlook', 'gmail', 'google', 'excel', 'sheets', 'word', 'dropbox',
  'drive', 'zapier', 'make', 'chatgpt', 'claude', 'copilot', 'gemini', 'calendly', 'stripe', 'deputy', 'employment hero',
  'wordpress', 'wix', 'squarespace', 'facebook', 'instagram', 'linkedin',
];

export const answered = (v?: string) => v !== undefined && v !== SKIPPED && v.trim() !== '';
export const words = (v?: string) => (answered(v) ? v!.trim().split(/\s+/).length : 0);
/** A number that stands on its own ("$60", "5 hours"), not a digit inside a name like ServiceM8. */
export const hasNumber = (v?: string) => answered(v) && /(?<![A-Za-z])\d/.test(v!);
export const hasMoney = (v?: string) => answered(v) && /\$\s?\d|\d\s?(?:\/\s?(?:mo|month|m)|a month|per month|pm\b)|\d+\s?(?:dollars|aud)/i.test(v!);
export const hasUrl = (v?: string) => answered(v) && /https?:\/\/|www\.|\b[\w-]+\.(?:com|au|io|co|net|org)\b/i.test(v!);
export const hasTool = (v?: string) => answered(v) && TOOL_WORDS.some((t) => new RegExp(`\\b${t}\\b`, 'i').test(v!));

/** Real content: about 12 words or more, or a number, a tool name or a link. */
export const substantive = (v?: string) => answered(v) && (words(v) >= 12 || hasNumber(v) || hasTool(v) || hasUrl(v));
/** Workflow fields: anything but a one-word answer. */
export const nonTrivial = (v?: string) => answered(v) && words(v) >= 2;

export interface FileState {
  depth: Depth;
  /** What it holds, in a few words, for Harry's line ("the business and how you use AI"). */
  has: string[];
  /** The thinnest part, for Harry's line ("not costs yet"). Empty when solid. */
  gap: string;
  /** How many answers feed it: used to spot the file that just grew. */
  size: number;
}

/** README.md: S1 (145), S2 (146), A1-A7 (147-153).
 *  Solid: the business, what was handed over, and at least 3 AI answers with a specific example or a number. */
export function readme(a: (qid: number) => string | undefined): FileState {
  const ai = [147, 148, 149, 150, 151, 152, 153].map(a);
  const aiCount = ai.filter(substantive).length;
  const specific = substantive(a(149)) || ai.some(hasNumber);
  const has: string[] = [];
  if (answered(a(145))) has.push('the business');
  if (answered(a(146))) has.push("what you've handed over");
  if (aiCount) has.push('how you use AI');
  const size = [a(145), a(146), ...ai].filter(answered).length;
  const solid = answered(a(145)) && answered(a(146)) && aiCount >= 3 && specific;
  const gap = solid ? ''
    : !answered(a(145)) ? 'not the business name yet'
    : !answered(a(146)) ? "nothing handed over yet"
    : aiCount < 3 ? 'only a little on how you use AI so far'
    : 'no specific example or number yet';
  return { depth: solid ? 'solid' : size ? 'thin' : 'empty', has, gap, size };
}

/** reference.md: T1-T5 (154, 155, 157, 158, 159). Solid: the software list has costs, and at least one pain point. */
export function reference(a: (qid: number) => string | undefined): FileState {
  const t = [154, 155, 157, 158, 159].map(a);
  const costs = hasMoney(t[0]) || (hasNumber(t[0]) && hasTool(t[0]));
  const pain = substantive(t[2]) || substantive(t[4]);
  const has: string[] = [];
  if (answered(t[0])) has.push('your tools');
  if (answered(t[1])) has.push('your CRM');
  if (pain) has.push('where work gets stuck');
  const size = t.filter(answered).length;
  const solid = answered(t[0]) && costs && pain;
  const gap = solid ? '' : !answered(t[0]) ? 'no software list yet' : !costs ? 'not costs yet' : 'no pain points yet';
  return { depth: solid ? 'solid' : size ? 'thin' : 'empty', has, gap, size };
}

/** Drill index, what it gives the file, and how to say it's missing. */
const WF_KEYS: [number, string, string][] = [
  [0, 'the steps', 'no steps yet'],
  [1, 'the tools', 'no tools yet'],
  [2, 'what good looks like', 'no quality bar yet'],
  [3, 'an example', 'no example yet'],
  [8, 'what starts it', 'not what starts it yet'],
];

/** A workflow file, from its drill block. Solid when How, Tools, Good looks like, Example and Starts when are all
 *  non-trivial; thin when only some are. A one-word answer doesn't count. */
export function workflow(drill: (string | undefined)[]): FileState {
  const ok = WF_KEYS.filter(([i]) => nonTrivial(drill[i]));
  const missing = WF_KEYS.filter(([i]) => !nonTrivial(drill[i]));
  const size = drill.filter(answered).length;
  const depth: Depth = missing.length === 0 ? 'solid' : ok.length || size ? 'thin' : 'empty';
  return { depth, has: ok.map(([, w]) => w), gap: missing.length ? missing[0][2] : '', size };
}

/** brand.md and customer.md come from their documents and a later call: thin once anything is attached or linked. */
export function fromDocuments(shared: boolean): FileState {
  return { depth: shared ? 'thin' : 'empty', has: shared ? ['what you shared'] : [], gap: 'from your documents and a later call', size: shared ? 1 : 0 };
}

/** The folder's short name: "acme-os". From S1 ("..., folder acme"), else the business name, else the client link. */
export function folderSlug(s1: string | undefined, client: string): string {
  const slug = (x: string) => x.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24).replace(/-+$/, '');
  if (answered(s1)) {
    const named = s1!.match(/(?:folder|short name)\s*(?:is|:|-|could be|would be)?\s*["'“]?([\w&.-]+(?:\s[\w&.-]+)?)/i);
    if (named) return slug(named[1]);
    const first = s1!.split(/[,;\n]| - | – /)[0];
    if (first.trim()) return slug(first.split(/\s+/).slice(0, 3).join(' '));
  }
  return slug(client) || 'your-business';
}

/** A workflow name as a file name: "Builder referrals" -> "builder-referrals.md". */
export const workflowFile = (name: string) =>
  `${name.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/, '') || 'workflow'}.md`;
