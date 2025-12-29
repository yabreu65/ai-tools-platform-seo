
import { scrapeWithTor } from './torScraper';

// Palabras comunes que eliminamos
const stopwords = new Set([
  'de', 'la', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'por', 'con', 'las',
  'para', 'es', 'una', 'al', 'como', 'más', 'sus', 'le', 'ya', 'o', 'fue',
  'que', 'un', 'su', 'no', 'sí', 'ha', 'lo', 'este', 'pero', 'entre', 'también'
]);

function limpiarTexto(texto: string): string[] {
  return texto
    .toLowerCase()
    .replace(/[^a-záéíóúñü\s]/gi, '')
    .split(/\s+/)
    .filter(p => p.length > 2 && !stopwords.has(p));
}

export async function scrapeKeywordsFromPage(url: string): Promise<{ keyword: string; count: number }[]> {
  const $ = await scrapeWithTor(url);
  if (!$) return [];

  let texto = '';
  $('title, meta[name=description], h1, h2, h3, p, a, strong').each((_, el) => {
    texto += ' ' + $(el).text();
  });

  const palabras = limpiarTexto(texto);

  const frecuencia: Record<string, number> = {};
  palabras.forEach(word => {
    frecuencia[word] = (frecuencia[word] || 0) + 1;
  });

  return Object.entries(frecuencia)
    .map(([word, count]) => ({ keyword: word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 25);
}
