import express, { Request, Response } from 'express';
import { cache } from '../utils/cache';

const router = express.Router();

// Obtener estadísticas del cache
router.get('/stats', (req: Request, res: Response) => {
  const stats = cache.getStats();
  res.json({
    ...stats,
    timestamp: new Date().toISOString()
  });
});

// Limpiar cache
router.delete('/clear', (req: Request, res: Response) => {
  cache.clear();
  res.json({ 
    message: 'Cache cleared successfully',
    timestamp: new Date().toISOString()
  });
});

export default router;