// Unit tests for the /intake payload builder and the optional Growth block in field 194.
// Pure functions only: nothing here calls /api/intake-submit or Jotform.
// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload, growthBlock, GROWTH_QUESTIONS, GROWTH_START, GROWTH_END, TEXT_MAX } from '../src/data/intake-growth.ts';

const Q194 = 194;
const SKIPPED = 'to fill';

/** The payload builder exactly as it was before the Growth add-on (copied from intake.astro payloadFields). */
function legacyPayload(answers: Map<number, string>, slots: [number, string][], more: string, by: string): [number, string][] {
  const out = new Map(answers);
  for (const [qid, v] of slots) out.set(qid, v);
  if (more) { const base = out.get(Q194); out.set(Q194, base ? `${base}\n\n${more}` : more); }
  if (by) { const base = out.get(Q194); out.set(Q194, base ? `${base}\n\n${by}` : by); }
  return [...out];
}

const OWN = "We're moving premises in March.\nAlso: two staff start in Feb.";
const MORE = 'More workflows:\nAcquire: Google reviews; a Facebook page\nOperate: warranty call-backs';
const BY = 'Answered as: Owner (Sam)';
const SLOTS: [number, string][] = [[163, 'Workflow: builder referrals\nHow: they call us'], [167, SKIPPED]];
const base = () => new Map<number, string>([[145, 'Acme Plumbing'], [147, 'Drafting quotes'], [160, 'builder referrals\nGoogle reviews'], [Q194, OWN]]);

const cases: { name: string; answers: Map<number, string>; more: string; by: string }[] = [
  { name: 'own 194 text, more workflows and role', answers: base(), more: MORE, by: BY },
  { name: 'own 194 text only', answers: base(), more: '', by: '' },
  { name: 'no 194 answer, more workflows only', answers: (() => { const m = base(); m.delete(Q194); return m; })(), more: MORE, by: '' },
  { name: 'no 194 answer, role only', answers: (() => { const m = base(); m.delete(Q194); return m; })(), more: '', by: BY },
  { name: '194 skipped ("to fill")', answers: (() => { const m = base(); m.set(Q194, SKIPPED); return m; })(), more: MORE, by: BY },
  { name: 'nothing for 194 at all', answers: (() => { const m = base(); m.delete(Q194); return m; })(), more: '', by: '' },
];

const g194 = (p: [number, string][]) => new Map(p).get(Q194);

// (a) No growth answers: identical to today.
for (const c of cases) {
  for (const [label, growth] of [
    ['not offered', undefined],
    ['declined (none asked)', []],
    ['all eight skipped', GROWTH_QUESTIONS.map(() => SKIPPED)],
    ['some skipped, rest blank', [SKIPPED, '  ', SKIPPED]],
  ] as [string, (string | undefined)[] | undefined][]) {
    test(`(a) no growth answers (${label}) = payload identical to today: ${c.name}`, () => {
      const now = buildPayload({ answers: c.answers, slots: SLOTS, more: c.more, answeredAs: c.by, growth, anythingElseQid: Q194 });
      assert.deepEqual(now, legacyPayload(c.answers, SLOTS, c.more, c.by));
    });
  }
}

// (b) Some growth answers: one Growth block, after the person's own 194 text.
test('(b) growth answers: one Growth block after the person\'s own 194 text, own text untouched', () => {
  const growth = ['A builder referral, a Google search, a neighbour', SKIPPED, undefined, '$4,000 a job, about $1,200 left'];
  const now = g194(buildPayload({ answers: base(), slots: SLOTS, more: MORE, answeredAs: BY, growth, anythingElseQid: Q194 }))!;
  assert.ok(now.startsWith(`${OWN}\n\n`), 'own text first and unchanged');
  assert.equal(now.split(GROWTH_START).length - 1, 1, 'exactly one Growth block');
  assert.equal(now.split(GROWTH_END).length - 1, 1, 'exactly one end marker');
  assert.ok(now.indexOf(GROWTH_START) > OWN.length);
  assert.ok(now.indexOf(MORE) < now.indexOf(GROWTH_START), 'after More workflows');
  assert.ok(now.endsWith(`${GROWTH_END}\n\n${BY}`), 'Answered as still closes the field');
  assert.ok(now.includes(`G1. ${GROWTH_QUESTIONS[0].text}\nA builder referral, a Google search, a neighbour`));
  assert.ok(now.includes(`G2. ${GROWTH_QUESTIONS[1].text}\n${SKIPPED}`), 'skipped = to fill');
  assert.ok(!now.includes('G3.'), 'a question never offered is left out');
  assert.ok(now.includes(`G4. ${GROWTH_QUESTIONS[3].text}\n$4,000 a job, about $1,200 left`));
});

