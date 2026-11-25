// Unit tests for tailored briefs: the checks, what the client sees, and where tailored answers go.
// Pure functions only. Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { checkBrief, publicView, tailoredBlock, tailoredIds, plainTextProblem, BRIEF_START, MARKETING_START } from '../src/data/brief.ts';
import { buildPayload, GROWTH_START } from '../src/data/intake-growth.ts';

const base = () => ({
  slug: 'example-co',
  token: 'abcdefghijklmnopqrstuvwxyz012345',
  businessName: 'Example Co',
  known: [{ text: 'A plumbing business', status: 'confirmed' }, { text: 'Team size', status: 'to-check' }],
  skip: ['S1'],
  opening: 'I have got that Example Co is a plumbing business. Is that right?',
  questions: { winning: ['How do quotes go out?'] } as Record<string, unknown>,
});
const today = new Date('2026-11-25T12:00:00Z');

test('the briefs in the repo pass', () => {
  for (const f of fs.readdirSync('src/data/briefs')) {
    const c = checkBrief(JSON.parse(fs.readFileSync(`src/data/briefs/${f}`, 'utf8')), today);
    assert.deepEqual(c.errors, [], f);
  }
});

test('anything that is not plain text is refused', () => {
  for (const bad of ['<b>hi</b>', 'see https://x.com', 'visit www.x.com', 'a `code` bit', 'line\nbreak', 'long — dash', 'javascript:alert(1)', '{{x}}']) {
    assert.ok(plainTextProblem(bad, 400), bad);
  }
  assert.equal(plainTextProblem("What's your CRM, and who uses it?", 400), '');
  const b = base(); b.opening = 'Hi <script>alert(1)</script>';
  assert.equal(checkBrief(b, today).ok, false);
});

test('unknown fields, bad skip ids, light accents and bad tokens are refused', () => {
  assert.equal(checkBrief({ ...base(), extra: 1 }, today).ok, false);
  assert.equal(checkBrief({ ...base(), skip: ['Z9'] }, today).ok, false);
  assert.equal(checkBrief({ ...base(), accent: '#ffd700' }, today).ok, false); // too light for white text
  assert.equal(checkBrief({ ...base(), accent: '#1a5bb5' }, today).ok, true);
  assert.equal(checkBrief({ ...base(), token: 'short' }, today).ok, false);
  assert.equal(checkBrief({ ...base(), logoUrl: 'http://x.com/logo.png' }, today).ok, false);
  assert.equal(checkBrief({ ...base(), logoUrl: 'https://x.com/logo.png' }, today).ok, true);
});

test('a figure needs sourced evidence holding that figure, and a figure-free fallback', () => {
  const ev = [{ id: 'e1', kind: 'monthly-searches', value: '1,300', source: 'DataForSEO via Composio (test)', pulled: '2026-11-20', status: 'confirmed' }];
  const q = (m: unknown) => ({ ...base(), evidence: ev, questions: { marketing: [m] } });
  assert.equal(checkBrief({ ...base(), questions: { marketing: [{ text: 'People search this 900 times a month. Thoughts?' }] } }, today).ok, false);
  assert.equal(checkBrief(q({ text: 'People search this about 1300 times a month. Thoughts?', uses: ['e1'] }), today).ok, false); // no fallback
  assert.equal(checkBrief(q({ text: 'People search this about 1300 times a month. Thoughts?', uses: ['e1'], fallback: 'About 50 people search. Thoughts?' }), today).ok, false); // fallback has a figure
  assert.equal(checkBrief(q({ text: 'People search this about 2000 times a month. Thoughts?', uses: ['e1'], fallback: 'Do you know where you show up?' }), today).ok, false); // not the evidence figure
  assert.equal(checkBrief(q({ text: 'People search this about 1300 times a month. Thoughts?', uses: ['e1'], fallback: 'Do you know where you show up?' }), today).ok, true);
  assert.equal(checkBrief(q({ text: 'What do you use, Cin7 or MYOB?' }), today).ok, true); // digits inside names aren't figures
  // Ordinals and page numbers are figures too.
  assert.equal(checkBrief(q({ text: 'You show up around 19th, on page 2. Thoughts?' }), today).ok, false);
  const rank = [{ id: 'e2', kind: 'ranking', value: 'position 19 (page 2)', source: 'DataForSEO via Composio (test)', pulled: '2026-11-20', status: 'confirmed' }];
  assert.equal(checkBrief({ ...base(), evidence: rank, questions: { marketing: [{ text: 'You show up around 19th, on page 2. Thoughts?', uses: ['e2'], fallback: 'Do you know where you show up?' }] } }, today).ok, true);
});

