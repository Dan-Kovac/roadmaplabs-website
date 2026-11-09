// Turns a post Markdown file (src/content/posts/*.md) into an upsert for Supabase public.posts.
// Usage: node scripts/post-to-sql.mjs src/content/posts/<slug>.md > supabase/seed/<slug>.sql
import fs from 'node:fs';
import yaml from 'js-yaml';

const file = process.argv[2];
const SITE = 'https://roadmaplabs.com.au';
const raw = fs.readFileSync(file, 'utf8');
const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!m) throw new Error('No frontmatter');
const d = yaml.load(m[1]);
const body = m[2];

const q = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`);
// Dollar-quoted string for the Markdown body, with a tag that can't appear in the text.
const dq = (s) => {
  let tag = 'md';
  while (s.includes('$' + tag + '$')) tag += 'x';
  const t = '$' + tag + '$';
  return t + s + t;
};
const arr = (a) => `array[${(a || []).map(q).join(', ')}]::text[]`;
const iso = (v) => (v instanceof Date ? v.toISOString() : new Date(v).toISOString());
const img = d.featured_image
  ? /^https?:/.test(d.featured_image) ? d.featured_image : `${SITE}/blog/${d.slug}/${d.featured_image}`
  : null;

const cols = {
  slug: q(d.slug),
  status: q(d.status),
  title: q(d.title),
  meta_title: q(d.meta_title),
  meta_description: q(d.meta_description),
  excerpt: q(d.excerpt),
  body_md: dq(body),
  cluster: q(d.cluster),
  is_pillar: d.is_pillar ? 'true' : 'false',
  primary_keyword: q(d.primary_keyword),
  secondary_keywords: arr(d.secondary_keywords),
  faq: `${q(JSON.stringify(d.faq || []))}::jsonb`,
  related_slugs: arr(d.related_slugs),
  featured_image_url: q(img),
  featured_image_alt: q(d.featured_image_alt),
  author_name: q(d.author_name || 'Dan Kovac'),
  reading_minutes: d.reading_minutes ?? 'null',
  publish_at: q(iso(d.published_at)),
  published_at: d.status === 'published' ? q(iso(d.published_at)) : 'null',
};
const names = Object.keys(cols);
const updates = names.filter((n) => n !== 'slug').map((n) => `${n} = excluded.${n}`).join(', ');
console.log(
  `insert into public.posts (${names.join(', ')})\nvalues (${names.map((n) => cols[n]).join(',\n  ')})\non conflict (slug) do update set ${updates};`,
);
