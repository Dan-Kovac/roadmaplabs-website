import type { APIRoute } from 'astro';
import { BLOCKED_FILE, CLOSING, TEXT_QIDS } from '../../data/intake';
import { NOT_THIS_SITE, TOO_MANY, rateLimit, sameSite } from '../../lib/api-guard';

export const prerender = false;

// Vercel caps serverless request bodies at ~4.5MB. Anything near that should come in as a link.
const BODY_LIMIT = 4.5 * 1024 * 1024;
const TOO_LARGE =
  'Those files are too big to send through the page (the limit is about 4MB in total). Please put them in Google Drive, Dropbox or similar and paste the link instead.';

const json = (status: number, body: object, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra } });

const MAX_FILES = 20;

export const POST: APIRoute = async ({ request }) => {
  if (!sameSite(request)) return json(403, { ok: false, error: NOT_THIS_SITE });
  // A real person sends once or twice; a retry after an error is fine. More than this from one address is spam.
  const wait = rateLimit('submit', request, 6, 15 * 60_000);
  if (wait) return json(429, { ok: false, error: TOO_MANY }, { 'Retry-After': String(wait) });

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
  let fileCount = 0;
  for (const [key, value] of incoming.entries()) {
    const qid = Number(key);
    if (!Number.isInteger(qid)) continue;
    if (TEXT_QIDS.has(qid) && typeof value === 'string') {
      out.append(`submission[${qid}]`, value.slice(0, 20000));
      if (value.trim()) answered++;
    } else if (qid === CLOSING.files && typeof value !== 'string' && value.size > 0) {
      if (BLOCKED_FILE.test(value.name)) return json(400, { ok: false, error: `${value.name} is a program or script file, which we can't accept. Please remove it and send again.` });
      if (++fileCount > MAX_FILES) return json(400, { ok: false, error: `That's more than ${MAX_FILES} files. Please put them in a shared folder and paste the link instead.` });
      out.append(`submission[${qid}][]`, value, value.name);
      answered++;
    }
  }
  if (!answered) return json(400, { ok: false, error: 'There were no answers to send.' });

  try {
    const res = await fetch(`${JOTFORM}/form/${encodeURIComponent(formId)}/submissions`, {
      method: 'POST',
      body: out,
    });
    const data = (await res.json().catch(() => null)) as { responseCode?: number; message?: string; content?: { submissionID?: string } } | null;
    const id = data?.content?.submissionID;
    if (!res.ok || data?.responseCode !== 200 || !id) {
      console.error('intake-submit: Jotform rejected the submission', res.status, data?.message);
      return json(502, { ok: false, error: "Your answers didn't save on our side. Please try again in a minute." });
    }
    const link = String(incoming.get(String(CLOSING.link)) ?? '').trim();
    const linkSaved = link ? await ensureLink(apiKey, id, link, String(incoming.get(String(CLOSING.anythingElse.qid)) ?? '')) : true;
    return json(200, { ok: true, submissionId: id, linkSaved });
  } catch (err) {
    console.error('intake-submit: Jotform request failed', err);
    return json(502, { ok: false, error: "Your answers didn't save on our side. Please try again in a minute." });
  }
};

const JOTFORM = 'https://api.jotform.com';
type Answer = { name?: string; type?: string; answer?: unknown };

async function readAnswers(apiKey: string, id: string): Promise<Record<string, Answer> | null> {
  const r = await fetch(`${JOTFORM}/submission/${encodeURIComponent(id)}?apiKey=${encodeURIComponent(apiKey)}`);
  const d = (await r.json().catch(() => null)) as { content?: { answers?: Record<string, Answer> } } | null;
  return d?.content?.answers ?? null;
}

async function editSubmission(apiKey: string, id: string, fields: Record<string, string>) {
  const body = new URLSearchParams({ apiKey });
  for (const [qid, v] of Object.entries(fields)) body.set(`submission[${qid}]`, v);
  const r = await fetch(`${JOTFORM}/submission/${encodeURIComponent(id)}`, { method: 'POST', body });
  return r.ok;
}

const answerText = (a?: Answer) => (typeof a?.answer === 'string' ? a.answer.trim() : a?.answer ? JSON.stringify(a.answer) : '');

/**
 * Make sure the shared links (typed links and screen recordings) end up in the submission.
 * The link field (196) can silently drop a value Jotform doesn't accept, e.g. when the field validates a single
 * URL and gets several joined together. Read the submission back; if 196 is empty, retry with the first URL alone,
 * and if any links still aren't stored, append them to the "anything else" answer (194) under a clear label.
 */
async function ensureLink(apiKey: string, id: string, link: string, anythingElse: string): Promise<boolean> {
  try {
    const key = String(CLOSING.link);
    let answers = await readAnswers(apiKey, id);
    if (!answers) return false;
    if (answerText(answers[key])) return true;
    console.warn('intake-submit: link field came back empty; repairing', { submissionId: id, fieldType: answers[key]?.type, fieldName: answers[key]?.name });

    const urls = link.split(/\s+\|\s+|\s+/).filter((u) => /^https?:\/\//i.test(u));
    let stored = '';
    if (urls[0]) {
      await editSubmission(apiKey, id, { [key]: urls[0] });
      answers = await readAnswers(apiKey, id);
      stored = answerText(answers?.[key]);
    }
    if (stored && urls.length <= 1) return true;

    const extraKey = String(CLOSING.anythingElse.qid);
    const base = answerText(answers?.[extraKey]) || anythingElse.trim();
    const block = `Links shared:\n${link.split(' | ').join('\n')}`;
    await editSubmission(apiKey, id, { [extraKey]: base ? `${base}\n\n${block}` : block });
    const final = await readAnswers(apiKey, id);
    const ok = answerText(final?.[extraKey]).includes('Links shared:');
    if (!ok) console.error('intake-submit: could not store links in the submission', { submissionId: id });
    return ok || Boolean(stored);
  } catch (err) {
    console.error('intake-submit: link check failed', err);
    return false;
  }
}

export const ALL: APIRoute = () => json(405, { ok: false, error: 'Method not allowed' });
