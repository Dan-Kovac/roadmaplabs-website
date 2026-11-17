# /intake voice interview: ElevenLabs agent setup

The `/intake` page runs one interview script with one saved state. Chat and the voice interview both read and write it. The voice agent doesn't hold the questions itself. It asks the page for the current question and hands each answer back through **client tools**. That's why switching between chat and voice never repeats a question, and why spoken answers show up in the chat thread (marked "Spoken").

The page registers the tools when a call starts, using the widget's `elevenlabs-convai:call` event. The agent only needs them defined in the dashboard.

## 1. Create the agent

In ElevenLabs, go to Conversational AI → Agents → New agent. Name it "Harry (Roadmap Labs intake)".

- **First message:** `Hi, I'm Harry from Roadmap Labs. I'll pick up the interview from wherever you are. Ready?`
- **System prompt:**

```
You are Harry, the Roadmap Labs intake interviewer. Roadmap Labs is an AI consulting business for Australian businesses (roadmaplabs.com.au).

You run a structured interview, one question at a time. You never decide the questions yourself: the web page holds the script.

- At the start of the call, and whenever you're unsure what to ask, call get_current_question and do what it says.
- Ask each question exactly as the tool gives it to you. Don't reword it, merge questions or add your own.
- When the person has answered, call record_answer with their answer in their own words, as close to verbatim as you can. Don't summarise, tidy or rewrite it. If they give a long answer, include all of it.
- If they want to skip, or say they don't know, call skip_question. Skipping is normal. Never pressure them.
- When the tool tells you to offer a choice, ask it and call choose_path with "keep_going" or "wrap_up".
- Each tool tells you what to do next. Follow it.
- If they ask you something, answer briefly and return to the current question.
- Speak in plain, friendly Australian English. Keep your own turns short.
```

## 2. Add the client tools

For each tool below, go to Tools → Add tool → **Client** tool. Turn on **Wait for response**.

| Name | Description | Parameters |
|---|---|---|
| `get_current_question` | Returns the interview step to deliver now. Call at the start and whenever unsure. | none |
| `record_answer` | Saves the person's answer to the current question and returns the next step. | `answer` (string, required): the person's answer, verbatim |
| `skip_question` | Marks the current question as skipped and returns the next step. | none |
| `choose_path` | Records whether the person keeps going after the core questions or wraps up. | `path` (string, required): `keep_going` or `wrap_up` |

## 3. Widget settings

- Security → allowlist: add `roadmaplabs.com.au` and your Vercel preview domain.
- The page sets `transcript="false"` and `text-input="false"` on the widget, because the conversation thread on the page *is* the transcript. It also sets the orb colours to the brand blues.

## 4. Connect it to the site

Set `PUBLIC_ELEVENLABS_AGENT_ID` in Vercel to the agent id and redeploy (the page is static, so the id is read at build time). Until then, Voice interview mode shows a "coming online" note, and the chat, including the speak-to-type mic, does everything.
