// Tailored briefs for /intake?brief=<token>. A brief is what Roadmap Labs already knows about a business,
// written before the interview, so Harry skips the obvious and asks about the work that eats their time.
//
// This module is safe for the page: it holds the shape, the checks and the labels, never a brief itself.
// Brief files (with their tokens) are read only on the server: src/lib/briefs.ts.

import { CORE_QUESTIONS, SKIPPED } from './intake.ts';
import { GROWTH_QUESTIONS } from './intake-growth.ts';

/** Where tailored questions go in the interview. */
export const BRIEF_STAGES = ['winning', 'doing', 'running', 'connections', 'gaps', 'marketing'] as const;
export type BriefStage = (typeof BRIEF_STAGES)[number];

export const STAGE_LABEL: Record<BriefStage, string> = {
  winning: 'Winning work',
  doing: 'Doing the work',
  running: 'Running the business',
  connections: 'AI and your tools',
  gaps: 'Competitors and gaps',
  marketing: 'Marketing and growth',
};

/** One follow-up after every marketing and growth answer. */
export const MARKETING_FOLLOW_UP = "If you tried something there: roughly what was spent, what came of it, who ran it, and what would you do differently?";

/** Two extra follow-ups for every job, only in brief-based interviews. Appended after the standard nine. */
export const DRILL_BRIEF = [
  { id: 'D10', label: 'Hates', text: 'What do you hate about it?' },
  { id: 'D11', label: 'When rushed', text: "What goes wrong when it's rushed?" },
] as const;

export interface KnownItem { text: string; status: 'confirmed' | 'to-check' }

/** A fact behind a marketing question, with where it came from. Never shown to the client as a list. */
export interface Evidence {
  id: string;
  kind: 'search-term' | 'monthly-searches' | 'ranking' | 'competitor' | 'ad-spend' | 'other';
  /** The figure or fact, as pulled: "1,300", "position 14", "mobile sales app". */
  value: string;
  /** Where it came from, for example "DataForSEO via Composio" or "from Dan". */
  source: string;
  /** The day it was pulled, as YYYY-MM-DD. */
  pulled: string;
  status: 'confirmed' | 'unverified';
}

/** Figures older than this get a warning in the back office. */
export const EVIDENCE_STALE_DAYS = 30;

/** A marketing and growth question. `text` may quote a figure only when every item in `uses` is confirmed and
 *  sourced, and the figure appears in one of them. Otherwise the client sees `fallback`, which has no figures. */
export interface MarketingQuestion { text: string; uses?: string[]; fallback?: string }

export interface Brief {
  slug: string;
  token: string;
  businessName: string;
  website?: string;
  logoUrl?: string;
  accent?: string;
  known: KnownItem[];
  evidence?: Evidence[];
  skip: string[];
  opening: string;
  questions: Partial<Record<Exclude<BriefStage, 'marketing'>, string[]>> & { marketing?: MarketingQuestion[] };
}

/** What the page receives: no token, no website, no evidence, and only confirmed facts. "To check" notes stay
 *  with Roadmap Labs. Marketing questions arrive as final wording (the figure version or its fallback). */
export interface PublicBrief {
  slug: string;
  businessName: string;
  logoUrl?: string;
  accent?: string;
  known: string[];
  skip: string[];
  opening: string;
  questions: Partial<Record<BriefStage, string[]>>;
}

/** Questions a brief may skip: the standard core questions and the optional growth questions. */
export const SKIPPABLE = new Map<string, string>([
  ...CORE_QUESTIONS.map((q) => [q.id, q.topic] as [string, string]),
  ...GROWTH_QUESTIONS.map((q) => [q.id, q.topic] as [string, string]),
]);

const KEYS = new Set(['slug', 'token', 'businessName', 'website', 'logoUrl', 'accent', 'known', 'evidence', 'skip', 'opening', 'questions']);
const EVIDENCE_KINDS = new Set(['search-term', 'monthly-searches', 'ranking', 'competitor', 'ad-spend', 'other']);
/** Figures in a sentence: 1,200 / 4.5 / 26% / #3 / 19th / page 2. Not digits inside a name, like Cin7 or ServiceM8. */
const numbersIn = (t: string) => (t.match(/(?<![A-Za-z])\d[\d,.]*(?=(?:st|nd|rd|th)?(?![A-Za-z\d]))/gi) ?? []).map((n) => n.replace(/[,.]+$/, '').replace(/,/g, ''));
const LIMITS = { name: 60, known: 200, opening: 400, question: 400, knownItems: 20, perStage: 8 };

