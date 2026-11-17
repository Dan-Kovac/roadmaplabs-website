import type { APIRoute } from 'astro';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { RECORDING } from '../../data/intake';

export const prerender = false;

// Screen recordings from /intake go to a private Supabase Storage bucket.
// The video never passes through this function (Vercel caps request bodies at ~4.5MB):
//   1. POST { action: 'start', contentType, size }  -> a one-time signed upload URL for a fresh path
//   2. the browser uploads the file straight to Supabase with that URL
//   3. POST { action: 'finish', path }               -> checks the file is there, returns a long-lived signed read URL
// Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server only). The bucket is created on first use if it's missing.

const BUCKET = RECORDING.bucket;
const READ_URL_SECONDS = 60 * 60 * 24 * 365; // a year; the storage path is kept alongside so a fresh URL can be made later

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const NOT_READY = "Screen recording isn't switched on yet. Please paste a Loom or screen-recording link instead.";

let bucketChecked = false;
async function ensureBucket(sb: SupabaseClient) {
  if (bucketChecked) return;
  const { data } = await sb.storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await sb.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: RECORDING.maxBytes,
      allowedMimeTypes: ['video/webm', 'video/mp4'],
    });
    if (error && !/already exists/i.test(error.message)) throw error;
  }
  bucketChecked = true;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

export const POST: APIRoute = async ({ request }) => {
  const url = import.meta.env.SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('intake-recording: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');
    return json(503, { ok: false, error: NOT_READY });
  }

  let body: { action?: string; contentType?: string; size?: number; path?: string; client?: string };
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Bad request' });
  }

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    await ensureBucket(sb);

    if (body.action === 'start') {
      const type = String(body.contentType || '').split(';')[0];
      if (type !== 'video/webm' && type !== 'video/mp4') return json(400, { ok: false, error: 'That recording format isn’t supported. Please paste a Loom link instead.' });
      const size = Number(body.size || 0);
      if (!size || size > RECORDING.maxBytes) {
        return json(413, { ok: false, error: 'That recording is too big to upload (the limit is 50MB). Please record a shorter one, or paste a Loom link instead.' });
      }
      const day = new Date().toISOString().slice(0, 10);
      const who = slug(String(body.client || '')) || 'intake';
      const path = `${day}/${who}-${crypto.randomUUID()}.${type === 'video/mp4' ? 'mp4' : 'webm'}`;
      const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
      if (error || !data) throw error ?? new Error('No upload URL');
      return json(200, { ok: true, uploadUrl: data.signedUrl, path: data.path ?? path });
    }

    if (body.action === 'finish') {
      const path = String(body.path || '');
      if (!/^\d{4}-\d{2}-\d{2}\/[a-z0-9-]+\.(webm|mp4)$/.test(path)) return json(400, { ok: false, error: 'Bad request' });
      const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(path, READ_URL_SECONDS);
      if (error || !data?.signedUrl) return json(404, { ok: false, error: "The recording didn't finish uploading. Please try again, or paste a Loom link instead." });
      return json(200, { ok: true, url: data.signedUrl, path: `${BUCKET}/${path}` });
    }

    return json(400, { ok: false, error: 'Bad request' });
  } catch (err) {
    console.error('intake-recording: Supabase error', err);
    return json(502, { ok: false, error: "The recording couldn't be saved. Please try again, or paste a Loom link instead." });
  }
};

export const ALL: APIRoute = () => json(405, { ok: false, error: 'Method not allowed' });
