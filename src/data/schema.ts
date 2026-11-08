import { getImage } from 'astro:assets';
import { SITE, abs } from './site';
import danPhoto from '../assets/images/dan-kovac.jpg';

const ORG_ID = `${SITE.url}/#organization`;
const PERSON_ID = `${SITE.url}/about#dan-kovac`;

type CaseLike = { href: string; name: string; og: string };

/** Article and BreadcrumbList for a case study page. */
export function caseSchema(c: CaseLike, title: string, description: string) {
  const url = abs(c.href);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: title.replace(/ \| Roadmap Labs$/, ''),
      description,
      image: [abs(c.og)],
      url,
      mainEntityOfPage: url,
      inLanguage: 'en-AU',
      datePublished: SITE.launchDate,
      dateModified: SITE.launchDate,
      author: { '@type': 'Person', '@id': PERSON_ID, name: 'Dan Kovac', url: abs('/about') },
      publisher: {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: SITE.name,
        logo: { '@type': 'ImageObject', url: `${SITE.url}/logo.png` },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
        { '@type': 'ListItem', position: 2, name: 'Our work', item: abs('/work') },
        { '@type': 'ListItem', position: 3, name: c.name, item: url },
      ],
    },
  ];
}

/** Person schema for Dan Kovac on the About page. */
export async function personSchema() {
  const img = await getImage({ src: danPhoto, width: 480, format: 'jpg' });
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Dan Kovac',
    jobTitle: 'AI consultant',
    url: abs('/about'),
    image: abs(img.src),
    email: SITE.email,
    worksFor: { '@type': 'Organization', '@id': ORG_ID, name: SITE.name, url: `${SITE.url}/` },
    address: { '@type': 'PostalAddress', addressLocality: 'Melbourne', addressRegion: 'VIC', addressCountry: 'AU' },
    knowsAbout: ['Artificial intelligence', 'Business process automation', 'Digital marketing', 'Product management'],
  };
}
