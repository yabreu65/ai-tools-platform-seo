import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { AnalysisService } from './analysis-service';
import { ExportService } from './export-service';
import { AnalysisRequest, ExportOptions, UserPlanLimits } from './types';

const router = express.Router();
const analysisService = new AnalysisService();
const exportService = new ExportService();

// Define authenticated request type to avoid any casts
interface AuthenticatedRequest extends Request {
  userId: string;
  userPlan: string;
  planLimits: UserPlanLimits;
}

// User plan limits based on subscription
const getPlanLimits = (userPlan: string): UserPlanLimits => {
  const limits: Record<string, UserPlanLimits> = {
    free: {
      maxUrls: 5,
      maxAnalysesPerMonth: 10,
      maxKeywordsPerResult: 50,
      canExportPdf: false
    },
    pro: {
      maxUrls: 50,
      maxAnalysesPerMonth: 100,
      maxKeywordsPerResult: 500,
      canExportPdf: true
    },
    enterprise: {
      maxUrls: 1000,
      maxAnalysesPerMonth: -1, // unlimited
      maxKeywordsPerResult: -1, // unlimited
      canExportPdf: true
    }
  };

  return limits[userPlan] || limits.free;
};

// Middleware to check authentication
const requireAuth: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.headers['x-user-id'] as string | undefined;
  const userPlan = (req.headers['x-user-plan'] as string | undefined) || 'free';

  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  (req as AuthenticatedRequest).userId = userId;
  (req as AuthenticatedRequest).userPlan = userPlan;
  (req as AuthenticatedRequest).planLimits = getPlanLimits(userPlan);
  
  next();
};

// Start keyword analysis
router.post('/analyze', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, planLimits } = req as AuthenticatedRequest;
    const analysisRequest: AnalysisRequest = req.body;

    // Validate request
    if (!analysisRequest.urls || !Array.isArray(analysisRequest.urls) || analysisRequest.urls.length === 0) {
      res.status(400).json({ error: 'URLs array is required' });
      return;
    }

    // Check monthly usage limits (if applicable)
    if (planLimits.maxAnalysesPerMonth > 0) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      // This would typically check against a usage tracking system
      // For now, we'll skip this check
    }

    // Start analysis
    const analysisId = await analysisService.startAnalysis(userId, analysisRequest, planLimits);

    // Estimate processing time (rough calculation)
    const estimatedTime = analysisRequest.urls.length * (analysisRequest.depth || 1) * 10; // 10 seconds per URL per depth

    res.json({
      analysisId,
      status: 'started',
      estimatedTime
    });

  } catch (error) {
    console.error('Error starting analysis:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to start analysis' 
    });
  }
});

// Get analysis status and results
router.get('/results/:analysisId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, planLimits } = req as AuthenticatedRequest;
    const { analysisId } = req.params;

    const results = await analysisService.getAnalysisResults(analysisId, userId);

    // Apply plan limits to results
    if (planLimits.maxKeywordsPerResult > 0) {
      results.keywords = results.keywords.slice(0, planLimits.maxKeywordsPerResult);
    }

    res.json(results);

  } catch (error) {
    console.error('Error getting results:', error);
    
    if (error instanceof Error && error.message === 'Analysis not found') {
      res.status(404).json({ error: 'Analysis not found' });
    } else {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get results' 
      });
    }
  }
});

// Export analysis results
router.get('/export/:analysisId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, planLimits } = req as AuthenticatedRequest;
    const { analysisId } = req.params;
    const format = (req.query.format as 'csv' | 'pdf') || 'csv';
    const includeMetrics = req.query.includeMetrics === 'true';
    const includeOpportunities = req.query.includeOpportunities === 'true';

    // Check if user can export in requested format
    if (format === 'pdf' && !planLimits.canExportPdf) {
      res.status(403).json({ error: 'PDF export requires Pro or Enterprise plan' });
      return;
    }

    const results = await analysisService.getAnalysisResults(analysisId, userId);

    // Apply plan limits
    let keywords = results.keywords;
    if (planLimits.maxKeywordsPerResult > 0) {
      keywords = keywords.slice(0, planLimits.maxKeywordsPerResult);
    }

    const exportOptions: ExportOptions = {
      format,
      includeMetrics,
      includeOpportunities
    };

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    if (format === 'pdf') {
      buffer = await exportService.exportToPDF(
        keywords,
        results.competitors,
        results.opportunities,
        results.metrics,
        exportOptions
      );
      contentType = 'application/pdf';
      filename = exportService.generateFileName(analysisId, 'pdf');
    } else {
      buffer = await exportService.exportToCSV(
        keywords,
        results.competitors,
        results.opportunities,
        results.metrics,
        exportOptions
      );
      contentType = 'text/csv';
      filename = exportService.generateFileName(analysisId, 'csv');
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);

  } catch (error) {
    console.error('Error exporting results:', error);
    
    if (error instanceof Error && error.message === 'Analysis not found') {
      res.status(404).json({ error: 'Analysis not found' });
    } else {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to export results' 
      });
    }
  }
});

