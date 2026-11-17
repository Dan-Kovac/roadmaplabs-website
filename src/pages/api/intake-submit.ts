import type { APIRoute } from 'astro';
import { CLOSING, TEXT_QIDS } from '../../data/intake';

export const prerender = false;

// Vercel caps serverless request bodies at ~4.5MB. Anything near that should come in as a link.
const BODY_LIMIT = 4.5 * 1024 * 1024;
const TOO_LARGE =
  'Those files are too big to send through the page (the limit is about 4MB in total). Please put them in Google Drive, Dropbox or similar and paste the link instead.';

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.JOTFORM_API_KEY ?? process.env.JOTFORM_API_KEY;
  const formId = import.meta.env.JOTFORM_FORM_ID ?? process.env.JOTFORM_FORM_ID ?? '263198186491065';
  if (!apiKey) {
    console.error('intake-submit: JOTFORM_API_KEY is not set');
    return json(500, { ok: false, error: "The form isn't connected yet. Please email dan@roadmaplabs.com.au and we'll sort it out." });
  }

  const length = Number(request.headers.get('content-length') || 0);
  if (length > BODY_LIMIT) return json(413, { ok: false, error: TOO_LARGE });

  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return json(400, { ok: false, error: "We couldn't read that submission. Please try again." });
  }

  // Rebuild the payload from known fields only, as submission[<qid>].
  const out = new FormData();
  out.append('apiKey', apiKey);
  let answered = 0;
  for (const [key, value] of incoming.entries()) {
    const qid = Number(key);
    if (!Number.isInteger(qid)) continue;
    if (TEXT_QIDS.has(qid) && typeof value === 'string') {
      out.append(`submission[${qid}]`, value.slice(0, 20000));
      if (value.trim()) answered++;
    } else if (qid === CLOSING.files && typeof value !== 'string' && value.size > 0) {
      out.append(`submission[${qid}][]`, value, value.name);
      answered++;
    }
  }
  if (!answered) return json(400, { ok: false, error: 'There were no answers to send.' });

  try {
    const res = await fetch(`https://api.jotform.com/form/${encodeURIComponent(formId)}/submissions`, {
      method: 'POST',
      body: out,
    });
    const data = (await res.json().catch(() => null)) as { responseCode?: number; message?: string; content?: { submissionID?: string } } | null;
    const id = data?.content?.submissionID;
    if (!res.ok || data?.responseCode !== 200 || !id) {
      console.error('intake-submit: Jotform rejected the submission', res.status, data?.message);
      return json(502, { ok: false, error: "Your answers didn't save on our side. Please try again in a minute." });
    }
    return json(200, { ok: true, submissionId: id });
  } catch (err) {
    console.error('intake-submit: Jotform request failed', err);
    return json(502, { ok: false, error: "Your answers didn't save on our side. Please try again in a minute." });
  }
};

export const ALL: APIRoute = () => json(405, { ok: false, error: 'Method not allowed' });
