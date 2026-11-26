// The opening walkthrough on /intake, as content. The page renders whatever this returns; nothing here is a question.
//
// Driven by audience so a second path can be added later. Today only the business owner / leader version exists,
// and it is the default for everyone. To add the general employee path:
//   1. write an `employee: IntroBeat[]` entry in INTRO below (same shape, same demo keys or new ones)
//   2. decide how the page learns the audience before the walkthrough (for now: ?intro=employee in the URL)
// introFor() falls back to the owner version for any audience that has no content yet.
//
// Writing rules: plain Australian English, short sentences, no em dashes, no jargon the reader would need explained.
// Each screen says what this is, why it matters to them, and what they get.

import { DATA_PROMISE_POINTS } from './intake';

export type IntroAudience = 'owner' | 'employee';
export const DEFAULT_AUDIENCE: IntroAudience = 'owner';

/** Example boxes the page knows how to draw. They are illustrations, never the client's own files. */
export type IntroDemo = 'answer' | 'folder' | 'tools';

export interface IntroBlock {
  /** Short label above the block, e.g. "What we add". */
  label: string;
  text: string;
  /** 'note' = neutral card, 'get' = the "what you get" highlight. */
  tone?: 'note' | 'get';
}

export interface IntroStep {
  title: string;
  text: string;
  /** Why it matters, shown quieter, without brackets. */
  why?: string;
}

export interface IntroBeat {
  /** Stable id: used for screenshots, analytics and replacing one screen without renumbering. */
  id: string;
  eyebrow: string;
  title: string;
  body: string[];
  blocks?: IntroBlock[];
  steps?: IntroStep[];
  demo?: IntroDemo;
  /** Caption under the example box. */
  caption?: string;
  /** Closing line at the end of the screen. */
  footer?: string;
  /** Short ticked lines, for the screen about their answers. */
  points?: readonly string[];
  /** A small link under the screen, opened in a new tab so the walkthrough isn't lost. */
  link?: { href: string; label: string };
}

const OWNER: IntroBeat[] = [
  {
    id: 'why',
    eyebrow: "Why we're doing this",
    title: 'AI only works as well as what it knows about your business.',
    body: [
      'Right now, AI knows nothing about how your business really runs. So it guesses.',
      'This conversation fixes that. Harry will ask about your business, how you work, and the jobs that eat your time. Your answers become the notes an AI agent reads before it does anything for you.',
    ],
    blocks: [
      {
        label: 'One thing to know first',
        text: 'AI speeds up whatever it is given. Good processes get faster. Messy or wasteful ones just get messy and wasteful faster. That is why we start with how you actually work, before we touch any tools.',
      },
      { label: 'What you get', text: "A clear picture of where AI will save you real time, and where it won't.", tone: 'get' },
    ],
    demo: 'answer',
    caption: 'One answer from you becomes one line an agent can follow.',
  },
  {
    id: 'how',
    eyebrow: 'How it works',
    title: 'AI agents run on files and folders. That is all.',
    body: [
      'Computers have always stored things in files and folders. AI agents work the same way. Tools like Claude and the new agent apps all do one thing: open the files and read them.',
      'So the quality of those files decides the quality of the AI’s work.',
    ],
    blocks: [
      {
        label: "What you don't have to do",
        text: "You don't have to design any folders or work out a structure. That's our job. You just talk. Show us the business, walk through the jobs you want off your plate, and tell us what you'd love to do if you had the time.",
      },
      {
        label: 'What we add',
        text: 'On top of your own processes, we bring proven SEO, marketing, sales, branding and copywriting methods, with ideas and fixes, so the AI helps you grow and not only tidy up.',
        tone: 'get',
      },
    ],
    demo: 'folder',
    caption: "This is the kind of folder we'll build for you from this conversation.",
  },
  {
    id: 'cover',
    eyebrow: "What we'll cover",
    title: 'Four things, in plain order.',
    body: [],
    steps: [
      {
        title: 'Your business.',
        text: "A quick overview: what you do, who for, how long you've been going, and the tools you use.",
        why: 'So nothing has to be explained to the AI twice.',
      },
      {
        title: 'AI and your tools today.',
        text: 'What you already use, what has worked, and where you got stuck.',
        why: "So we build on what works and skip what doesn't.",
      },
      {
        title: 'How the work flows.',
        text: "We usually go through how you win customers, deliver the work, and run the business, one flow at a time. If your business works differently, tell Harry and we'll follow your shape, not ours.",
        why: 'This is where the biggest time savings are found.',
      },
      {
        title: 'Your goals.',
        text: 'What you want from AI and from the business.',
        why: 'So every agent using your folders is guided by your mission and purpose, every time your team uses it.',
      },
    ],
    footer: 'The more you show, the better the result. There are no wrong answers.',
  },
  {
    id: 'specific',
    eyebrow: 'One tip',
    title: 'The more specific, the better.',
    body: [
      'A screenshot of how you quote a job beats a paragraph describing it.',
      'Go as deep as you like. You can record your screen as you click through a job, which is the quickest way to show us how work really gets done.',
    ],
    demo: 'tools',
    footer: "Real examples make your files more relevant. Skip anything you don't have.",
  },
  {
    id: 'answers',
    eyebrow: 'Before we start',
    title: 'What happens to your answers',
    body: [],
    points: DATA_PROMISE_POINTS,
    link: { href: '/privacy', label: 'Privacy policy' },
  },
];

/** Only audiences with real content. Add `employee` here when its screens are written. */
export const INTRO: Partial<Record<IntroAudience, IntroBeat[]>> = { owner: OWNER };

/** The walkthrough for an audience, falling back to the owner version. */
export function introFor(audience?: string | null): { audience: IntroAudience; beats: IntroBeat[] } {
  const a = (audience ?? '') as IntroAudience;
  const beats = INTRO[a];
  return beats ? { audience: a, beats } : { audience: DEFAULT_AUDIENCE, beats: INTRO[DEFAULT_AUDIENCE]! };
}
