/**
 * Services page copy. Edit this file to change /services.
 * The three FAQs are the same records as /faq.
 */
import { faqByQuestions } from './faq';

export const SERVICES_PAGE = {
  title: 'AI Consulting Services Australia | Roadmap Labs',
  description:
    'AI consulting for established Australian businesses. Automations and custom tools built on the systems you already run on. Book a free 1-hour session.',
  eyebrow: 'Services',
  h1: 'AI work built on the systems you already run on',
  lead: "We help established Australian businesses put AI to work on the jobs that eat up their team's week. Everything we build connects to the tools and processes that got you here.",
  cta: 'Book your free session',
  microcopy: 'Free 1-hour AI strategy session. Melbourne-based, working across Australia.',
};

/**
 * Compass case-study link under Websites.
 * Off until Dan approves naming Compass on this page.
 * Set to true to render the project label and the case-study link.
 */
export const SHOW_COMPASS_PROJECT_LINK = false;

export type ServiceItem = {
  title: string;
  body: string;
  project?: { label: string; linkLabel: string; href: string };
};

export type ServiceGroup = {
  index: string;
  label: string;
  items: ServiceItem[];
};

export const SERVICE_INTRO = {
  heading: 'Seven kinds of work, grouped by where you start',
  body: "Most businesses don't start with a blank page. They start with years of data and a team that knows how the work really runs. So we start there too.",
};

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    index: '01',
    label: 'Foundations',
    items: [
      {
        title: 'Implement AI securely',
        body: 'We agree what information each AI tool can see. We also agree where a person has to approve an action before it happens. Security goes into the project scope from day one.',
      },
      {
        title: 'Make old data useful',
        body: 'Years of files don\'t help if nobody can find the right version. We pull the records into one place and work out which ones can be trusted. Then AI has something clean to search, and the right people can find what they need.',
      },
      {
        title: 'Simplify your software',
        body: "We look at the software you pay for and how the team actually uses it. Then we show you where your tooling money goes. Keep what earns its place. We'll only connect or replace a tool when there's a clear reason.",
      },
    ],
  },
  {
    index: '02',
    label: 'Builds',
    items: [
      {
        title: 'Automate the repeated work',
        body: "We connect the steps your team does over and over, like following up quotes or building proposals. There's a check wherever a mistake would cost you. Before we build, we agree what the automation has to do and how we'll test it.",
      },
      {
        title: 'Build custom tools and internal operating systems',
        body: "When off-the-shelf software can't handle how you work, we build the tool around the people using it. That might be a dashboard for the jobs in progress, or one place to run the business from. The scope spells out what it does and who uses it.",
      },
      {
        title: 'Build a website that does its job',
        body: 'A website should help a customer understand what you do and get in touch. We build it around that, including where an enquiry goes once it arrives. AI only goes on the website if it helps.',
        project: {
          label: 'A website we built for Compass Buyers Agency',
          linkLabel: 'Read the case study',
          href: '/work/compass-buyers-agency',
        },
      },
    ],
  },
  {
    index: '03',
    label: 'People',
    items: [
      {
        title: 'Teach your team to use AI well',
        body: "We train people on the tasks they actually do, in the tools they'll be using. The team decides what to hand over to AI and what to keep. That frees their time for the work that's your competitive advantage. Teaching can be a project on its own, and it's part of every handover.",
      },
    ],
  },
];

export const SERVICE_PRODUCTS = {
  heading: 'We build and run our own products too',
  body: "ReviewBuddy is our reviews platform for Australian tradies, and it's in beta. Flexfolio is our portfolio product for product managers. Running our own products means we live with every build decision after launch.",
  support:
    "Dan spent 10 years running a digital marketing agency. He's also a product manager at one of Australia's largest wagering providers. There he sees enterprise AI rolled out at scale.",
  links: [
    { label: 'See ReviewBuddy', href: '/work/reviewbuddy' },
    { label: 'See Flexfolio', href: '/work/flexfolio' },
  ],
};

export const SERVICE_ACCOUNTS = {
  heading: 'Your accounts stay in your name',
  paragraphs: [
    "Everything we set up sits in your business's name. You pay your own subscriptions and token costs, separate from our project fee. We check the running costs with you before you commit.",
    "We've got no interest in you using more tokens. We want you to use fewer.",
  ],
  link: { label: 'See how a project works', href: '/process' },
};

export const SERVICE_FAQ_HEADING = 'Before you pick a service';

export const SERVICE_FAQ = faqByQuestions([
  'Which AI provider and tools should we use?',
  'Do we need to replace our existing systems?',
  'Can you help with a website as well as internal systems?',
]);
