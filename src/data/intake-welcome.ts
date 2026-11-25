// Whether the /intake welcome screen offers a voice interview.
// PUBLIC_ELEVENLABS_AGENT_ID is public and inlined at build time. Blank means voice is not live.

export interface WelcomeVoiceGate {
  /** Trimmed agent id. Empty when the variable is unset, missing, or only whitespace. */
  agentId: string;
  /** True when the welcome screen should show its voice entry points. */
  offered: boolean;
}

export function welcomeVoiceGate(raw: string | undefined | null): WelcomeVoiceGate {
  const agentId = (raw ?? '').trim();
  return { agentId, offered: agentId.length > 0 };
}

/** Welcome lead as it reads when voice is live. The last sentence is the only part that changes. */
const WELCOME_LEAD_WITH_VOICE =
  "I'm Harry. First the basics, how you use AI today and the tools you run on. Then, if you have time, we'll walk through how work comes in, gets done and gets looked after. Type, talk, or switch to a voice interview whenever you like.";

const WELCOME_LEAD_VOICE_SENTENCE = 'Type, talk, or switch to a voice interview whenever you like.';
const WELCOME_LEAD_CHAT_SENTENCE = 'Just type your answers, in your own words.';

/** Page description as it reads when voice is live. Only the "or by voice" phrase changes. */
const PAGE_DESCRIPTION_WITH_VOICE =
  'The Roadmap Labs client intake: answer a short interview about your business by chat or by voice, and share any files or links that help.';

const PAGE_DESCRIPTION_VOICE_PHRASE = ' or by voice';

export function welcomeLead(offered: boolean): string {
  return offered
    ? WELCOME_LEAD_WITH_VOICE
    : WELCOME_LEAD_WITH_VOICE.replace(WELCOME_LEAD_VOICE_SENTENCE, WELCOME_LEAD_CHAT_SENTENCE);
}

export function intakePageDescription(offered: boolean): string {
  return offered
    ? PAGE_DESCRIPTION_WITH_VOICE
    : PAGE_DESCRIPTION_WITH_VOICE.replace(PAGE_DESCRIPTION_VOICE_PHRASE, '');
}
