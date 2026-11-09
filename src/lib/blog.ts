// Insights (blog) data: Supabase public.posts when SUPABASE_URL and SUPABASE_ANON_KEY are set at build
// time, otherwise the Markdown files in src/content/posts. Pages are always rendered to static HTML.
import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';
import { Marked, type Tokens } from 'marked';
import { clusterFor, type Cluster } from '../data/clusters';

export type Faq = { q: string; a: string };
export type Post = {
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  excerpt: string;
  cluster: Cluster;
  is_pillar: boolean;
  primary_keyword: string;
  secondary_keywords: string[];
  related_slugs: string[];
  featured_image: string | null; // absolute URL or site path
  featured_image_alt: string;
  author_name: string;
  reading_minutes: number;
  published_at: Date;
  updated_at: Date;
  faq: Faq[];
  body_md: string;
};

const SUPABASE_URL = import.meta.env.SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY as string | undefined;

const readingMinutes = (md: string) => Math.max(1, Math.ceil(md.split(/\s+/).filter(Boolean).length / 230));
const mediaPath = (slug: string, file: string) => (/^(https?:)?\//.test(file) ? file : `/blog/${slug}/${file}`);

async function fromSupabase(): Promise<Post[]> {
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  // RLS only exposes status = 'published' to the anon key.
  const { data, error } = await sb.from('posts').select('*').eq('status', 'published').order('published_at', { ascending: false });
  if (error) throw new Error(`Supabase posts query failed: ${error.message}`);
  return (data ?? []).map((r: any) => ({
    ...r,
    cluster: clusterFor(r.cluster),
    featured_image: r.featured_image_url ?? null,
    featured_image_alt: r.featured_image_alt ?? '',
    reading_minutes: r.reading_minutes ?? readingMinutes(r.body_md),
    published_at: new Date(r.published_at),
    updated_at: new Date(r.updated_at),
    faq: Array.isArray(r.faq) ? r.faq : [],
  }));
}

async function fromLocal(): Promise<Post[]> {
  const entries = await getCollection('posts', ({ data }) => data.status === 'published');
  return entries
    .map(({ data, body }) => ({
      ...data,
      cluster: clusterFor(data.cluster),
      featured_image: data.featured_image ? mediaPath(data.slug, data.featured_image) : null,
      featured_image_alt: data.featured_image_alt ?? '',
      reading_minutes: data.reading_minutes ?? readingMinutes(body ?? ''),
      body_md: body ?? '',
    }))
    .sort((a, b) => b.published_at.getTime() - a.published_at.getTime());
}

let cache: Promise<Post[]> | null = null;
export function getPosts(): Promise<Post[]> {
  cache ??= SUPABASE_URL && SUPABASE_ANON_KEY ? fromSupabase() : fromLocal();
  return cache;
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Melbourne' });

export const slugify = (s: string) =>
  s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;|&#\d+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Responsive figure for images in post bodies. Local images get WebP sources when they exist in public/.
function figure(slug: string, href: string, alt: string) {
  const src = mediaPath(slug, href);
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  let dims = '';
  let sources = '';
  if (src.startsWith('/') && !src.startsWith('//')) {
    const file = path.join(process.cwd(), 'public', src);
    const png = fs.existsSync(file) ? fs.readFileSync(file) : null;
    if (png && png.readUInt32BE(12) === 0x49484452) dims = ` width="${png.readUInt32BE(16)}" height="${png.readUInt32BE(20)}"`;
    const stem = src.replace(/\.(png|jpe?g)$/i, '');
    const has = (p: string) => fs.existsSync(path.join(process.cwd(), 'public', p));
    if (has(`${stem}.webp`)) {
      const set = [has(`${stem}-800.webp`) ? `${stem}-800.webp 800w` : '', `${stem}.webp 1600w`].filter(Boolean).join(', ');
      sources = `<source type="image/webp" srcset="${set}" sizes="(max-width: 1000px) calc(100vw - 32px), 960px">`;
    }
  }
  return `<figure class="post-figure"><picture>${sources}<img src="${src}" alt="${esc(alt)}"${dims} loading="lazy" decoding="async"></picture></figure>`;
}

export type RenderedPost = { intro: string; sections: { id: string; title: string; html: string }[]; takeaways: string | null; cta: { title: string; html: string } | null };

/** Renders the Markdown body. "Key takeaways" and the closing "Book a free 1-hour session" sections are returned separately. */
export function renderPost(post: Post): RenderedPost {
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading({ tokens, depth }: Tokens.Heading) {
        const text = this.parser.parseInline(tokens);
        return `<h${depth} id="${slugify(text)}">${text}</h${depth}>\n`;
      },
      paragraph({ tokens }: Tokens.Paragraph) {
        if (tokens.length === 1 && tokens[0].type === 'image') {
          const img = tokens[0] as Tokens.Image;
          return figure(post.slug, img.href, img.text);
        }
        if (tokens.length === 1 && tokens[0].type === 'link') {
          const l = tokens[0] as Tokens.Link;
          return `<p class="post-action"><a class="rl-btn rl-btn--lg" href="${l.href}">${this.parser.parseInline(l.tokens)}</a></p>\n`;
        }
        return `<p>${this.parser.parseInline(tokens)}</p>\n`;
      },
      link({ href, tokens }: Tokens.Link) {
        const ext = /^https?:\/\//.test(href) && !href.includes('roadmaplabs.com.au');
        return `<a href="${href}"${ext ? ' rel="noopener"' : ''}>${this.parser.parseInline(tokens)}</a>`;
      },
    },
  });

  const parts = post.body_md.split(/^## /m);
  const intro = marked.parse(parts[0]) as string;
  const sections: RenderedPost['sections'] = [];
  let takeaways: string | null = null;
  let cta: RenderedPost['cta'] = null;
  for (const part of parts.slice(1)) {
    const nl = part.indexOf('\n');
    const title = part.slice(0, nl).trim();
    const html = marked.parse(part.slice(nl + 1)) as string;
    if (/^key takeaways$/i.test(title)) takeaways = html;
    else if (/^book a free 1-hour session$/i.test(title)) cta = { title, html };
    else sections.push({ id: slugify(title), title, html });
  }
  return { intro, sections, takeaways, cta };
}
