// Insights sections, one per topic cluster in the editorial calendar ("4. Where AI fits" -> where-ai-fits).
export type Cluster = { key: string; slug: string; name: string; description: string };

export const CLUSTERS: Cluster[] = [
  { key: '1', slug: 'choosing-tools', name: 'Choosing tools', description: 'Which AI tools and providers suit an established business, and what they really cost.' },
  { key: '2', slug: 'using-ai-safely', name: 'Using AI safely', description: 'Policies, data and the setup that keeps your business and your customers safe.' },
  { key: '3', slug: 'your-team', name: 'Your team', description: 'Getting the whole team using AI the same way, not just the keen ones.' },
  { key: '4', slug: 'where-ai-fits', name: 'Where AI fits', description: 'Finding the processes worth automating, and deciding what to do first.' },
  { key: '5', slug: 'admin', name: 'Admin', description: 'The day-to-day admin AI can take off your team.' },
  { key: '6', slug: 'connecting-tools', name: 'Connecting tools', description: 'Getting your CRM, inbox and other systems working together.' },
  { key: '7', slug: 'growth', name: 'Growth', description: 'Sales, marketing and SEO, once the core of the business runs well.' },
  { key: '8', slug: 'industry', name: 'Industry', description: 'AI in specific industries, from real projects.' },
  { key: '9', slug: 'cost', name: 'Cost', description: 'What AI costs to set up and run each month.' },
  { key: '10', slug: 'competitors', name: 'What others are doing', description: 'What businesses like yours are doing with AI right now.' },
];

/** Accepts "4. Where AI fits", "Where AI fits" or "where-ai-fits". */
export function clusterFor(value: string): Cluster {
  const v = value.trim();
  const num = v.match(/^(\d+)\./)?.[1];
  const found =
    (num && CLUSTERS.find((c) => c.key === num)) ||
    CLUSTERS.find((c) => c.slug === v || c.name.toLowerCase() === v.replace(/^\d+\.\s*/, '').replace(/\s*\(pillar\)$/i, '').toLowerCase());
  if (!found) throw new Error(`Unknown cluster: ${value}`);
  return found;
}
