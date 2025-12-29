import { v4 as uuidv4 } from 'uuid';

export interface AnalysisStatus {
  analysisId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  pagesAnalyzed: number;
  linksFound: number;
  brokenLinks: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface ServiceAnalysisConfig {
  url: string;
  depth: number;
  excludePaths: string[];
  includeExternal: boolean;
  timeout?: number;
  userId: string;
  userPlan: string;
}

export interface AnalysisResults {
  summary: {
    totalPages: number;
    totalLinks: number;
    brokenLinks: number;
    healthScore: number;
    analysisTime: number;
  };
  brokenLinks: Array<{
    sourceUrl: string;
    targetUrl: string;
    statusCode: number;
    errorType: string;
    linkType: 'internal' | 'external';
  }>;
  recommendations: string[];
}

export class BrokenLinkService {
  private activeAnalyses: Map<string, any> = new Map();

  async createAnalysis(config: ServiceAnalysisConfig): Promise<string> {
    const analysisId = uuidv4();
    
    const analysis = {
      id: analysisId,
      url: config.url,
      depth: config.depth,
      status: 'pending' as const,
      progress: 0,
      pagesAnalyzed: 0,
      linksFound: 0,
      brokenLinks: 0,
      startedAt: new Date(),
      userId: config.userId,
      userPlan: config.userPlan,
      configuration: {
        excludePaths: config.excludePaths,
        includeExternal: config.includeExternal,
        timeout: config.timeout || 10000
      }
    };

    // Simular guardado en base de datos
    this.activeAnalyses.set(analysisId, analysis);
    return analysisId;
  }

  async startAnalysis(analysisId: string): Promise<void> {
    const analysis = this.activeAnalyses.get(analysisId);
    if (!analysis) {
      throw new Error('Análisis no encontrado');
    }

    // Actualizar estado a "running"
    analysis.status = 'running';
    this.activeAnalyses.set(analysisId, analysis);

    // Simular análisis asíncrono
    setTimeout(async () => {
      try {
        // Simular progreso
        for (let i = 0; i <= 100; i += 10) {
          analysis.progress = i;
          analysis.pagesAnalyzed = Math.floor(i / 10);
          analysis.linksFound = Math.floor(i / 5);
          analysis.brokenLinks = Math.floor(i / 20);
          this.activeAnalyses.set(analysisId, analysis);
          
          if (i < 100) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        // Completar análisis
        analysis.status = 'completed';
        analysis.completedAt = new Date();
        this.activeAnalyses.set(analysisId, analysis);

      } catch (error) {
        analysis.status = 'failed';
        analysis.error = error instanceof Error ? error.message : 'Error desconocido';
        this.activeAnalyses.set(analysisId, analysis);
      }
    }, 1000);
  }

  async getAnalysisStatus(analysisId: string): Promise<AnalysisStatus | null> {
    const analysis = this.activeAnalyses.get(analysisId);
    if (!analysis) return null;

    return {
      analysisId: analysis.id,
      status: analysis.status,
      progress: analysis.progress,
      pagesAnalyzed: analysis.pagesAnalyzed,
      linksFound: analysis.linksFound,
      brokenLinks: analysis.brokenLinks,
      startedAt: analysis.startedAt,
      completedAt: analysis.completedAt,
      error: analysis.error
    };
  }

  async getAnalysisResults(analysisId: string): Promise<AnalysisResults | null> {
    const analysis = this.activeAnalyses.get(analysisId);
    if (!analysis || analysis.status !== 'completed') return null;

    // Simular resultados
    const brokenLinks = [
      {
        sourceUrl: analysis.url,
        targetUrl: analysis.url + '/broken-page',
        statusCode: 404,
        errorType: '404',
        linkType: 'internal' as const
      },
      {
        sourceUrl: analysis.url,
        targetUrl: 'https://external-broken-site.com/page',
        statusCode: 0,
        errorType: 'timeout',
        linkType: 'external' as const
      }
    ];

    return {
      summary: {
        totalPages: analysis.pagesAnalyzed,
        totalLinks: analysis.linksFound,
        brokenLinks: brokenLinks.length,
        healthScore: Math.max(0, 100 - (brokenLinks.length * 10)),
        analysisTime: analysis.completedAt ? 
          analysis.completedAt.getTime() - analysis.startedAt.getTime() : 0
      },
      brokenLinks,
      recommendations: [
        'Corregir enlaces con error 404',
        'Verificar conectividad con sitios externos',
        'Implementar redirects para páginas movidas',
        'Revisar configuración de timeout'
      ]
    };
  }

  async exportResults(analysisId: string, format: string): Promise<string | null> {
    const results = await this.getAnalysisResults(analysisId);
    if (!results) return null;

    if (format === 'csv') {
      const headers = ['URL Origen', 'URL Destino', 'Código', 'Error', 'Tipo'];
      const rows = results.brokenLinks.map(link => [
        link.sourceUrl,
        link.targetUrl,
        link.statusCode.toString(),
        link.errorType,
        link.linkType
      ]);

      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
    }

    if (format === 'pdf') {
      return `<html><body><h1>Reporte de Enlaces Rotos</h1><p>Total: ${results.brokenLinks.length} enlaces rotos</p></body></html>`;
    }

    return null;
  }

  async getAnalysisHistory(userId: string, page: number, limit: number): Promise<{
    analyses: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Filtrar análisis por usuario
    const userAnalyses = Array.from(this.activeAnalyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAnalyses = userAnalyses.slice(startIndex, endIndex);

    return {
      analyses: paginatedAnalyses.map(analysis => ({
        id: analysis.id,
        url: analysis.url,
        status: analysis.status,
        startedAt: analysis.startedAt,
        completedAt: analysis.completedAt,
        summary: {
          totalPages: analysis.pagesAnalyzed,
          brokenLinks: analysis.brokenLinks
        }
      })),
      total: userAnalyses.length,
      page,
      totalPages: Math.ceil(userAnalyses.length / limit)
    };
  }

  async cancelAnalysis(analysisId: string): Promise<boolean> {
    const analysis = this.activeAnalyses.get(analysisId);
    if (!analysis) return false;

    if (['pending', 'running'].includes(analysis.status)) {
      analysis.status = 'cancelled';
      this.activeAnalyses.set(analysisId, analysis);
      return true;
    }

    return false;
  }
}