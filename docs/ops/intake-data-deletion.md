# Deleting a client's intake data (manual checklist)

Nothing in the intake deletes data automatically. We do it by hand, and we have told clients we will.

## When to do it

- **The client decides not to go ahead:** do every line below promptly.
- **The client's own setup is running:** once their environment is set up and they're happy with it, do every line below.
- **The client asks us to delete it:** at any time, do every line below.

Before you start, note the client's business name (the `client` field, or the business name answer) and the date they sent the intake. You'll use both to find their data.

## Checklist

| # | Where | What to delete | How |
|---|---|---|---|
| 1 | **Jotform** (form 263198186491065) | Their submission: all answers, attached files, links, recording links | Jotform, My Forms, open the intake form, Submissions. Find theirs by business name or date, select it, Delete. Moving a submission to Trash is not enough: Jotform keeps trashed submissions for 30 days. So after deleting, open the Inbox, the menu at the top right of the tab bar, Trash, and choose "Empty Trash Now" (only after checking the Trash holds nothing else you need). Then open one of their file links from your notes: it should no longer load. Tested 26 Nov 2026 with a fake submission: it is gone from Inbox and Trash. Jotform stores our submissions in the United States, per Jotform's published information. |
| 2 | **Email inbox** | Jotform notification emails for that submission, if notifications are on, and any emails we forwarded with their answers | Search the inbox for the business name and "Jotform". Delete, then empty Deleted Items. |
| 3 | **Supabase, `intake-recordings` bucket** | Each screen recording they made | The saved path is in their submission (and in the links) as `intake-recordings/YYYY-MM-DD/<business-slug>-<id>.webm` (or `.mp4`). Copy it before step 1. In Supabase: project, Storage, `intake-recordings`, open the date folder, select the file, Delete. Use the dashboard or the Storage API. Don't delete rows from `storage.objects` with SQL; that leaves the file behind. The project is `roadmaplabs-website`, in the Sydney region. Tested 26 Nov 2026: deleting from the Supabase Storage dashboard removes the file. |
| 4 | **Signed viewing links** | The one-year links to those recordings | Nothing extra to do. A link stops working once its file is deleted in step 3. Check by opening one: it should fail. (Don't rotate the project's keys to kill links; that breaks everything else.) |
| 5 | **ElevenLabs** (voice interviews, once voice is live) | The conversation recordings and transcripts of their voice interview | ElevenLabs, Conversational AI, Agents, "Harry (Roadmap Labs intake)", Call history. Find their calls by date and time, open each and delete it. Or use the API: `DELETE https://api.elevenlabs.io/v1/convai/conversations/{conversation_id}` with our API key. Before voice goes live, set the ElevenLabs agent's data retention (Advanced tab) or switch audio saving off. ElevenLabs keeps transcripts and audio for 2 years by default. |
| 6 | **OpenRouter** (chat helper, only if its key is set) | Any stored text of questions they asked Harry | In OpenRouter settings, check that prompt and response logging is off. With it off, OpenRouter keeps usage numbers, not the text, so there's nothing to delete. If it was ever on, delete their entries if OpenRouter allows it, or ask OpenRouter support. |
| 7 | **Their browser** | Answers saved on their own device while answering | Nothing for us to do. The page clears them when they send, or when they choose "Start over". If they didn't send, tell them they can choose Start over or clear site data for roadmaplabs.com.au. |
| 8 | **Our own copies** | Anything we copied out: downloaded files, notes, drafts, chat or Slack messages with their answers, the files we built from them | Delete our working copies. Once their own setup is running, their files live in their environment, not ours. |
| 9 | **Vercel logs** | Nothing to delete | Our server code doesn't log answers. Logs only hold error messages and submission IDs, and Vercel drops them after a short time. |

## Record it

Write one line in the client's record, without any of their answers. For example:

> Intake data deleted 25 Nov 2026 (Jotform, inbox, Supabase x2 recordings, ElevenLabs x1 call). Reason: setup finished.

## Keep the promise true

The intake, the voice agent and /privacy all say this:

> Your information is stored securely. If you decide not to go ahead, we delete it promptly. Once your own setup is running, we delete it from our side too.

If anything above stops being done, or a new tool starts holding intake data, update this checklist, /privacy and that wording together.
