// SERVER ONLY. Reads the tailored briefs (with their tokens). Import this only from API routes and server-rendered
// pages (prerender = false), never from a page script, so no brief or token ever reaches the browser bundle.
//
// v1 keeps briefs as files in src/data/briefs/. Production should keep them in a Supabase table instead
// (see docs/tailored-intake/README.md), so a new brief doesn't need a deploy.

import { createHash, timingSafeEqual } from 'node:crypto';
import { checkBrief, type Brief } from '../data/brief';

const files = import.meta.glob<{ default: unknown }>('../data/briefs/*.json', { eager: true });

/** Every brief file that passes the checks. A file that fails is left out (and listed by `brokenBriefs`). */
const loaded: { file: string; brief?: Brief; errors: string[] }[] = Object.entries(files).map(([path, mod]) => {
  const c = checkBrief(mod.default);
  return { file: path.split('/').pop()!, brief: c.ok ? c.brief : undefined, errors: c.errors };
});

export const allBriefs = (): Brief[] => loaded.filter((x) => x.brief).map((x) => x.brief!);
export const brokenBriefs = () => loaded.filter((x) => !x.brief).map((x) => ({ file: x.file, errors: x.errors }));

const digest = (s: string) => createHash('sha256').update(s).digest();

/** The brief for a token, compared in constant time so response timing gives nothing away. */
export function briefForToken(token: unknown): Brief | null {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{32,64}$/.test(token)) return null;
  const want = digest(token);
  let found: Brief | null = null;
  for (const b of allBriefs()) if (timingSafeEqual(digest(b.token), want)) found = b;
  return found;
}
