import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Local posts, same fields as the Supabase public.posts table. Used until Supabase is connected.
const posts = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/posts' }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    status: z.enum(['draft', 'scheduled', 'published', 'archived']),
    title: z.string(),
    meta_title: z.string().max(60),
    meta_description: z.string().min(120).max(160),
    excerpt: z.string().max(200),
    cluster: z.string(),
    is_pillar: z.boolean().default(false),
    primary_keyword: z.string(),
    secondary_keywords: z.array(z.string()).default([]),
    related_slugs: z.array(z.string()).default([]),
    featured_image: z.string().optional(),
    featured_image_alt: z.string().optional(),
    author_name: z.string().default('Dan Kovac'),
    reading_minutes: z.number().int().optional(),
    published_at: z.coerce.date(),
    updated_at: z.coerce.date(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  }),
});

export const collections = { posts };
