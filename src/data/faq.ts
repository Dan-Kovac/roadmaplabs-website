/**
 * FAQ copy for /faq and the short list on /services.
 * Questions and answers are the Roadmap Labs Writer's text.
 * Edit this file to change them. Slug ids are derived from the question.
 */

export type FaqItem = { id: string; q: string; a: string };

export type FaqGroup = { id: string; heading: string; items: FaqItem[] };

/** Stable id from the question text. Apostrophes are removed so "What's" stays "whats". */
export function faqSlug(question: string) {
  return question
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function item(q: string, a: string): FaqItem {
  return { id: faqSlug(q), q, a };
}

export const FAQ_PAGE = {
  title: 'AI Consulting FAQs: Cost and Your Data | Roadmap Labs',
  description:
    'What AI consulting costs in Australia and how we handle your data. A typical engagement ranges from $5,000 to $50,000.',
  eyebrow: 'FAQ',
  h1: 'Questions we get before a project starts',
  lead: "Straight answers on what a project costs and how we handle your data. If your question isn't here, bring it to the free session.",
  cta: 'Book your free session',
};

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'price',
    heading: 'Price, timing and fit',
    items: [
      item(
        'How much does a project cost?',
        "A typical engagement ranges from $5,000 to $50,000. The price depends on what we're building and the systems it needs to work with. We agree the scope and price before work starts.",
      ),
      item(
        'What changes the price?',
        "Messy data and older systems add work, and so do custom features. The proposal sets out what's included and the assumptions behind the price.",
      ),
      item(
        'How long does a project take?',
        "It depends on the scope and what we find in your existing systems. We set out the timeline during scoping, including what we need from your team. We won't give you a launch date before we understand the work.",
      ),
      item(
        'Is the strategy session really free?',
        'Yes. The hour and the custom report cost nothing. You only pay if you choose to have us build something.',
      ),
      item(
        "What's in the custom report?",
        "Your business mapped, the automations that suit you, and what each one saves over 12 months, with the working shown. It's ready within 48 hours of the session.",
      ),
      item(
        'Can we take the report and do it ourselves?',
        "Yes, and we'd welcome it. Build it with your team or take it to another provider. There's no obligation to hire us.",
      ),
      item(
        'Do you work outside Melbourne?',
        'Yes. We work with established businesses across Australia. We can run the project remotely and talk through any on-site work you need.',
      ),
      item(
        'Can you guarantee a saving?',
        'No. A figure promised before anyone has seen your numbers is a guess. We show the working behind each estimate. Then we set up reporting, so over 12 months you can see what an automation is really doing.',
      ),
    ],
  },
  {
    id: 'security',
    heading: 'Security, data and ownership',
    items: [
      item(
        'Which AI provider and tools should we use?',
        "We generally recommend Claude from Anthropic, with the right CRM and tooling around it. In the session we'll talk through what suits your business and the tools you already have.",
      ),
      item(
        'Is it secure?',
        "We start by looking at your current tech stack and where the vulnerabilities are. We agree what information each tool can use and where a person signs off. If we see a risk along the way, we'll flag it. You decide whether to fix it with your IT provider, or we can help with that too.",
      ),
      item(
        'Will our information be used to train AI models?',
        "That depends on the provider, the product and your account settings. We check the terms before any business data goes into a tool. There's no single answer for every AI service.",
      ),
      item(
        'Does our data stay in Australia?',
        "We don't assume it does. Where data is hosted and processed depends on the tools. If it has to stay in Australia, we check that before recommending a setup.",
      ),
      item(
        'What will it cost to run each month?',
        "There are two costs: subscriptions and tokens. Subscriptions depend on the tools and how many people use them. Token costs depend on the automations you build. Our job is to build automations that get the right outcome for your customers and your team at the lowest running cost. We've got no interest in you using more tokens. We want you to use fewer.",
      ),
      item(
        'Who owns the accounts?',
        'Your business does. Everything is set up in your name. You pay your subscriptions and token costs directly, separate from our project fee.',
      ),
      item(
        'Who owns what you build?',
        'Your accounts and your data stay under your control. The proposal spells out what custom work and access you receive at handover. Third-party products keep their own licences.',
      ),
      item(
        'Can AI make a mistake?',
        "Yes. AI can't do everything perfectly right now. We agree which outputs need checking and which actions need a person's approval. Then we test against the real tasks before handover. AI shouldn't get unchecked control of a job just because it can do it.",
      ),
      item(
        'Do we need to share sensitive records?',
        'No. The session is about your goals and how the work happens. If a project goes ahead, we can use redacted or sample information while we work out what access it actually needs.',
      ),
    ],
  },
  {
    id: 'team',
    heading: 'Your team, your systems and support',
    items: [
      item(
        'Do we need to replace our existing systems?',
        "No. We start with the systems that got you here and make them work harder. We'll only suggest something new once we've got real value out of what you have today.",
      ),
      item(
        'Our data is old and unorganised. Can you help?',
        'Yes. Making old data useful is part of the work we do. We start with a manageable set of records and work out what can be trusted. Then we decide who needs access and what AI can usefully do with it.',
      ),
      item(
        'Is this about cutting staff?',
        "No. We point AI at repetitive admin, and your team decides what to hand over and what to keep. Their time goes to the work that's your competitive advantage. That's things like customer relationships and the know-how an AI model doesn't have.",
      ),
      item(
        'Will you train our staff?',
        'Yes. We work through the tasks your team needs to do, using the tools being introduced, so people can use the system and check what it produces.',
      ),
      item(
        'Will my team actually use it?',
        "That's a big part of the job. We set it up with the right skills for your team and train them on it, so everyone uses it the same way.",
      ),
      item(
        'How much time will our team need to give?',
        'We need someone who knows the work and can make decisions, and the people using the system should help test it. We agree the time during scoping, so nobody gets surprised halfway through.',
      ),
      item(
        "What if our old system can't connect?",
        "We check the connection options before promising anything. If there are limits, we explain the alternatives. Sometimes a manual check is the sensible choice, and sometimes the build isn't worth doing.",
      ),
      item(
        'Are we locked in?',
        "No. Once it's built there's an optional retainer to keep it all running and find new opportunities, or you can manage it yourself.",
      ),
      item(
        'What happens after launch?',
        'Your team gets the documentation and training agreed in the scope. We make clear who handles maintenance and who to call if something stops working.',
      ),
      item(
        'Can you help with a website as well as internal systems?',
        "Yes. We build websites and custom internal tools as well as AI automations. We work out what the business needs first, then scope the right project. A website doesn't need AI unless it helps.",
      ),
    ],
  },
];

export const FAQ_ITEMS: FaqItem[] = FAQ_GROUPS.flatMap((group) => group.items);

/** First price question stays open until a reader opens another, or a deep link opens its own. */
export const FAQ_OPEN_ID = faqSlug('How much does a project cost?');

const byQuestion = new Map(FAQ_ITEMS.map((entry) => [entry.q, entry]));

/** Same objects as /faq, so the services page cannot drift from these answers. */
export function faqByQuestions(questions: string[]): FaqItem[] {
  return questions.map((question) => {
    const found = byQuestion.get(question);
    if (!found) throw new Error(`FAQ question not found: ${question}`);
    return found;
  });
}
