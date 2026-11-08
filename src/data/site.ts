import compassLaptop from '../assets/images/compass-buyers-agency-laptop.jpg';
import compassPhone from '../assets/images/compass-buyers-agency-phone.jpg';
import reviewbuddyLaptop from '../assets/images/reviewbuddy-laptop.jpg';
import reviewbuddyPhone from '../assets/images/reviewbuddy-phone.jpg';
import flexfolioLaptop from '../assets/images/flexfolio-laptop.jpg';
import flexfolioPhone from '../assets/images/flexfolio-phone.jpg';

export const SITE = {
  url: 'https://roadmaplabs.com.au',
  name: 'Roadmap Labs',
  email: 'dan@roadmaplabs.com.au',
  abn: '44 108 955 374',
  // Add the LinkedIn company URL here once it exists; it feeds the footer and JSON-LD sameAs.
  linkedin: '',
  // Case study datePublished. Set to the go-live date.
  launchDate: '2026-11-08',
};

export const abs = (path: string) => (path === '/' ? `${SITE.url}/` : `${SITE.url}${path}`);

export type CaseKey = 'compass' | 'reviewbuddy' | 'flexfolio';

export const CASES = {
  compass: {
    key: 'compass',
    href: '/work/compass-buyers-agency',
    name: 'Compass Buyers Agency',
    short: 'Compass',
    summary: 'We built the Compass Buyers Agency website.',
    tag: 'A website we built for Compass Buyers Agency',
    gradient: 'linear-gradient(160deg, #3a6b68 0%, #173a39 100%)',
    laptop: compassLaptop,
    phone: compassPhone,
    laptopAlt: 'The Compass Buyers Agency website on a laptop',
    phoneAlt: 'The Compass Buyers Agency website on a phone',
    site: 'https://compassagency.com.au',
    siteLabel: 'compassagency.com.au',
    og: '/og/compass-buyers-agency.png',
  },
  reviewbuddy: {
    key: 'reviewbuddy',
    href: '/work/reviewbuddy',
    name: 'ReviewBuddy',
    short: 'ReviewBuddy',
    summary: 'A reviews platform in beta, and growing on the same kind of automations we build for clients.',
    tag: 'Our product',
    gradient: 'linear-gradient(160deg, #4cc2ff 0%, #1f9be6 100%)',
    laptop: reviewbuddyLaptop,
    phone: reviewbuddyPhone,
    laptopAlt: 'ReviewBuddy on a laptop',
    phoneAlt: 'ReviewBuddy on a phone',
    site: 'https://www.reviewbuddy.com.au',
    siteLabel: 'reviewbuddy.com.au',
    og: '/og/reviewbuddy.png',
  },
  flexfolio: {
    key: 'flexfolio',
    href: '/work/flexfolio',
    name: 'Flexfolio',
    short: 'Flexfolio',
    summary: 'Flexfolio is our portfolio product for product managers, built to show the thinking behind their work.',
    tag: 'Our product',
    gradient: 'linear-gradient(160deg, #2a2a2a 0%, #0b0b0b 100%)',
    laptop: flexfolioLaptop,
    phone: flexfolioPhone,
    laptopAlt: 'Flexfolio on a laptop',
    phoneAlt: 'Flexfolio on a phone',
    site: 'https://www.flexfolio.co',
    siteLabel: 'flexfolio.co',
    og: '/og/flexfolio.png',
  },
} as const;

export type Faq = { q: string; a: string };

