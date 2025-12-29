import express, { Request, Response } from 'express';
import { scrapeKeywordsFromPage } from '../../services/scrapePage';
import { getGoogleSuggestions } from '../../services/googleSuggest';
import { cache, generateCacheKey } from '../../utils/cache';

const router = express.Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const url = req.query.url as string | undefined;
  const query = req.query.query as string | undefined;

  if (!url && !query) {
    res.status(400).json({ error: 'Se requiere una URL o una palabra clave' });
    return;
  }

  // Generar clave de cache
  const cacheKey = generateCacheKey('keywords', { url: url || '', query: query || '' });
  
  // Verificar cache
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    console.log(`Cache hit for keywords: ${url || query}`);
    res.json({
      ...cachedResult,
      fromCache: true
    });
    return;
  }

  try {
    const startTime = Date.now();
    
    const [fromPage, suggested] = await Promise.allSettled([
      url ? scrapeKeywordsFromPage(url) : Promise.resolve([]),
      query ? getGoogleSuggestions(query) : Promise.resolve([])
    ]);

    const processingTime = Date.now() - startTime;
    
    const result = {
      fromPage: fromPage.status === 'fulfilled' ? fromPage.value : [],
      suggested: suggested.status === 'fulfilled' ? suggested.value : [],
      metadata: {
        processingTime,
        errors: [
          ...(fromPage.status === 'rejected' ? [`Error scraping page: ${fromPage.reason?.message || 'Unknown error'}`] : []),
          ...(suggested.status === 'rejected' ? [`Error getting suggestions: ${suggested.reason?.message || 'Unknown error'}`] : [])
        ]
      }
    };

    // Guardar en cache (20 minutos para keywords)
    cache.set(cacheKey, result, 20);
    
    res.json(result);
  } catch (error: any) {
    console.error('[KEYWORDS SCRAPER ERROR]', error);
    res.status(500).json({ 
      error: 'Error procesando keywords',
      details: error.message || 'Error interno',
      fromPage: [],
      suggested: []
    });
  }
});

export default router;
