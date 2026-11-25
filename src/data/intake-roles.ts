// PROVISIONAL: reading someone's role from their own words, so Harry can pick which questions to ask.
// Role only changes which questions are asked and in what order. It is NOT an access permission and grants nothing:
// there are no accounts, and everyone can answer anything. Simple, transparent word rules; no model is called.

export type Route = 'owner' | 'marketing' | 'team';
export type Division = 'marketing' | 'sales' | 'operations' | 'admin' | 'finance' | 'hr' | 'delivery' | 'support';

export const ROLE_QUESTION = "What's your role in the business? Are you the owner, or do you work in a team, and which one?";
export const ROLE_QUESTION_LEGACY = "Quick one: what's your role? Are you the owner, or do you work in a team, and which one?";
export const ROLE_FOLLOW_UP = 'Mostly which part: sales, operations, admin, finance?';
/** Optional shortcuts under the open question. They fill the same answer as typing. */
export const ROLE_CHIPS = ['Owner', 'Marketing', 'Admin / team', 'Other'] as const;

const OWNER = /\b(?:owner|co-?owner|founder|co-?founder|director|managing director|md|ceo|principal|proprietor|sole trader|general manager|gm|i run (?:the|my|our) (?:business|company|shop|clinic|practice|firm)|i own (?:the|my|our|it)|my (?:own )?business|it'?s my business)\b/i;
const EMPLOYEE = /\b(?:employee|staff|work (?:in|for|on)|i'?m in|part of|member|team|assistant|coordinator|officer|manager|lead|receptionist|executive|specialist)\b/i;

/** Division keywords. Extend freely. The first division found also names the person's area in Harry's echo. */
export const DIVISIONS: Record<Division, RegExp> = {
  marketing: /\b(?:marketing|brand(?:ing)?|social media|social|content|digital|seo|comms|communications|pr|campaigns?)\b/i,
  sales: /\b(?:sales|selling|business development|bdm?|new business|account manager|estimat(?:ing|or)|quoting)\b/i,
  operations: /\b(?:operations|ops|logistics|production|warehouse|scheduling|dispatch|supply chain|procurement)\b/i,
  admin: /\b(?:admin|administration|administrator|office(?: manager)?|reception|receptionist|bookings?|front desk|ea|pa)\b/i,
  finance: /\b(?:(?:do|keep) the books|finance|financial|accounts?|accounting|accountant|bookkeep(?:er|ing)|payroll|invoicing|billing)\b/i,
  hr: /\b(?:hr|human resources|people(?: and culture)?|recruit(?:ment|ing)|talent)\b/i,
  delivery: /\b(?:delivery|projects?|project manager|technician|tradie|plumber|electrician|carpenter|builder|installer|crew|field|consultant|designer|developer|clinician|practitioner|nurse|dentist|chef|stylist)\b/i,
  support: /\b(?:support|customer service|customer success|help ?desk|service desk|client services|customer care)\b/i,
};

export const DIVISION_NAME: Record<Division, string> = {
  marketing: 'marketing', sales: 'sales', operations: 'operations', admin: 'admin', finance: 'finance', hr: 'HR', delivery: 'delivery', support: 'customer support',
};

export interface RoleRead {
  owner: boolean;
  employee: boolean;
  divisions: Division[];
  /** null when the answer is ambiguous or matched nothing: ask the follow-up once. */
  route: Route | null;
  /** Owner who also runs marketing: owner spine with marketing emphasis. */
  marketingEmphasis: boolean;
  /** Harry's one-line echo, inviting a correction. */
  echo: string;
}

const SKIPPED = 'to fill';

/** Read a role answer (plus the follow-up, if one was asked). `final` = no more follow-ups: fall back to the team route. */
export function readRole(text: string, followUp = '', final = false): RoleRead {
  const t = `${text === SKIPPED ? '' : text} ${followUp === SKIPPED ? '' : followUp}`.trim();
  const chip = t.toLowerCase();
  const owner = OWNER.test(t) || chip === 'owner';
  const divisions = (Object.keys(DIVISIONS) as Division[]).filter((d) => DIVISIONS[d].test(t));
  if (/admin \/ team/i.test(t) && !divisions.includes('admin')) divisions.push('admin');
  const employee = !owner && (EMPLOYEE.test(t) || divisions.length > 0);
  const marketingSide = divisions.includes('marketing') || divisions.includes('sales');
  let route: Route | null = null;
  if (owner) route = 'owner';
  else if (marketingSide && divisions.every((d) => d === 'marketing' || d === 'sales')) route = 'marketing';
  else if (divisions.length) route = marketingSide && divisions[0] === 'marketing' ? 'marketing' : 'team';
  const marketingEmphasis = owner && marketingSide;
  const area = divisions.length ? DIVISION_NAME[divisions[0]] : '';
  let echo = '';
  if (route === 'owner') echo = marketingEmphasis
    ? "Got it, you run the business and look after marketing. I'll go from the top, with extra focus on how new business comes in. Not right? Tell me."
    : "Got it, you run the business. I'll ask about the whole thing, from the top. Not right? Tell me.";
  else if (route === 'marketing') echo = `Got it, you run ${area}. I'll focus on that: how new business comes in, then the rest. Not right? Tell me.`;
  else if (route === 'team') echo = `Got it, you work in ${area}. I'll focus on your own week: the tasks you do and what slows you down. Not right? Tell me.`;
  else if (final) {
    route = 'team';
    echo = "I'll start with your own day-to-day tasks, since that's what I can ask about best. Not right? Tell me.";
  }
  return { owner, employee, divisions, route, marketingEmphasis, echo };
}

export const ROUTE_NAME: Record<Route, string> = { owner: 'Owner', marketing: 'Marketing', team: 'Team' };
