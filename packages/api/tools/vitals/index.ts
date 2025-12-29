import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const url = req.query.url as string;
  const strategy = (req.query.strategy as string) || 'mobile';
  
  if (!url) {
    res.status(400).json({ error: 'URL es requerida para analizar Core Web Vitals' });
    return;
  }

  // Validar URL
  try {
    new URL(url);
  } catch {
    res.status(400).json({ error: 'URL inválida. Asegúrate de incluir http:// o https://' });
    return;
  }

  if (!process.env.PAGESPEED_API_KEY) {
    res.status(500).json({ error: 'API key de PageSpeed no configurada' });
    return;
  }

  const startTime = Date.now();

  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`;
    const response = await axios.get<{ lighthouseResult: any }>(apiUrl, {
      params: {
        url,
        category: 'performance',
        strategy,
        key: process.env.PAGESPEED_API_KEY
      },
      timeout: 30000 // 30 segundos timeout
    });

    const lighthouse = response.data.lighthouseResult;
    const audits = lighthouse.audits;
    const processingTime = Date.now() - startTime;

    // Verificar que los audits existan
    if (!audits) {
      throw new Error('No se pudieron obtener los datos de auditoría');
    }

    const result = {
      lcp: audits['largest-contentful-paint']?.numericValue ? 
           audits['largest-contentful-paint'].numericValue / 1000 : null,
      cls: audits['cumulative-layout-shift']?.numericValue || null,
      inp: audits['interactive']?.numericValue || null,
      score: lighthouse.categories?.performance?.score ? 
             Math.round(lighthouse.categories.performance.score * 100) : null,
      metadata: {
        processingTime,
        strategy,
        url
      }
    };

    res.json(result);
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    let errorMessage = 'No se pudo analizar la URL';
    
    if (error.response?.status === 400) {
      errorMessage = 'URL inválida o no accesible para PageSpeed Insights';
    } else if (error.response?.status === 403) {
      errorMessage = 'API key inválida o límite de cuota excedido';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Timeout: La análisis tardó demasiado tiempo';
    }
    
    console.error('Error al obtener datos de PageSpeed:', {
      url,
      error: error.message,
      status: error.response?.status
    });
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message,
      metadata: {
        processingTime,
        strategy,
        url
      }
    });
  }
});

export default router;
