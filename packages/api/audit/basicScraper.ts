import { getPageWithTor } from '../services/torScraper';

export async function basicAudit(url: string): Promise<{
  title: string;
  description: string;
  headings: string[];
  h1: string;
  links: string[];
  imagesWithoutAlt: number;
  canonical: string;
}> {
  const { $ } = await getPageWithTor(url);

  const title = $('title').text().trim();
  const description = $('meta[name="description"]').attr('content') || '';
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const headings: string[] = [];
let h1 = '';
$('h1, h2, h3').each((_, el) => {
  const tag = $(el)[0]?.tagName?.toLowerCase();
  const texto = $(el).text().trim();
  headings.push(texto);
  if (tag === 'h1' && !h1) h1 = texto;
});
  const links: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && !href.startsWith('javascript')) links.push(href);
  });

  const imagesWithoutAlt = $('img').filter((_, el) => !$(el).attr('alt')).length;

  return {
    title,
    description,
    headings,
    h1,
    links,
    imagesWithoutAlt,
    canonical,
  };
}
