import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    topic: z.string(),
    format: z.string(),
    author: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    readingTime: z.string(),
    sources: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
