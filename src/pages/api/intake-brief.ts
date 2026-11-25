import type { APIRoute } from 'astro';
import { publicView } from '../../data/brief.ts';
import { briefForToken } from '../../lib/briefs';
import { jsonResponse as json, rateLimit, sameSite, TOO_MANY } from '../../lib/api-guard';

export const prerender = false;

// The tailored brief for /intake?brief=<token>. POST only, so the token isn't logged as part of a URL here.
// Returns the client-safe view (no token, no "to check" notes, no evidence). A wrong token gets the same plain
// answer as a missing one, so this can't be used to learn which briefs exist.

const NOT_FOUND = { ok: false, error: "That link didn't match a prepared interview." };

export const POST: APIRoute = async ({ request }) => {
  if (!sameSite(request)) return json(403, { ok: false, error: 'Please use the interview page on roadmaplabs.com.au.' });
  // Tokens are long and random; this cap just stops anyone trying many of them.
  const wait = rateLimit('brief', request, 20, 10 * 60_000);
  if (wait) return json(429, { ok: false, error: TOO_MANY }, { 'Retry-After': String(wait) });
  let token: unknown;
  try {
    token = ((await request.json()) as { token?: unknown })?.token;
  } catch {
    return json(400, NOT_FOUND);
  }
  const brief = briefForToken(token);
  if (!brief) return json(404, NOT_FOUND);
  return json(200, { ok: true, brief: publicView(brief) }, { 'X-Robots-Tag': 'noindex' });
};

export const ALL: APIRoute = () => json(405, { ok: false, error: 'Method not allowed' });