// Get user's analysis history
router.get('/history', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const history = await analysisService.getUserAnalysisHistory(userId, page, limit);

    res.json(history);

  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get history' 
    });
  }
});

// Delete analysis
router.delete('/analysis/:analysisId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { analysisId } = req.params;

    await analysisService.deleteAnalysis(analysisId, userId);

    res.json({ success: true });

  } catch (error) {
    console.error('Error deleting analysis:', error);
    
    if (error instanceof Error && error.message === 'Analysis not found') {
      res.status(404).json({ error: 'Analysis not found' });
    } else {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to delete analysis' 
      });
    }
  }
});

// Get analysis status (for polling)
router.get('/status/:analysisId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { analysisId } = req.params;

    const results = await analysisService.getAnalysisResults(analysisId, userId);

    res.json({
      status: results.analysis.status,
      progress: results.analysis.status === 'completed' ? 100 : 
               results.analysis.status === 'processing' ? 50 : 0,
      metrics: results.analysis.status === 'completed' ? results.metrics : null,
      error: results.analysis.error
    });

  } catch (error) {
    console.error('Error getting status:', error);
    
    if (error instanceof Error && error.message === 'Analysis not found') {
      res.status(404).json({ error: 'Analysis not found' });
    } else {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get status' 
      });
    }
  }
});

// Compare multiple analyses
router.post('/compare', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { analysisIds } = req.body;

    if (!analysisIds || !Array.isArray(analysisIds) || analysisIds.length < 2) {
      res.status(400).json({ error: 'At least 2 analysis IDs required for comparison' });
      return;
    }

    const comparisons: any[] = [];

    for (const analysisId of analysisIds) {
      try {
        const results = await analysisService.getAnalysisResults(analysisId, userId);
        comparisons.push({
          analysisId,
          urls: results.analysis.urls,
          metrics: results.metrics,
          topKeywords: results.keywords
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 20)
        });
      } catch (error) {
        // Skip invalid analysis IDs
        continue;
      }
    }

    if (comparisons.length < 2) {
      res.status(400).json({ error: 'Not enough valid analyses for comparison' });
      return;
    }

    // Find common and unique keywords
    const allKeywords = new Map<string, any[]>();
    
    comparisons.forEach((comp, index) => {
      comp.topKeywords.forEach((kw: any) => {
        if (!allKeywords.has(kw.keyword)) {
          allKeywords.set(kw.keyword, []);
        }
        allKeywords.get(kw.keyword)!.push({ ...kw, analysisIndex: index });
      });
    });

    const commonKeywords = Array.from(allKeywords.entries())
      .filter(([, instances]) => instances.length > 1)
      .map(([keyword, instances]) => ({ keyword, instances }));

    const uniqueKeywords = Array.from(allKeywords.entries())
      .filter(([, instances]) => instances.length === 1)
      .map(([keyword, instances]) => ({ keyword, instance: instances[0] }));

    res.json({
      comparisons,
      commonKeywords,
      uniqueKeywords,
      summary: {
        totalAnalyses: comparisons.length,
        commonKeywordsCount: commonKeywords.length,
        uniqueKeywordsCount: uniqueKeywords.length
      }
    });

  } catch (error) {
    console.error('Error comparing analyses:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to compare analyses' 
    });
  }
});

// Health check
router.get('/health', (req: Request, res: Response): void => {
  res.json({ 
    status: 'healthy', 
    service: 'keyword-scraper',
    timestamp: new Date().toISOString()
  });
});

export { router as keywordScraperRoutes };