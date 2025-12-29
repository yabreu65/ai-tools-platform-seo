import express, { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import natural from 'natural';
import cosineSimilarity from 'cosine-similarity';
import dotenv from 'dotenv';
import { scrapeWithTor } from '../../services/torScraper'; // ⚠️ Reemplazá con la ruta real

dotenv.config();

const router = express.Router();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

function limpiarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calcularSimilitud(textoA: string, textoB: string): number {
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();

  tfidf.addDocument(textoA);
  tfidf.addDocument(textoB);

  const vocabulary = new Set<string>();
  tfidf.listTerms(0).forEach(item => vocabulary.add(item.term));
  tfidf.listTerms(1).forEach(item => vocabulary.add(item.term));

  const vectorA: number[] = [];
  const vectorB: number[] = [];

  vocabulary.forEach(term => {
    vectorA.push(tfidf.tfidf(term, 0));
    vectorB.push(tfidf.tfidf(term, 1));
  });

  return cosineSimilarity(vectorA, vectorB);
}

function extraerTextoVisible(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, noscript, iframe, head, meta, link').remove();
  return limpiarTexto($('body').text());
}

function obtenerFraseClave(texto: string): string {
  return texto.split('.').slice(0, 2).join('. ').slice(0, 200);
}

async function obtenerTextoDesdeURL(url: string): Promise<string | null> {
  try {
    const html = await axios.get<string>(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)' },
    });
    return extraerTextoVisible(html.data);
  } catch (axiosError) {
    console.warn(`Axios falló para ${url}, intentando con Tor...`);
    try {
      const $ = await scrapeWithTor(url);
      if ($) {
        $('script, style, noscript, iframe, head, meta, link').remove();
        return limpiarTexto($('body').text());
      }
    } catch (torError) {
      console.error(`Tor también falló para ${url}`);
    }
    return null;
  }
}

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { texto, idioma = 'lang_es' } = req.body;

  if (!texto) {
    res.status(400).json({ error: 'Falta el texto a verificar.' });
    return;
  }

  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    res.status(500).json({ error: 'Faltan claves de API de Google.' });
    return;
  }

  try {
    const cleanText = limpiarTexto(texto);
    const query = obtenerFraseClave(cleanText);

    const response = await axios.get<{ items: any[] }>('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CX,
        q: query,
        lr: idioma,
        num: 10,
      },
    });

    const resultados = await Promise.all(
      (response.data.items || []).map(async (item: any) => {
        const textFromPage = await obtenerTextoDesdeURL(item.link);
        if (!textFromPage) return null;
        const score = calcularSimilitud(cleanText, textFromPage);
        return { url: item.link, score: Number(score.toFixed(2)) };
      })
    );

    const duplicados = resultados.filter(Boolean).filter(r => r!.score >= 0.3);

    if (duplicados.length === 0) {
      res.json({ original: texto, duplicados: [{ url: 'Ningún resultado relevante encontrado.', score: 0 }] });
    } else {
      res.json({ original: texto, duplicados });
    }

  } catch (err: any) {
    console.error('[DUPLICATE CHECK ERROR]', err);
    res.status(500).json({ error: err.message || 'Error interno' });
  }
});

export default router;
