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
    summary:
      'A data-driven website that reports on every suburb they buy in, and a bespoke web app that runs the business behind it.',
    tag: 'Client work',
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
    summary: 'ReviewBuddy is our reviews platform for Australian tradies.',
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
    a: "We start by looking at your current tech stack and where the vulnerabilities are. As we move it to a more AI-native setup that can run automations, we'll flag any risk we see along the way. You decide whether to fix it with your IT provider, or we can help with that too. Generally the risks are low, especially with early automations and when we're using trusted providers like Anthropic's Claude in an enterprise environment.",
  },
  {
    q: 'What will it cost to run each month?',
    a: "There are two costs: subscriptions and tokens. A team account usually runs at around $100 a month per employee, and token costs depend on the automations you build. Our job is to build automations that get the right outcome for your customers and your team at the lowest running cost. We've got no interest in you using more tokens. We want you to use fewer.",
  },
  {
    q: 'How much does a project cost?',
    a: "A typical engagement ranges from $5,000 to $50,000. The price depends on what we're building and the systems it needs to work with. We agree the scope and price before work starts.",
  },
  {
    q: 'Are we locked in?',
    a: "No. Once it's built there's an optional retainer to keep it all running and find new opportunities, or you can manage it yourself.",
  },
];

export const CONTACT_FAQ: Faq[] = [
  {
    q: 'Is the session really free?',
    a: 'Yes. The hour and the custom report cost nothing. You only pay if you choose to have us build something.',
  },
  {
    q: 'Can we take the report and do it ourselves?',
    a: "Yes, and we'd welcome it. Build it with your team or take it to another provider. There's no obligation to hire us.",
  },
  {
    q: 'Do we need to share sensitive records?',
    a: 'No. The session is about your goals and how the work happens. If a project goes ahead, we can use redacted or sample information while we work out what access it actually needs.',
  },
  {
    q: 'What does a project cost if we go ahead?',
    a: "A typical engagement ranges from $5,000 to $50,000, depending on what we're building. Every automation in the report comes with its 12-month value, and we agree the scope and price before anything starts.",
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

export const faqSchema = (faqs: Faq[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});