/** Plain text only: no markup, no links, no control characters, no long dashes. Returns a reason, or '' when fine. */
export function plainTextProblem(v: unknown, max: number): string {
  if (typeof v !== 'string') return 'must be text';
  const t = v.trim();
  if (!t) return 'is empty';
  if (t.length > max) return `is longer than ${max} characters`;
  if (/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(v)) return 'has a line break or hidden character';
  if (/[<>`{}\\]/.test(t)) return 'has a character that is not plain text (< > ` { } or \\)';
  if (/\b(?:https?|javascript|data|vbscript|file):/i.test(t) || /\bwww\./i.test(t)) return 'has a link in it (links are not allowed in the wording)';
  if (/[\u2014\u2013]/.test(t)) return 'has a long dash (use a comma or a full stop instead)';
  if (/[\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff]/.test(t)) return 'has an invisible formatting character';
  return '';
}

/** Relative luminance contrast with white, for white text on the accent colour (buttons). */
export function contrastWithWhite(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return 1.05 / (L + 0.05);
}

export interface Checked { ok: boolean; errors: string[]; warnings: string[]; brief?: Brief }

/** Check a brief. Anything unknown, too long or not plain text is an error; nothing is fixed silently. */
export function checkBrief(input: unknown, today: Date = new Date()): Checked {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, errors: ['The brief must be one JSON object, starting with { and ending with }.'], warnings };
  const o = input as Record<string, unknown>;
  for (const k of Object.keys(o)) if (!KEYS.has(k)) errors.push(`"${k}" is not a field a brief can have.`);
  const text = (k: string, v: unknown, max: number) => { const p = plainTextProblem(v, max); if (p) errors.push(`${k} ${p}.`); };

  if (typeof o.slug !== 'string' || !/^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/.test(o.slug)) errors.push('slug must be lowercase letters, numbers and hyphens, up to 40 characters (for example "inzant").');
  if (typeof o.token !== 'string' || !/^[A-Za-z0-9_-]{32,64}$/.test(o.token)) errors.push('token must be 32 to 64 random letters, numbers, - or _. Use "GENERATE" in the back office to get one.');
  text('businessName', o.businessName, LIMITS.name);

  const url = (k: string, v: unknown, allowPath: boolean) => {
    if (v === undefined) return;
    if (typeof v !== 'string' || v.length > 300 || /[\s"'<>\\`]/.test(v)) { errors.push(`${k} must be a plain web address.`); return; }
    if (allowPath && /^\/[A-Za-z0-9/_.-]+$/.test(v) && !v.includes('..') && !v.startsWith('//')) return;
    try {
      const u = new URL(v);
      if (u.protocol !== 'https:' || u.username || u.password) errors.push(`${k} must start with https://.`);
    } catch { errors.push(`${k} must be a full web address starting with https://.`); }
  };
  url('website', o.website, false);
  url('logoUrl', o.logoUrl, true);

  if (o.accent !== undefined) {
    if (typeof o.accent !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(o.accent)) errors.push('accent must be a colour like "#1f5fbf".');
    else if (contrastWithWhite(o.accent) < 4.5) errors.push(`accent ${o.accent} is too light for white button text (contrast ${contrastWithWhite(o.accent).toFixed(2)}:1, needs 4.5:1). Use a darker shade.`);
  }

  if (!Array.isArray(o.known)) errors.push('known must be a list (it can be empty: []).');
  else {
    if (o.known.length > LIMITS.knownItems) errors.push(`known can have at most ${LIMITS.knownItems} items.`);
    o.known.forEach((k, i) => {
      if (!k || typeof k !== 'object' || Array.isArray(k)) { errors.push(`known item ${i + 1} must be { "text": ..., "status": ... }.`); return; }
      const it = k as Record<string, unknown>;
      for (const key of Object.keys(it)) if (key !== 'text' && key !== 'status') errors.push(`known item ${i + 1} has an unknown field "${key}".`);
      text(`known item ${i + 1}`, it.text, LIMITS.known);
      if (it.status !== 'confirmed' && it.status !== 'to-check') errors.push(`known item ${i + 1} status must be "confirmed" or "to-check".`);
    });
  }

  const evidence = new Map<string, Evidence>();
  if (o.evidence !== undefined) {
    if (!Array.isArray(o.evidence)) errors.push('evidence must be a list (or left out).');
    else o.evidence.forEach((e, i) => {
      const n = `evidence item ${i + 1}`;
      if (!e || typeof e !== 'object' || Array.isArray(e)) { errors.push(`${n} must be an object.`); return; }
      const it = e as Record<string, unknown>;
      for (const key of Object.keys(it)) if (!['id', 'kind', 'value', 'source', 'pulled', 'status'].includes(key)) errors.push(`${n} has an unknown field "${key}".`);
      const day = typeof it.pulled === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(it.pulled) ? new Date(`${it.pulled}T00:00:00Z`) : null;
      if (!day || Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== it.pulled) errors.push(`${n} pulled must be the date it was pulled, like "2026-11-25".`);
      else {
        const age = Math.floor((today.getTime() - day.getTime()) / 86_400_000);
        if (age < -1) errors.push(`${n} pulled date ${it.pulled} is in the future.`);
        else if (age > EVIDENCE_STALE_DAYS) warnings.push(`${n} (${String(it.value)}) was pulled ${age} days ago, on ${it.pulled}. Figures older than ${EVIDENCE_STALE_DAYS} days may be out of date: pull them again before using them.`);
      }
      if (typeof it.id !== 'string' || !/^[a-z0-9-]{1,20}$/.test(it.id)) errors.push(`${n} id must be short lowercase letters and numbers, like "e1".`);
      else if (evidence.has(it.id)) errors.push(`${n} reuses the id "${it.id}".`);
      if (typeof it.kind !== 'string' || !EVIDENCE_KINDS.has(it.kind)) errors.push(`${n} kind must be one of: ${[...EVIDENCE_KINDS].join(', ')}.`);
      text(`${n} value`, it.value, 120);
      text(`${n} source`, it.source, 60);
      if (it.status !== 'confirmed' && it.status !== 'unverified') errors.push(`${n} status must be "confirmed" or "unverified".`);
      if (typeof it.id === 'string') evidence.set(it.id, it as unknown as Evidence);
    });
  }

  if (!Array.isArray(o.skip)) errors.push('skip must be a list of question ids (it can be empty: []).');
  else {
    const seen = new Set<string>();
    for (const id of o.skip) {
      if (typeof id !== 'string' || !SKIPPABLE.has(id)) errors.push(`skip has "${String(id)}", which is not a question that can be skipped. Use ids like S1, A2, T3 or G1.`);
      else if (seen.has(id)) errors.push(`skip lists ${id} twice.`);
      else seen.add(id);
    }
  }

  text('opening', o.opening, LIMITS.opening);

  if (!o.questions || typeof o.questions !== 'object' || Array.isArray(o.questions)) errors.push('questions must be an object with winning, doing, running, connections and gaps lists.');
  else {
    const q = o.questions as Record<string, unknown>;
    for (const k of Object.keys(q)) {
      if (!(BRIEF_STAGES as readonly string[]).includes(k)) { errors.push(`questions has "${k}", which is not a stage. Use winning, doing, running, connections or gaps.`); continue; }
      const list = q[k];
      if (!Array.isArray(list)) { errors.push(`questions.${k} must be a list.`); continue; }
      if (list.length > LIMITS.perStage) errors.push(`questions.${k} has more than ${LIMITS.perStage} questions.`);
      if (k === 'marketing') { list.forEach((v, i) => checkMarketing(v, i)); continue; }
      list.forEach((v, i) => {
        text(`questions.${k} question ${i + 1}`, v, LIMITS.question);
        if (typeof v === 'string' && numbersIn(v).length) warnings.push(`questions.${k} question ${i + 1} has a number in it ("${numbersIn(v).join('", "')}"). Fine for things like "two days", but don't quote a figure about their business without a source.`);
      });
    }
  }

  function checkMarketing(v: unknown, i: number) {
    const n = `questions.marketing question ${i + 1}`;
    if (!v || typeof v !== 'object' || Array.isArray(v)) { errors.push(`${n} must be { "text": ..., "uses": [...], "fallback": ... }.`); return; }
    const m = v as Record<string, unknown>;
    for (const key of Object.keys(m)) if (!['text', 'uses', 'fallback'].includes(key)) errors.push(`${n} has an unknown field "${key}".`);
    text(`${n} text`, m.text, LIMITS.question);
    if (m.fallback !== undefined) {
      text(`${n} fallback`, m.fallback, LIMITS.question);
      if (typeof m.fallback === 'string' && numbersIn(m.fallback).length) errors.push(`${n} fallback quotes a number. The fallback must ask without stating any figure.`);
    }
    const uses = m.uses === undefined ? [] : m.uses;
    if (!Array.isArray(uses) || uses.some((u) => typeof u !== 'string')) { errors.push(`${n} uses must be a list of evidence ids.`); return; }
    for (const u of uses as string[]) if (!evidence.has(u)) errors.push(`${n} uses "${u}", but there is no evidence item with that id.`);
    const figures = typeof m.text === 'string' ? numbersIn(m.text) : [];
    if (!figures.length) return;
    // A figure or ranking in the wording needs a sourced evidence item that holds that same figure.
    const backed = (uses as string[]).map((u) => evidence.get(u)).filter((e): e is Evidence => !!e && !!e.source?.trim());
    const known = new Set(backed.flatMap((e) => numbersIn(String(e.value))));
    const loose = figures.filter((f) => !known.has(f));
    if (!backed.length) errors.push(`${n} quotes ${figures.join(', ')} with no sourced evidence behind it. Add an evidence item with a source and list it in "uses", or remove the figure.`);
    else if (loose.length) errors.push(`${n} quotes ${loose.join(', ')}, which isn't in the evidence it uses. Only quote figures from a sourced evidence item.`);
    if (m.fallback === undefined) errors.push(`${n} quotes a figure, so it needs a "fallback": the same question without any figure, used whenever the evidence isn't confirmed.`);
  }

  return errors.length ? { ok: false, errors, warnings } : { ok: true, errors: [], warnings, brief: o as unknown as Brief };
}

/** The wording the client sees: the figure version only when every evidence item it uses is confirmed and sourced. */
export function marketingWording(b: Pick<Brief, 'evidence'>, m: MarketingQuestion): string {
  const uses = m.uses ?? [];
  const ev = new Map((b.evidence ?? []).map((e) => [e.id, e]));
  const solid = uses.every((u) => { const e = ev.get(u); return !!e && e.status === 'confirmed' && !!e.source.trim(); });
  const hasFigure = numbersIn(m.text).length > 0;
  return (hasFigure && !solid ? m.fallback ?? '' : m.text).trim();
}

export function publicView(b: Brief): PublicBrief {
  const questions: Partial<Record<BriefStage, string[]>> = {};
  for (const k of BRIEF_STAGES) {
    if (k === 'marketing') { if (b.questions.marketing?.length) questions.marketing = b.questions.marketing.map((m) => marketingWording(b, m)); continue; }
    if (b.questions[k]?.length) questions[k] = b.questions[k]!.map((x) => x.trim());
  }
  return {
    slug: b.slug,
    businessName: b.businessName.trim(),
    ...(b.logoUrl ? { logoUrl: b.logoUrl } : {}),
    ...(b.accent ? { accent: b.accent.toLowerCase() } : {}),
    known: b.known.filter((k) => k.status === 'confirmed').map((k) => k.text.trim()),
    skip: [...b.skip],
    opening: b.opening.trim(),
    questions,
  };
}

/** Ids for tailored questions, in interview order: B0 is the opening check, then B1, B2... across the stages. */
export function tailoredIds(b: Pick<PublicBrief, 'questions'>): { stage: BriefStage | 'opening'; i: number; id: string; text?: string }[] {
  const out: { stage: BriefStage | 'opening'; i: number; id: string; text?: string }[] = [{ stage: 'opening', i: 0, id: 'B0' }];
  let n = 1;
  for (const k of BRIEF_STAGES) (b.questions[k] ?? []).forEach((text, i) => out.push({ stage: k, i, id: `B${n++}`, text }));
  return out;
}

export const BRIEF_START = '--- Tailored questions (from the brief) ---';
export const BRIEF_END = '--- End of tailored questions ---';
/** Feeds the "gaps and ideas" file. */
export const MARKETING_START = '--- Gaps and ideas: marketing and growth (from the brief) ---';
export const MARKETING_END = '--- End of marketing and growth ---';
export const NOT_ASKED = 'Not asked: already known from the brief';

const shown = (v: string | undefined) => (v && v !== SKIPPED ? v.trim() : SKIPPED);

/** The tailored answers for the closing field: the tailored block, then the marketing and growth block.
 *  '' when nothing was reached. Answer keys: "opening", "<stage>:<i>", and "marketing:<i>:f" for a follow-up. */
export function tailoredBlock(b: PublicBrief, answers: Map<string, string>): string {
  const ids = tailoredIds(b);
  const main: string[] = [];
  const growth: string[] = [];
  for (const t of ids) {
    const key = t.stage === 'opening' ? 'opening' : `${t.stage}:${t.i}`;
    if (!answers.has(key)) continue;
    const q = t.stage === 'opening' ? b.opening : t.text!;
    const label = t.stage === 'opening' ? 'Opening check' : STAGE_LABEL[t.stage];
    if (t.stage === 'marketing') {
      growth.push(`${t.id}. ${q}`, shown(answers.get(key)));
      if (answers.has(`${key}:f`)) growth.push(`${t.id} follow-up. ${MARKETING_FOLLOW_UP}`, shown(answers.get(`${key}:f`)));
    } else main.push(`${t.id} (${label}). ${q}`, shown(answers.get(key)));
  }
  const blocks: string[] = [];
  if (main.length) blocks.push([BRIEF_START, `Brief: ${b.slug}`, ...main, BRIEF_END].join('\n'));
  if (growth.length) blocks.push([MARKETING_START, `Brief: ${b.slug}`, ...growth, MARKETING_END].join('\n'));
  return blocks.join('\n\n');
}
