import { Router, Request, Response } from 'express';
import { basicAudit } from '../../audit/basicScraper';
import { deepAudit } from '../../audit/headlessScraper';
import { cache, generateCacheKey } from '../../utils/cache';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { url = '', mode = 'basic' } = req.query;

  if (!url) {
    res.status(400).json({ error: 'URL es requerida para realizar la auditoría' });
    return;
  }

  // Validar URL
  try {
    new URL(url as string);
  } catch {
    res.status(400).json({ error: 'URL inválida. Asegúrate de incluir http:// o https://' });
    return;
  }

  const startTime = Date.now();
  
  // Generar clave de cache
  const cacheKey = generateCacheKey('audit', { url: url as string, mode: mode as string });
  
  // Verificar cache
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    console.log(`Cache hit for auditor: ${url}`);
    res.json({
      ...cachedResult,
      metadata: {
        ...(cachedResult as any).metadata,
        fromCache: true
      }
    });
    return;
  }
  
  try {
    const data = mode === 'deep' 
      ? await deepAudit(url as string) 
      : await basicAudit(url as string);
    
    const processingTime = Date.now() - startTime;
    
    const result = {
      ...data,
      metadata: {
        processingTime,
        mode: mode as string,
        url: url as string,
        fromCache: false
      }
    };

    // Guardar en cache (15 minutos para auditorías)
    cache.set(cacheKey, result, 15);
    
    res.json(result);
  } catch (err) {
    const processingTime = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : 'Error interno del servidor';
    
    console.error(`[AUDIT ERROR] ${mode} audit failed for ${url}:`, errorMessage);
    
    res.status(500).json({ 
      error: 'Error realizando auditoría SEO',
      details: errorMessage,
      metadata: {
        processingTime,
        mode: mode as string,
        url: url as string
      }
    });
  }
});

export default router;