export const HOME_FAQ: Faq[] = [
  {
    q: 'Which AI provider and tools should we use?',
    a: "We generally recommend Claude from Anthropic, with the right CRM and tooling around it. In the session we'll talk through what suits your business and the tools you already have.",
  },
  {
    q: 'Do we need to replace our existing systems?',
    a: "No. We start with the systems that got you here and make them work harder. We'll only suggest something new once we've got real value out of what you have today.",
  },
  {
    q: 'Will my team actually use it?',
    a: "That's a big part of the job. We set it up with the right skills for your team and train them on it, so the whole team uses it the same way.",
  },
  {
    q: 'Is it secure?',
    a: "We start with the information involved and who needs access. We agree which tools can use it and where a person needs to approve an action. Your security requirements belong in the project scope. An enterprise AI account alone doesn't settle every security question.",
  },
  {
    q: 'What will it cost to run each month?',
    a: 'Your business pays its own AI subscriptions and token fees, separate from our project fee. Costs depend on the tools and how they\'re used. We check expected running costs before you commit.',
  },
  {
    q: 'How much does a project cost?',
    a: "A typical engagement ranges from A$5k to A$50k, with no GST. The price depends on what we're building and the systems it needs to work with. We agree the scope and project price before work starts.",
  },
  {
    q: 'Are we locked in?',
    a: "No. Once it's built there's an optional retainer to keep it all running and find new opportunities, or you can manage it yourself.",
  },
];

export const CONTACT_FAQ: Faq[] = [
  {
    q: 'Is the session really free?',
    a: "Yes. The 1-hour discovery session is free, and the AI blueprint and strategy are yours to keep. There's no obligation to hire us.",
  },
  {
    q: 'Can we use the blueprint and strategy ourselves?',
    a: "Yes, and we'd welcome it. Build it with your team or take it to another provider. There's no obligation to hire us.",
  },
  {
    q: 'Do we need to share sensitive records?',
    a: 'No. The session is about your goals and how the work happens. If a project goes ahead, we agree what access it needs before you share business data.',
  },
  {
    q: 'What does a project cost if we go ahead?',
    a: "A typical engagement ranges from A$5k to A$50k, with no GST. We agree the scope and project price before work starts.",
  },
];

export const ABOUT_FAQ: Faq[] = [
  {
    q: 'Do you work outside Melbourne?',
    a: 'Yes. We work with established businesses across Australia. We can run the project remotely and talk through any on-site work you need.',
  },
  {
    q: 'Will you train our staff?',
    a: 'Yes. We work through the tasks your team needs to do, using the tools being introduced, so people can use the system and check what it produces.',
  },
  {
    q: 'How much time will our team need to give?',
    a: 'We need someone who knows the work and can make decisions, and the people using the system should help test it. We agree the time during scoping, so nobody gets surprised halfway through.',
  },
];

export const HEADER_LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/articles', label: 'Articles' },
  { href: '/about', label: 'About' },
] as const;

export const FOOTER_COMPANY = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/articles', label: 'Articles' },
  { href: '/about', label: 'About Dan' },
  { href: '/process', label: 'Process' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
] as const;

export type ServiceItem = { title: string; body: string };
export type ServiceGroup = { label: string; items: ServiceItem[] };

/** Writer v4, word for word. Group labels are the published labels, not headings. */
export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    label: 'Foundations',
    items: [
      {
        title: 'Implement AI securely',
        body: 'Decide what information an AI tool can access and who can use it. Set clear approval points for actions that need a person\'s judgement. Security requirements belong in the project scope from the start.',
      },
      {
        title: 'Make old data useful',
        body: 'Years of files aren\'t much help if nobody can find the right version. We organise existing records and check what can be trusted, including removing duplicates. Access is part of the work, so useful information reaches the right people.',
      },
      {
        title: 'Simplify your software setup',
        body: 'We look for overlapping subscriptions and work that gets copied between tools. Keep what earns its place. Connect or replace a tool only when there\'s a clear reason.',
      },
    ],
  },
  {
    label: 'Builds',
    items: [
      {
        title: 'Automate repeated work',
        body: 'Connect the steps your team repeats, with checks where mistakes would matter. A workflow might prepare a quote follow-up for someone to review. We agree the task and how to test it before building.',
      },
      {
        title: 'Build custom tools and internal operating systems',
        body: 'When existing software can\'t handle the work, we build around the people doing it. That could mean an internal dashboard or a shared place to manage jobs. The scope sets out what the tool needs to do and who will use it.',
      },
      {
        title: 'Build a website that supports the business',
        body: 'Help customers understand what you do and take the next step. We build websites around that job, including how enquiries reach your team. AI only belongs in the website if it helps.',
      },
    ],
  },
  {
    label: 'People',
    items: [
      {
        title: 'Teach your team to use AI well',
        body: 'Work through tasks your staff actually do. Show people how to check an answer and when to stop for human judgement. Teaching can be its own project and is part of handing over a new system.',
      },
    ],
  },
];

