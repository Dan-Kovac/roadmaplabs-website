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
