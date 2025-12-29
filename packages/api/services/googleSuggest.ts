import axios from 'axios';
import { scrapeWithTor } from './torScraper';
import * as cheerio from 'cheerio';

export async function getGoogleSuggestions(query: string): Promise<string[]> {
  const url = 'https://suggestqueries.google.com/complete/search';
  const params = {
    client: 'firefox',
    hl: 'es',
    gl: 'AR',
    q: query,
  };

  try {
    const response = await axios.get<[string, string[]]>(url, { params });
    return response.data[1] || [];
  } catch (error) {
    console.warn('[SUGGESTIONS FALLBACK A TOR] Usando Puppeteer...');
    return await getSuggestionsWithTor(query);
  }
}

async function getSuggestionsWithTor(query: string): Promise<string[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=AR&q=${encodeURIComponent(query)}`;
  const $ = await scrapeWithTor(url);
  if (!$) return [];

  // Google devuelve JS o JSON embebido, así que parseamos desde el body
  const texto = $('body').text();

  try {
    const parsed = JSON.parse(texto);
    return parsed[1] || [];
  } catch {
    console.error('[ERROR] No se pudo parsear sugerencias con Tor');
    return [];
  }
}