export type ProcessStep = { title: string; paragraphs: string[] };

export const PROCESS_STEPS: ProcessStep[] = [
  {
    title: 'Discovery and blueprint',
    paragraphs: [
      'We spend a free hour looking at your goals and how the business works today. Start with the repeated admin or a process that holds work up. You don\'t need to share sensitive records for this conversation.',
      'You\'ll leave with a clear AI blueprint and strategy, including priorities and a sensible place to start. You can run the plan yourself or decide to get help.',
    ],
  },
  {
    title: 'Scope and build',
    paragraphs: [
      'If you\'d like us to build, we agree the deliverables and project price first. We also agree how we\'ll test whether the system does its job.',
      'Data preparation and access permissions come before connecting AI to business information. We build around the agreed workflow and show you the system as it develops. Your team helps test it against the work people actually do.',
    ],
  },
  {
    title: 'Handover and training',
    paragraphs: [
      'We document the system and work through the tasks your team needs to perform. People learn how to check outputs and what to do when something goes wrong.',
      'Your accounts stay in your business\'s name. The scope sets out what you receive at handover and who\'s responsible for maintenance.',
    ],
  },
  {
    title: 'Optional support',
    paragraphs: [
      'You can manage the system yourself or discuss ongoing support. Any support arrangement is scoped separately, so you can see what it covers before deciding.',
    ],
  },
];

export const PROCESS_EXPECTATIONS: Faq[] = [
  {
    q: 'Bring the people who know the work',
    a: 'We\'ll need someone who understands the process and can make decisions. The people using the system should help test it. We agree the time needed during scoping.',
  },
  {
    q: 'Keep assumptions visible',
    a: 'Expected savings depend on the work and how often it happens. We label estimates and agree useful measures. An estimate isn\'t a guaranteed result.',
  },
  {
    q: 'Agree the boundaries',
    a: 'We make clear what the build includes, what needs human approval and what stays outside the scope. Provider terms and running costs need checking before you commit to a setup.',
  },
  {
    q: 'See the work as it develops',
    a: 'We show you the working system during the build. Use that time to check whether it fits the way your team works.',
  },
];

export const ARTICLE_TOPICS = [
  'Using AI safely',
  'Data and business knowledge',
  'Systems and tooling',
  'Automations and builds',
  'Helping your team',
] as const;

export type FaqGroup = { heading: string; items: Faq[] };

