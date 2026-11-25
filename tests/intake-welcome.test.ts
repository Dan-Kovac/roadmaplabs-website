// The /intake welcome screen offers "Start a voice interview" only when
// PUBLIC_ELEVENLABS_AGENT_ID is set. Unset or blank hides that option.
// Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { welcomeVoiceGate } from '../src/data/intake-welcome.ts';

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

test('the welcome screen uses that gate for every voice entry point', () => {
  assert.match(page, /welcomeVoiceGate\(import\.meta\.env\.PUBLIC_ELEVENLABS_AGENT_ID\)/);
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
