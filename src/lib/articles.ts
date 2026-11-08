import { getCollection, type CollectionEntry } from 'astro:content';

export type ArticleEntry = CollectionEntry<'articles'>;

/** Drafts are excluded in every build, including production. */
export async function publishedArticles(): Promise<ArticleEntry[]> {
  const articles = await getCollection('articles', ({ data }) => data.draft !== true);
  return articles.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}