export const FAQ_PAGE: FaqGroup[] = [
  {
    heading: 'Price, timing and fit',
    items: [
      {
        q: 'How much does an engagement cost?',
        a: 'A typical engagement ranges from A$5k to A$50k, with no GST. The price depends on what we\'re building and the systems it needs to work with. We agree the scope and project price before work starts.',
      },
      {
        q: 'What changes the price?',
        a: 'Preparing messy data and connecting older systems affect the work involved. Custom features add work too. The proposal sets out what\'s included and the assumptions behind the price.',
      },
      {
        q: 'How long does a project take?',
        a: 'It depends on the scope and the condition of your existing systems. We work through the timing during scoping, including what we need from your team. We don\'t promise a launch date before understanding the work.',
      },
      {
        q: 'What does the free 1-hour session include?',
        a: 'We talk through what you want to achieve and how your business runs today. You\'ll leave with a clear AI blueprint and strategy, with priorities and a sensible place to start. The session is free, with no obligation to hire us.',
      },
      {
        q: 'Can we take the blueprint and do it ourselves?',
        a: 'Yes. You can run it with your own team or take it to another provider. It\'s yours to use.',
      },
      {
        q: 'Do you work outside Melbourne?',
        a: 'Yes. We work with established businesses across Australia. We can discuss how a project would work for your team during discovery.',
      },
      {
        q: 'Can you guarantee a financial result?',
        a: 'No. We can agree what the system needs to do and how to test it. Business results depend on how it\'s used and what happens around it. We make estimates clear and agree what to measure.',
      },
    ],
  },
  {
    heading: 'Security, data and ownership',
    items: [
      {
        q: 'How do you handle security and business data?',
        a: 'We start with the information involved and who needs access. We agree which tools can use it and where a person needs to approve an action. The project scope needs to reflect your security requirements. Using an enterprise AI account alone doesn\'t settle every security question.',
      },
      {
        q: 'Will our information be used to train AI models?',
        a: 'That depends on the provider, product and account settings. We check the applicable terms before recommending how business data should be used. There\'s no blanket answer for every AI service.',
      },
      {
        q: 'Does our data stay in Australia?',
        a: 'We don\'t assume it does. Hosting and processing locations depend on the tools. If Australian data residency is a requirement, we check it before recommending a setup.',
      },
      {
        q: 'Who owns the accounts and pays the AI fees?',
        a: 'Your business owns its accounts and pays its own AI and token fees, separate from our project fee. We choose tools to suit the work and check expected running costs before you commit.',
      },
      {
        q: 'Who owns the custom system?',
        a: 'Your business keeps control of its accounts and data. The proposal needs to spell out what custom work and access you receive at handover. Third-party products have their own licences.',
      },
      {
        q: 'Can AI make a mistake or take the wrong action?',
        a: 'Yes. We agree which outputs need checking and which actions need a person\'s approval. Testing and failure handling belong in the build scope. AI shouldn\'t have unchecked control of a task simply because it can perform it.',
      },
      {
        q: 'Can we start without sharing sensitive records?',
        a: 'Yes. The first conversation is about your goals and how the work happens. If a project goes ahead, we agree what access it needs before you share business data.',
      },
    ],
  },
  {
    heading: 'Existing tools, people and support',
    items: [
      {
        q: 'Do we need to replace our existing systems?',
        a: 'Not automatically. We look at what already works and where the problems sit. Connecting tools or organising data may be the right first job. We recommend replacement when there\'s a clear reason.',
      },
      {
        q: 'Our data is old and unorganised. Can you help?',
        a: 'Yes. Making existing data useful is part of the work we offer. We start with a manageable set of records and check what can be trusted. Then we decide who needs access and what AI can usefully do with it.',
      },
      {
        q: 'Will you train our staff?',
        a: 'Yes. We teach using the tasks your team needs to do, including checking outputs. The proposal sets out the training and documentation included. The goal is to take repetitive admin off your team\'s plate.',
      },
      {
        q: 'How much time will our team need to give you?',
        a: 'We need someone who knows the work and can make decisions. People using the system should help test it too. We agree the time needed during scoping.',
      },
      {
        q: 'What happens if our old system can\'t connect?',
        a: 'We check the connection options before promising an integration. If there are limits, we explain the alternatives. Sometimes a manual checkpoint is the sensible choice, or the proposed build isn\'t worth doing.',
      },
      {
        q: 'Are we locked into ongoing support?',
        a: 'Ongoing support is optional and scoped separately. You can manage the system yourself. Third-party subscriptions may have their own commitments, which need checking before you sign up.',
      },
      {
        q: 'What happens after launch?',
        a: 'Your team receives the documentation and training agreed in the project scope. Maintenance responsibilities need to be clear, including who to contact if something stops working. Any ongoing support arrangement sets out its own coverage and terms.',
      },
      {
        q: 'Can you help with a website as well as internal systems?',
        a: 'Yes. We build websites and custom internal tools as well as AI automations. We scope the work around the business problem. A website doesn\'t need AI unless it serves a useful purpose.',
      },
    ],
  },
];

export const FAQ_PAGE_ITEMS: Faq[] = FAQ_PAGE.flatMap((group) => group.items);

export const faqSchema = (faqs: Faq[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});