test('(b) growth answers without an own 194 answer: the block starts the field', () => {
  const a = base(); a.delete(Q194);
  const now = g194(buildPayload({ answers: a, slots: SLOTS, more: '', answeredAs: '', growth: ['Referrals'], anythingElseQid: Q194 }))!;
  assert.equal(now, growthBlock(['Referrals']));
  assert.ok(now.startsWith(GROWTH_START) && now.endsWith(GROWTH_END));
});

test('(b) every other field is unchanged when growth is added', () => {
  const growth = GROWTH_QUESTIONS.map((q) => `answer to ${q.id}`);
  const withG = buildPayload({ answers: base(), slots: SLOTS, more: MORE, answeredAs: BY, growth, anythingElseQid: Q194 });
  const today = legacyPayload(base(), SLOTS, MORE, BY);
  assert.deepEqual(withG.map(([q]) => q), today.map(([q]) => q), 'same fields, same order');
  for (const [q, v] of today) if (q !== Q194) assert.equal(new Map(withG).get(q), v);
});

// (c) More workflows overflow is unchanged.
test('(c) "More workflows" overflow is unchanged, with or without growth', () => {
  const growth = ['Referrals', 'More renovations'];
  const now = g194(buildPayload({ answers: base(), slots: SLOTS, more: MORE, answeredAs: BY, growth, anythingElseQid: Q194 }))!;
  const today = g194(legacyPayload(base(), SLOTS, MORE, BY))!;
  assert.ok(now.startsWith(`${OWN}\n\n${MORE}\n\n`), 'own text, then More workflows, exactly as today');
  assert.ok(today.startsWith(`${OWN}\n\n${MORE}\n\n`));
  assert.equal(now.split('More workflows:').length - 1, 1);
});

// Field limit: the person's text is never cut; the Growth block is cut or left out instead.
test('field 194 stays within the limit; the person\'s own text is never cut', () => {
  const own = 'x'.repeat(TEXT_MAX - 600);
  const a = base(); a.set(Q194, own);
  const growth = GROWTH_QUESTIONS.map(() => 'y'.repeat(400));
  const now = g194(buildPayload({ answers: a, slots: SLOTS, more: MORE, answeredAs: BY, growth, anythingElseQid: Q194 }))!;
  assert.ok(now.length <= TEXT_MAX, `length ${now.length}`);
  assert.ok(now.startsWith(`${own}\n\n${MORE}`));
  assert.ok(now.endsWith(BY));
  assert.equal(now.split(GROWTH_START).length - 1, 1);
  assert.ok(now.includes(GROWTH_END));
});

test('no room at all: the Growth block is left out, everything else as today', () => {
  const a = base(); a.set(Q194, 'x'.repeat(TEXT_MAX));
  const now = buildPayload({ answers: a, slots: SLOTS, more: MORE, answeredAs: BY, growth: ['Referrals'], anythingElseQid: Q194 });
  assert.deepEqual(now, legacyPayload(a, SLOTS, MORE, BY));
});

test('growthBlock: empty when nothing is answered', () => {
  assert.equal(growthBlock([]), '');
  assert.equal(growthBlock(GROWTH_QUESTIONS.map(() => SKIPPED)), '');
});

test('there are exactly eight growth questions, G1-G8, worded as approved', () => {
  assert.deepEqual(GROWTH_QUESTIONS.map((q) => q.id), ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8']);
  assert.equal(GROWTH_QUESTIONS[2].text, 'If ten more good enquiries came in next month, could you take them? What gives first: people, time or materials?');
  for (const q of GROWTH_QUESTIONS) assert.ok(q.hint.startsWith('For example') || q.hint.startsWith('Rough is fine'));
});
