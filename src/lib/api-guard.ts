// Light protection for the public /intake API routes (no accounts exist yet, so these are best effort):
// - sameSite: the request must come from a page on this same site. Stops other websites from using these
//   endpoints through a visitor's browser. A script outside a browser can still fake the headers.
// - rateLimit: a cap per IP address within a time window. It lives in the memory of one serverless instance,
//   so it slows down casual abuse but is not a hard global limit. A shared store (e.g. Vercel KV or Upstash)
//   is needed for that.

export const jsonResponse = (status: number, body: object, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra } });

/** True when the request comes from a page on this site (same host), judged by Origin, then Sec-Fetch-Site. */
export function sameSite(request: Request): boolean {
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').split(',')[0].trim().toLowerCase();
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).host.toLowerCase() === host;
    } catch {
      return false;
    }
  }
  const site = request.headers.get('sec-fetch-site');
  return site === 'same-origin';
}

/** The caller's IP as Vercel reports it. */
export function clientIp(request: Request): string {
  return (request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

const buckets = new Map<string, number[]>();

/** Returns seconds to wait when the caller is over `limit` requests in `windowMs`, else 0 (and counts this one). */
export function rateLimit(name: string, request: Request, limit: number, windowMs: number): number {
  const now = Date.now();
  const key = `${name}:${clientIp(request)}`;
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return Math.max(1, Math.ceil((windowMs - (now - hits[0])) / 1000));
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  return 0;
}

export const TOO_MANY = "That's a lot of requests in a short time. Please wait a few minutes and try again.";
export const NOT_THIS_SITE = 'Please use the form on roadmaplabs.com.au.';
