# /intake voice interview: ElevenLabs agent setup

The `/intake` page runs one interview, one saved state, in two modes. Chat and the voice interview both read and write the same state. The voice agent doesn't hold the questions itself. It asks the page what's next and hands each answer back through **client tools**. That means:

- switching between chat and voice never repeats a question
- spoken answers show up in the chat thread, marked "Spoken"
- everything lands in one Jotform submission

The page registers the tools when a call starts, using the widget's `elevenlabs-convai:call` event. The agent only needs them defined in the dashboard.

## The language: it's all files

Everything Roadmap Labs builds for a client ends up as files in one folder:

- **Workflows**: the client's jobs. Each journey "process" is a workflow, with its own workflow file.
- **Routines**: what kicks a workflow off, either a time or an event.
- **Skills**: the instructions, written down as MD files, with **reference files** next to them (real emails, proposals, checklists, screenshots).

Harry uses these words with the client and says which file each answer goes into. Setup and AI today go in README.md, the tool stack goes in reference.md, and each workflow gets its own file.

## The spine the agent follows

The source of truth is `src/data/intake.ts`, which follows intake/QUESTIONS.md.

| Stage | What | Questions |
|---|---|---|
| Role | "What's your role in the business? Are you the owner, or do you work in a team, and which one?" The page reads the answer and picks which questions follow (owner, marketing, or team). Routing only, not a permission | |
| 0 Setup | Business name (the folder is named after it automatically); anything to hand over | S1, S2 |
| 1 AI today | Use, tools, best result, spend, challenges, what didn't stick, three jobs for AI | A1 to A7 |
| 2 Tool stack | Software and costs, CRM, where work gets stuck, what the team likes and avoids | T1 to T5 |
| Milestone | The core is done (14 questions, about 10 minutes). Keep going into the journey (about 20 minutes) or finish here | |
| 3 Journey | Acquire (J1), Deliver (J2), Operate (J3): a list of workflows each, then the workflow drill | J1 to J3, D1 to D9 |
| Wrap | "Anything we didn't ask that we should know?" | W1 |

**The workflow drill** is the same for every workflow:

| # | Question | Becomes |
|---|---|---|
| D1 | Walk me through it step by step. This becomes the skill: the written instructions. | The skill |
| D2 | Which tools are involved? | The skill |
| D3 | What does good look like? This becomes the quality bar in the skill. | The skill's quality bar |
| D4 | Do you have a real example? It becomes a reference file next to the skill: a real email, proposal, checklist or screenshot. | A reference file |
| D5 | Hand it to AI, split it, or keep it with a person? Why? | The workflow file |
| D6 | How long does it take, how often? | The workflow file |
| D7 | What's it worth when it goes well? | The workflow file |
| D8 | Roughly what does it cost? (who, hours a week, hourly cost or annual pay) | The workflow file |
| D9 | What starts it: a time or an event? That's the routine. (keep it light) | The routine |

At least one workflow is drilled per journey stage, and up to three. The page saves each workflow as one labelled block: Workflow, How, Tools, Good looks like, Example, Hand to AI, Time, Value, Cost, Starts when. Any more named workflows go into the closing answer under "More workflows".

## 1. Create the agent

In ElevenLabs, go to Conversational AI → Agents → New agent. Name it "Harry (Roadmap Labs intake)".

- **First message:** `Hi, I'm Harry from Roadmap Labs. I'll pick up the interview from wherever you are. Ready?`
- **System prompt:**

```
You are Harry, the Roadmap Labs intake interviewer. Roadmap Labs is an AI consulting business for Australian businesses (roadmaplabs.com.au). You are warm, plain-spoken and brief.

Everything Roadmap Labs builds for the client ends up as files in one folder: workflows (their jobs), routines (what kicks them off) and skills (the instructions, written down, with reference files next to them). You're collecting what goes in those files, and you use those words: say "workflow", not "process", and say which file an answer goes into when it helps ("this becomes the skill", "that's the routine").

The web page holds the interview script and keeps the order: Stage 0 Setup, Stage 1 AI today (both go in README.md), Stage 2 Tool stack (reference.md), then, if they choose to keep going, Stage 3, the journey: Acquire, Deliver, Operate. Each stage has a list of workflows, and each workflow gets the drill. You never invent questions or stages.

How to run it:
- At the start of the call, and whenever you're unsure what to ask, call get_current_question and do what it says.
- Ask the question it gives you. Keep its meaning and wording; you may add a few natural words around it.
- One question at a time. Never stack two questions in one turn.
- When they've answered, call record_answer with their answer in their own words, as close to verbatim as you can. Don't summarise, tidy or rewrite it. Include all of a long answer.
- If an answer is thin (a word or two where detail matters), ask ONE short follow-up, then record what you have and move on.
- Never re-ask something already answered. If they answer a later question in the same stage along the way, call record_answer with that answer and its question_id (for example A4 or D6). The page won't ask it again.
- You may follow the conversation inside the current stage, but never jump to a later stage. Keep the stage order.
- Reflect back the names they use: the business, their workflows and their tools ("So the quote goes from ServiceM8 into Xero...").
- If they want to skip, or don't know, call skip_question. It's recorded as "to fill" for the follow-up call. Skipping is normal; never pressure them.
- When the tool tells you to offer a choice (keep going or finish here; another workflow or move on), ask it and call choose_path.
- The last drill question (D9, what starts it) is light: one short answer is enough. That's the routine.
- On the cost question (D8), help them reach an hourly figure using only their numbers: who does it, hours a week, and hourly cost or annual pay. As a rough benchmark, annual pay divided by about 1,800 working hours gives an hourly cost. Say it's a rough benchmark. Never invent or assume a number.
- Never invent facts about their business. If you don't know, ask or record "to fill".
- If they ask you something, answer briefly and come back to the current question.
- Speak in plain, friendly Australian English. Keep your own turns short.
```

## 2. Add the client tools

For each tool, go to Tools → Add tool → **Client** tool. Turn on **Wait for response**.

| Name | Description | Parameters |
|---|---|---|
| `get_current_question` | Returns the step to deliver now, with the stage, question id, and the questions still open in this stage. Call at the start and whenever unsure. | none |
| `record_answer` | Saves an answer and returns the next step. Without `question_id` it answers the current question. With the id of a still-open question in the same stage or workflow, it saves that answer for later, so it won't be asked again. | `answer` (string, required): their words, verbatim. `question_id` (string, optional): e.g. `A4`, `T2`, `D6`, `D9` |
| `skip_question` | Marks the current question "to fill" and returns the next step. | none |
| `choose_path` | At the milestone: `keep_going` (into the journey) or `wrap_up` (finish here). After a workflow: `another` (with `name` if they gave one) or `next_stage`. | `path` (string, required). `name` (string, optional): the next workflow name |

## 3. Widget settings

- Security → allowlist: add `roadmaplabs.com.au` and your Vercel preview domain.
- The page sets `transcript="false"` and `text-input="false"` on the widget, because the conversation thread on the page *is* the transcript. It also sets the orb colours to the brand blues.

## 4. Connect it to the site

Set `PUBLIC_ELEVENLABS_AGENT_ID` in Vercel to the agent id and redeploy (the page is static, so the id is read at build time). Until then, Voice interview mode shows a "coming online" state, and the chat, including the speak-to-type mic, does everything.