test('figures older than 30 days get a warning, and dates must be real', () => {
  const ev = (pulled: string) => ({ ...base(), evidence: [{ id: 'e1', kind: 'search-term', value: 'plumber geelong', source: 'from Dan', pulled, status: 'confirmed' }] });
  assert.equal(checkBrief(ev('2026-11-20'), today).warnings.length, 0);
  assert.equal(checkBrief(ev('2026-09-01'), today).warnings.length, 1);
  assert.equal(checkBrief(ev('2026-02-30'), today).ok, false);
  assert.equal(checkBrief(ev('2027-01-01'), today).ok, false);
});

test('the client never sees the token, the website, evidence, "to check" notes, or unconfirmed figures', () => {
  const b = { ...base(), website: 'https://example.com.au', evidence: [{ id: 'e1', kind: 'monthly-searches', value: '1300', source: 'test', pulled: '2026-11-20', status: 'unverified' }],
    questions: { marketing: [{ text: 'People search this about 1300 times a month. Thoughts?', uses: ['e1'], fallback: 'Do you know where you show up?' }] } };
  const c = checkBrief(b, today);
  assert.equal(c.ok, true, c.errors.join('; '));
  const pub = JSON.stringify(publicView(c.brief!));
  for (const hidden of ['abcdefghijklmnop', 'example.com.au', 'Team size', 'evidence', '1300']) assert.ok(!pub.includes(hidden), hidden);
  assert.ok(pub.includes('Do you know where you show up?'));
});

test('tailored answers go before growth in field 194; without a brief the payload is unchanged', () => {
  const pub = publicView(checkBrief({ ...base(), questions: { winning: ['How do quotes go out?'], marketing: [{ text: 'Which channel?' }] } }, today).brief!);
  const ids = tailoredIds(pub).map((t) => t.id);
  assert.deepEqual(ids, ['B0', 'B1', 'B2']);
  const answers = new Map([['opening', 'Yes'], ['winning:0', 'By email'], ['marketing:0', 'Referrals'], ['marketing:0:f', 'Spent nothing']]);
  const block = tailoredBlock(pub, answers);
  assert.ok(block.startsWith(BRIEF_START));
  assert.ok(block.includes(MARKETING_START));
  assert.ok(block.indexOf('Spent nothing') > block.indexOf(MARKETING_START));
  const growth = ['Yes', ...Array(7).fill(undefined)];
  const parts = { answers: new Map([[194, 'Own words']]), slots: [] as [number, string][], more: '', answeredAs: 'Answered as: Owner', growth, anythingElseQid: 194 };
  const plain = new Map(buildPayload(parts)).get(194)!;
  const withBrief = new Map(buildPayload({ ...parts, tailored: block })).get(194)!;
  assert.ok(!plain.includes(BRIEF_START));
  assert.ok(withBrief.startsWith('Own words'));
  assert.ok(withBrief.indexOf(BRIEF_START) < withBrief.indexOf(GROWTH_START));
  assert.ok(withBrief.endsWith('Answered as: Owner'));
  assert.deepEqual(buildPayload({ ...parts, tailored: '' }), buildPayload(parts));
});
