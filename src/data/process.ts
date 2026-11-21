/**
 * Process page copy. Edit this file to change /process.
 */

export const PROCESS_PAGE = {
  title: 'Our AI Consulting Process, Step by Step | Roadmap Labs',
  description:
    'How our AI automation agency works with Australian businesses: a free 1-hour strategy session, then a scoped build and training for your team.',
  eyebrow: 'How we work',
  h1: 'Get clear on the work before anything gets built',
  lead: "We start with where you want the business to be and how the work runs today. Then we work out where AI fits, and only build what's worth building.",
  cta: 'Book your free session',
  microcopy: 'Free · 1 hour · Online',
};

export const PROCESS_STEPS_HEADING = 'From the first conversation to a team that runs it';

export type ProcessStep = {
  numeral: string;
  label: string;
  title: string;
  paragraphs: string[];
};

export const PROCESS_STEPS: ProcessStep[] = [
  {
    numeral: '01',
    label: 'Step 1 · Free · 1 hour',
    title: 'Strategy session and custom report',
    paragraphs: [
      "An hour with Dan on your bottlenecks and your goals. Bring the repeated admin or the process that keeps holding work up. You don't need to share sensitive records for this.",
      "Within 48 hours you get a custom report: your business mapped, the automations that suit you, and what each one saves over 12 months. Every figure shows its working, so you can check it. The report is yours, whether you build with us or not.",
    ],
  },
  {
    numeral: '02',
    label: 'Step 2',
    title: 'Scope and build',
    paragraphs: [
      "If you want us to build, we agree the scope and price before any work starts. That includes how we'll test whether it does the job. A typical engagement ranges from $5,000 to $50,000.",
      "We get the data ready and set who can access it before AI touches business information. Then we build against the real workflow and show you the system as it comes together. The people who'll use it test it on their own work.",
    ],
  },
  {
    numeral: '03',
    label: 'Step 3',
    title: 'Handover and training',
    paragraphs: [
      "We document the system and train your team on the tasks they'll do with it. That includes how to check what it produces. Accounts stay in your name, and the scope sets out who looks after maintenance.",
    ],
  },
  {
    numeral: '04',
    label: 'Step 4 · Optional',
    title: 'Ongoing support, if you want it',
    paragraphs: [
      "Once it's built, you can keep us on an optional retainer to keep it running and find new opportunities, or manage it yourself. There's no lock-in.",
    ],
  },
];

export const PROCESS_NUMBERS = {
  heading: 'How we put a number on an automation',
  paragraphs: [
    'Most savings figures come from one line of maths: how long a task takes, times how often you do it, times what your people cost. On its own, that number is probably too big.',
    "So every figure in your report shows the working. We take off the time your team still spends checking the output, plus the build and the running costs. Until reporting is in place, you can't be 100% sure about an automation. A lot of our job is setting that reporting up first, so over 12 months you can see clearly what each automation is doing.",
  ],
  link: { label: 'Why the simple sum is usually too big', href: '/blog/ai-automation-agency-savings' },
};

export const PROCESS_TOGETHER = {
  heading: "What we'll need from you",
  items: [
    {
      title: 'Someone who knows the work',
      body: 'We need a person who understands the process and can make decisions. The people using the system should help test it. We agree the time during scoping, so nobody gets surprised halfway through.',
    },
    {
      title: "Your team's say on what AI takes on",
      body: "Your team decides what to hand over and what to keep. We'll ask which parts of the job they'd happily drop, and which parts they'd do better with more time.",
    },
    {
      title: 'Clear boundaries',
      body: "Before the build, we agree what's in scope and which actions need a person's approval. As of today, AI can't do every task perfectly, so we plan for where it'll need a hand.",
    },
  ],
  link: { label: 'Read the project FAQs', href: '/faq' },
};
