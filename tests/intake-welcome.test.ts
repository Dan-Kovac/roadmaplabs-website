// The /intake welcome screen offers "Start a voice interview" only when
// PUBLIC_ELEVENLABS_AGENT_ID is set. Unset or blank hides that option.
// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { intakePageDescription, welcomeLead, welcomeVoiceGate } from '../src/data/intake-welcome.ts';

const LEAD_SET =
  "I'm Harry. First the basics, how you use AI today and the tools you run on. Then, if you have time, we'll walk through how work comes in, gets done and gets looked after. Type, talk, or switch to a voice interview whenever you like.";
const LEAD_UNSET =
  "I'm Harry. First the basics, how you use AI today and the tools you run on. Then, if you have time, we'll walk through how work comes in, gets done and gets looked after. Just type your answers, in your own words.";
const DESCRIPTION_SET =
  'The Roadmap Labs client intake: answer a short interview about your business by chat or by voice, and share any files or links that help.';
const DESCRIPTION_UNSET =
  'The Roadmap Labs client intake: answer a short interview about your business by chat, and share any files or links that help.';

const page = readFileSync(new URL('../src/pages/intake.astro', import.meta.url), 'utf8');

test('welcome screen hides Start a voice interview when PUBLIC_ELEVENLABS_AGENT_ID is unset or empty', () => {
  for (const raw of [undefined, null, '', '   ', '\n', '\t  \n']) {
    const gate = welcomeVoiceGate(raw);
    assert.equal(gate.agentId, '');
    assert.equal(gate.offered, false, `expected voice hidden for ${JSON.stringify(raw)}`);
  }
});

test('welcome screen shows Start a voice interview when PUBLIC_ELEVENLABS_AGENT_ID is set', () => {
  for (const raw of ['agent_dummy_roa362', '  agent_dummy_roa362  ', 'abc']) {
    const gate = welcomeVoiceGate(raw);
    assert.equal(gate.agentId, raw.trim());
    assert.equal(gate.offered, true, `expected voice shown for ${JSON.stringify(raw)}`);
  }
});

test('welcome lead and meta description drop voice when PUBLIC_ELEVENLABS_AGENT_ID is unset or empty', () => {
  for (const raw of [undefined, null, '', '   ', '\n', '\t  \n']) {
    const { offered } = welcomeVoiceGate(raw);
    assert.equal(offered, false);
    assert.equal(welcomeLead(offered), LEAD_UNSET);
    assert.equal(welcomeLead(offered).slice(welcomeLead(offered).lastIndexOf('. ') + 2), 'Just type your answers, in your own words.');
    assert.equal(intakePageDescription(offered), DESCRIPTION_UNSET);
    assert.equal(intakePageDescription(offered).includes('voice'), false);
  }
  // Only the last sentence, and only the "or by voice" phrase, change.
  assert.equal(LEAD_UNSET.slice(0, LEAD_SET.lastIndexOf('Type, talk')), LEAD_SET.slice(0, LEAD_SET.lastIndexOf('Type, talk')));
  assert.equal(DESCRIPTION_UNSET, DESCRIPTION_SET.replace(' or by voice', ''));
});

test('welcome lead and meta description stay as they are when PUBLIC_ELEVENLABS_AGENT_ID is set', () => {
  for (const raw of ['agent_dummy_roa362', '  agent_dummy_roa362  ', 'abc']) {
    const { offered } = welcomeVoiceGate(raw);
    assert.equal(offered, true);
    assert.equal(welcomeLead(offered), LEAD_SET);
    assert.equal(intakePageDescription(offered), DESCRIPTION_SET);
  }
});

test('the welcome screen uses that gate for every voice entry point', () => {
  assert.match(page, /welcomeVoiceGate\(import\.meta\.env\.PUBLIC_ELEVENLABS_AGENT_ID\)/);
  assert.match(page, /description=\{intakePageDescription\(offerVoice\)\}/);
  assert.match(page, /<p class="ik-welcome__lead">\{welcomeLead\(offerVoice\)\}<\/p>/);
  assert.match(page, /data-agent=\{agentId \|\| undefined\}/);
  // The button is the same control as today, rendered only while voice is offered.
  assert.match(
    page,
    /\{offerVoice && \(\s*<button class="ik-cta ik-cta--quiet" type="button" id="ik-start-voice">/,
  );
  // The top-bar Voice control also starts voice from the welcome screen. Hide the whole switch there
  // when no agent id is set, so a one-sided Chat pill is not left behind.
  assert.match(page, /\.ik:not\(\[data-agent\]\)\[data-view="welcome"\] \.ik-modes \{ display: none; \}/);
  assert.match(page, /if \(b\.dataset\.mode === 'voice' && !agentId\) return;/);
  assert.match(page, /document\.getElementById\('ik-start-voice'\)\?\.addEventListener\('click', \(\) => \{\s*if \(agentId\) startFlow\('voice'\);/);
});
