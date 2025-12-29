import { Router, Request, Response, NextFunction } from 'express';
import { BrokenLinkService } from './service';
import { validateAnalysisRequest, validateUrl, validateExportFormat, validatePlanLimits } from './validators';

const router = Router();
const brokenLinkService = new BrokenLinkService();

// Extender el tipo Request para incluir user
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    plan: 'free' | 'pro' | 'enterprise';
    planLimits: {
      maxUrlsPerAnalysis: number;
      maxConcurrentAnalyses: number;
      exportFormats: string[];
    };
  };
}

// Middleware de autenticación simulado para desarrollo
const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Simulación de usuario autenticado
  (req as AuthenticatedRequest).user = {
    id: 'user-123',
    email: 'test@example.com',
    plan: 'pro',
    planLimits: {
      maxUrlsPerAnalysis: 5000,
      maxConcurrentAnalyses: 5,
      exportFormats: ['csv', 'pdf']
    }
  };
  next();
};

// POST /api/broken-links/analyze - Iniciar análisis de enlaces rotos
router.post('/analyze', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    
    // Validar datos de entrada
    const validation = validateAnalysisRequest(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: validation.errors
      });
      return;
    }

    const { url, depth = 3, includeExternal = false, excludePaths = [] } = req.body;

    // Validar URL
    const urlValidation = validateUrl(url);
    if (!urlValidation.isValid) {
      res.status(400).json({
        success: false,
        error: 'URL inválida',
        details: urlValidation.errors
      });
      return;
    }

    // Validar límites del plan
    const planValidation = validatePlanLimits(authReq.user.plan, depth);
    if (!planValidation.isValid) {
      res.status(403).json({
        success: false,
        error: 'Límites del plan excedidos',
        details: planValidation.errors
      });
      return;
    }

    // Crear análisis
    const analysisId = await brokenLinkService.createAnalysis({
      url,
      depth,
      includeExternal,
      excludePaths,
      userId: authReq.user.id,
      userPlan: authReq.user.plan
    });

    // Iniciar análisis asíncrono
    brokenLinkService.startAnalysis(analysisId).catch(console.error);

    res.status(201).json({
      success: true,
      data: {
        analysisId,
        status: 'iniciado',
        message: 'Análisis iniciado correctamente'
      }
    });
  } catch (error) {
    console.error('Error al iniciar análisis:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/broken-links/analyze/:analysisId - Obtener estado del análisis
router.get('/analyze/:analysisId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { analysisId } = req.params;

    const status = await brokenLinkService.getAnalysisStatus(analysisId);
    
    if (!status) {
      res.status(404).json({
        success: false,
        error: 'Análisis no encontrado'
      });
      return;
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error al obtener estado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/broken-links/results/:analysisId - Obtener resultados del análisis
router.get('/results/:analysisId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { analysisId } = req.params;

    const results = await brokenLinkService.getAnalysisResults(analysisId);
    
    if (!results) {
      res.status(404).json({
        success: false,
        error: 'Resultados no encontrados'
      });
      return;
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error al obtener resultados:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/broken-links/export/:analysisId - Exportar resultados
router.get('/export/:analysisId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { analysisId } = req.params;
    const { format = 'csv' } = req.query;

    // Validar formato de exportación
    const formatValidation = validateExportFormat(format as string, authReq.user.plan);
    if (!formatValidation.isValid) {
      res.status(403).json({
        success: false,
        error: 'Formato de exportación no permitido',
        details: formatValidation.errors
      });
      return;
    }

    const results = await brokenLinkService.getAnalysisResults(analysisId);
    
    if (!results) {
      res.status(404).json({
        success: false,
        error: 'Resultados no encontrados'
      });
      return;
    }

    // Generar archivo de exportación
    const exportData = await brokenLinkService.exportResults(analysisId, format as string);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="broken-links-${analysisId}.csv"`);
    } else if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="broken-links-${analysisId}.pdf"`);
    }

    res.send(exportData);
  } catch (error) {
    console.error('Error al exportar resultados:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/broken-links/history - Obtener historial de análisis
router.get('/history', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const history = await brokenLinkService.getAnalysisHistory(authReq.user.id, page, limit);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /api/broken-links/analyze/:analysisId - Cancelar análisis
router.delete('/analyze/:analysisId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { analysisId } = req.params;

    const status = await brokenLinkService.getAnalysisStatus(analysisId);
    
    if (!status) {
      res.status(404).json({
        success: false,
        error: 'Análisis no encontrado'
      });
      return;
    }

    // Solo se puede cancelar si está en progreso
    if (!['pending', 'running'].includes(status.status)) {
      res.status(400).json({
        success: false,
        error: 'El análisis no se puede cancelar en su estado actual'
      });
      return;
    }

    await brokenLinkService.cancelAnalysis(analysisId);

    res.json({
      success: true,
      message: 'Análisis cancelado correctamente'
    });
  } catch (error) {
    console.error('Error al cancelar análisis:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/broken-links/health - Health check
router.get('/health', (req: Request, res: Response): void => {
  res.json({
    success: true,
    service: 'broken-links-checker',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;