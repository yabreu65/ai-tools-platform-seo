import { AnalysisStatus, AnalysisResults, BrokenLink } from './types';
import { v4 as uuidv4 } from 'uuid';

// Simulación de base de datos en memoria para desarrollo
// En producción esto se conectaría a MongoDB/PostgreSQL
class InMemoryStorage {
  private analyses: Map<string, any> = new Map();
  private brokenLinks: Map<string, BrokenLink[]> = new Map();
  private crawledPages: Map<string, any[]> = new Map();
  private analysisResults: Map<string, any> = new Map();

  // Análisis
  async saveAnalysis(analysis: any): Promise<void> {
    this.analyses.set(analysis.id, { ...analysis });
  }

  async getAnalysis(analysisId: string): Promise<any | null> {
    return this.analyses.get(analysisId) || null;
  }

  async updateAnalysisStatus(
    analysisId: string, 
    status: string, 
    additionalData?: any
  ): Promise<void> {
    const analysis = this.analyses.get(analysisId);
    if (analysis) {
      analysis.status = status;
      if (additionalData) {
        Object.assign(analysis, additionalData);
      }
      this.analyses.set(analysisId, analysis);
    }
  }

  async updateAnalysisProgress(analysisId: string, progress: any): Promise<void> {
    const analysis = this.analyses.get(analysisId);
    if (analysis) {
      Object.assign(analysis, progress);
      this.analyses.set(analysisId, analysis);
    }
  }

  // Enlaces rotos
  async saveBrokenLink(analysisId: string, brokenLink: any): Promise<void> {
    const links = this.brokenLinks.get(analysisId) || [];
    links.push({ ...brokenLink, id: `${analysisId}-${links.length}` });
    this.brokenLinks.set(analysisId, links);
  }

  async getBrokenLinks(analysisId: string): Promise<BrokenLink[]> {
    return this.brokenLinks.get(analysisId) || [];
  }

  // Páginas rastreadas
  async saveCrawledPage(analysisId: string, pageData: any): Promise<void> {
    const pages = this.crawledPages.get(analysisId) || [];
    pages.push({ ...pageData, id: `${analysisId}-${pages.length}` });
    this.crawledPages.set(analysisId, pages);
  }

  async getCrawledPages(analysisId: string): Promise<any[]> {
    return this.crawledPages.get(analysisId) || [];
  }

  // Resultados
  async saveAnalysisResults(analysisId: string, results: any): Promise<void> {
    this.analysisResults.set(analysisId, results);
  }

  async getAnalysisResults(analysisId: string): Promise<any | null> {
    return this.analysisResults.get(analysisId) || null;
  }

  getAllAnalyses(): any[] {
    return Array.from(this.analyses.values());
  }
}

export class BrokenLinkStorage {
  private storage: InMemoryStorage;

  constructor() {
    this.storage = new InMemoryStorage();
  }

  async saveAnalysis(analysis: any): Promise<void> {
    return this.storage.saveAnalysis(analysis);
  }

  async getAnalysis(analysisId: string): Promise<any | null> {
    return this.storage.getAnalysis(analysisId);
  }

  async updateAnalysisStatus(
    analysisId: string, 
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
    additionalData?: any
  ): Promise<void> {
    return this.storage.updateAnalysisStatus(analysisId, status, additionalData);
  }

  async updateAnalysisProgress(analysisId: string, progress: {
    progress: number;
    pagesAnalyzed: number;
    linksFound: number;
    brokenLinks: number;
  }): Promise<void> {
    return this.storage.updateAnalysisProgress(analysisId, progress);
  }

  async saveBrokenLink(analysisId: string, brokenLink: {
    sourceUrl: string;
    targetUrl: string;
    statusCode: number;
    errorType: string;
    linkType: 'internal' | 'external';
    foundAt?: Date;
  }): Promise<void> {
    return this.storage.saveBrokenLink(analysisId, brokenLink);
  }

  async saveCrawledPage(analysisId: string, pageData: {
    url: string;
    statusCode: number;
    linksCount: number;
    crawledAt: Date;
  }): Promise<void> {
    return this.storage.saveCrawledPage(analysisId, pageData);
  }

  async saveAnalysisResults(analysisId: string, results: {
    summary: any;
    recommendations: string[];
  }): Promise<void> {
    return this.storage.saveAnalysisResults(analysisId, results);
  }

  async getAnalysisStatus(analysisId: string): Promise<AnalysisStatus | null> {
    const analysis = await this.storage.getAnalysis(analysisId);
    if (!analysis) return null;

    return {
      analysisId: analysis.id,
      status: analysis.status,
      progress: analysis.progress || 0,
      pagesAnalyzed: analysis.pagesAnalyzed || 0,
      linksFound: analysis.linksFound || 0,
      brokenLinks: analysis.brokenLinks || 0,
      startedAt: analysis.startedAt,
      completedAt: analysis.completedAt,
      error: analysis.error
    };
  }

  async getAnalysisResults(analysisId: string): Promise<AnalysisResults | null> {
    const analysis = await this.storage.getAnalysis(analysisId);
    const results = await this.storage.getAnalysisResults(analysisId);
    const brokenLinks = await this.storage.getBrokenLinks(analysisId);

    if (!analysis || !results) return null;

    return {
      summary: {
        totalPages: results.summary?.totalPages || 0,
        totalLinks: results.summary?.totalLinks || 0,
        brokenLinks: brokenLinks.length,
        healthScore: this.calculateHealthScore(results.summary?.totalLinks || 0, brokenLinks.length),
        analysisTime: results.summary?.analysisTime || 0
      },
      brokenLinks: brokenLinks.map(link => ({
        sourceUrl: link.sourceUrl,
        targetUrl: link.targetUrl,
        statusCode: link.statusCode,
        errorType: link.errorType,
        linkType: link.linkType
      })),
      recommendations: results.recommendations || []
    };
  }

  async getAnalysisHistory(userId: string, page: number, limit: number): Promise<{
    analyses: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Filtrar análisis por usuario (en desarrollo usamos todos)
    const allAnalyses = this.storage.getAllAnalyses()
      .sort((a: any, b: any) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAnalyses = allAnalyses.slice(startIndex, endIndex);

    return {
      analyses: paginatedAnalyses.map((analysis: any) => ({
        id: analysis.id,
        url: analysis.url,
        status: analysis.status,
        startedAt: analysis.startedAt,
        completedAt: analysis.completedAt,
        summary: {
          totalPages: analysis.pagesAnalyzed || 0,
          brokenLinks: analysis.brokenLinks || 0
        }
      })),
      total: allAnalyses.length,
      page,
      totalPages: Math.ceil(allAnalyses.length / limit)
    };
  }

  private calculateHealthScore(totalLinks: number, brokenLinks: number): number {
    if (totalLinks === 0) return 100;
    return Math.max(0, Math.round(((totalLinks - brokenLinks) / totalLinks) * 100));
  }

  async deleteAnalysis(analysisId: string): Promise<boolean> {
    const analysis = await this.storage.getAnalysis(analysisId);
    if (!analysis) return false;

    // En una implementación real, esto eliminaría de la base de datos
    return true;
  }
}