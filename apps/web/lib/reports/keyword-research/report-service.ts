/**
 * Servicio principal de generación de reportes para Keyword Research Tool
 * Coordina la generación de reportes en diferentes formatos
 */

import PDFReportGenerator, { type ReportData, type PdfOptions } from './pdf-generator';
import ExcelReportGenerator, { type ExcelReportData, type ExcelOptions } from './excel-generator';
import { 
  KeywordDifficultyAnalyzer,
  NLPKeywordClustering,
  TrendAnalyzer,
  SerpAnalyzer
} from '../../algorithms/keyword-research';

interface ReportRequest {
  title: string;
  subtitle?: string;
  keywords: any[];
  includeAnalysis?: boolean;
  includeClusters?: boolean;
  includeTrends?: boolean;
  includeCompetitors?: boolean;
  includeSerpAnalysis?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: {
    minVolume?: number;
    maxDifficulty?: number;
    intents?: string[];
    countries?: string[];
  };
  customData?: {
    competitors?: any[];
    trends?: any[];
    serpData?: any[];
  };
}

interface ReportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  template?: 'standard' | 'executive' | 'detailed' | 'competitive';
  branding?: {
    logoUrl?: string;
    companyName?: string;
    colorScheme?: 'blue' | 'green' | 'purple';
  };
  sections?: {
    summary?: boolean;
    keywords?: boolean;
    clusters?: boolean;
    trends?: boolean;
    competitors?: boolean;
    serp?: boolean;
    recommendations?: boolean;
  };
  charts?: boolean;
  formatting?: boolean;
}

interface GeneratedReport {
  blob: Blob;
  filename: string;
  format: string;
  size: number;
  generatedAt: string;
  metadata: {
    totalKeywords: number;
    totalPages?: number;
    sections: string[];
  };
}

class ReportService {
  private pdfGenerator: PDFReportGenerator;
  private excelGenerator: ExcelReportGenerator;
  private difficultyAnalyzer: KeywordDifficultyAnalyzer;
  private clusteringService: NLPKeywordClustering;
  private trendAnalyzer: TrendAnalyzer;
  private serpAnalyzer: SerpAnalyzer;

  constructor() {
    this.pdfGenerator = new PDFReportGenerator();
    this.excelGenerator = new ExcelReportGenerator();
    this.difficultyAnalyzer = new KeywordDifficultyAnalyzer();
    this.clusteringService = new NLPKeywordClustering();
    this.trendAnalyzer = new TrendAnalyzer();
    this.serpAnalyzer = new SerpAnalyzer();
  }

  /**
   * Genera reporte en el formato especificado
   */
  async generateReport(request: ReportRequest, options: ReportOptions): Promise<GeneratedReport> {
    // Procesar y enriquecer datos
    const processedData = await this.processReportData(request);

    // Generar reporte según formato
    let blob: Blob;
    let filename: string;

    switch (options.format) {
      case 'pdf':
        blob = await this.generatePDFReport(processedData, options);
        filename = this.generateFilename(request.title, 'pdf');
        break;
      
      case 'excel':
        blob = this.generateExcelReport(processedData, options);
        filename = this.generateFilename(request.title, 'xlsx');
        break;
      
      case 'csv':
        blob = this.generateCSVReport(processedData, options);
        filename = this.generateFilename(request.title, 'csv');
        break;
      
      case 'json':
        blob = this.generateJSONReport(processedData, options);
        filename = this.generateFilename(request.title, 'json');
        break;
      
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }

    return {
      blob,
      filename,
      format: options.format,
      size: blob.size,
      generatedAt: new Date().toISOString(),
      metadata: {
        totalKeywords: processedData.keywords.length,
        sections: this.getIncludedSections(options.sections || {})
      }
    };
  }

  /**
   * Procesa y enriquece los datos del reporte
   */
  private async processReportData(request: ReportRequest): Promise<ReportData & ExcelReportData> {
    const now = new Date();
    
    // Datos base
    const baseData = {
      title: request.title,
      subtitle: request.subtitle,
      generatedDate: now.toLocaleDateString(),
      generatedBy: 'AI Tools Platform',
      keywords: request.keywords
    };

    // Calcular métricas de resumen
    const summary = this.calculateSummaryMetrics(request.keywords);

    // Generar análisis adicionales según configuración
    let clusters, trends, competitors, serpAnalysis;

    if (request.includeClusters) {
      clusters = await this.generateClusterAnalysis(request.keywords);
    }

    if (request.includeTrends) {
      trends = request.customData?.trends || await this.generateTrendAnalysis(request.keywords);
    }

    if (request.includeCompetitors) {
      competitors = request.customData?.competitors || await this.generateCompetitorAnalysis(request.keywords);
    }

    if (request.includeSerpAnalysis) {
      serpAnalysis = request.customData?.serpData || await this.generateSerpAnalysis(request.keywords);
    }

    // Generar recomendaciones
    const recommendations = await this.generateRecommendations(request.keywords, {
      clusters,
      trends,
      competitors,
      serpAnalysis
    });

    return {
      ...baseData,
      summary,
      clusters,
      trends,
      competitors,
      serpAnalysis,
      recommendations
    };
  }

  /**
   * Calcula métricas de resumen
   */
  private calculateSummaryMetrics(keywords: any[]) {
    const totalKeywords = keywords.length;
    const avgDifficulty = keywords.reduce((sum, k) => sum + k.difficulty, 0) / totalKeywords;
    const totalVolume = keywords.reduce((sum, k) => sum + k.volume, 0);
    const avgCpc = keywords.reduce((sum, k) => sum + k.cpc, 0) / totalKeywords;
    const topOpportunities = keywords.filter(k => k.opportunity === 'high').length;

    return {
      totalKeywords,
      avgDifficulty: Math.round(avgDifficulty),
      totalVolume,
      avgCpc,
      topOpportunities
    };
  }

  /**
   * Genera análisis de clusters
   */
  private async generateClusterAnalysis(keywords: any[]) {
    try {
      const clusteringResult = await this.clusteringService.clusterKeywords(
        keywords.map(k => ({
          keyword: k.keyword,
          volume: k.volume,
          difficulty: k.difficulty,
          cpc: k.cpc,
          intent: k.intent
        })),
        {
          minClusterSize: 3,
          maxClusters: 20,
          similarityThreshold: 0.6
        }
      );

      return clusteringResult.clusters.map(cluster => ({
        name: cluster.primaryKeyword,
        size: cluster.keywords.length,
        avgVolume: cluster.avgVolume,
        avgDifficulty: cluster.avgDifficulty,
        intent: cluster.dominantIntent,
        keywords: cluster.keywords,
        coherenceScore: cluster.coherenceScore,
        opportunities: cluster.opportunities
      }));
    } catch (error) {
      console.error('Error generating cluster analysis:', error);
      return [];
    }
  }

  /**
   * Genera análisis de tendencias
   */
  private async generateTrendAnalysis(keywords: any[]) {
    try {
      const trends = [];
      
      for (const keyword of keywords.slice(0, 10)) { // Limitar para demo
        // Generar datos históricos simulados
        const historicalData = this.generateHistoricalData(keyword);
        
        const trendResult = await this.trendAnalyzer.analyzeTrend(historicalData, {
          forecastPeriods: 12,
          seasonalityPeriod: 12,
          confidenceLevel: 0.95
        });

        trends.push({
          keyword: keyword.keyword,
          data: historicalData,
          forecast: {
            predicted: trendResult.forecast.predictions[0]?.value || 0,
            confidence: trendResult.forecast.confidence
          },
          seasonality: trendResult.seasonality.pattern,
          volatility: trendResult.volatility.score
        });
      }

      return trends;
    } catch (error) {
      console.error('Error generating trend analysis:', error);
      return [];
    }
  }

  /**
   * Genera análisis de competidores
   */
  private async generateCompetitorAnalysis(keywords: any[]) {
    // Simular datos de competidores
    const domains = [
      'competitor1.com', 'competitor2.com', 'competitor3.com',
      'competitor4.com', 'competitor5.com'
    ];

    return domains.map(domain => ({
      domain,
      keywords: Math.floor(Math.random() * 1000) + 100,
      avgPosition: Math.random() * 10 + 1,
      marketShare: Math.random() * 0.3,
      topKeywords: keywords.slice(0, 5).map(k => k.keyword),
      strengths: [
        'Strong domain authority',
        'High-quality content',
        'Good technical SEO'
      ],
      weaknesses: [
        'Limited content depth',
        'Slow page speed',
        'Poor mobile optimization'
      ]
    }));
  }

  /**
   * Genera análisis SERP
   */
  private async generateSerpAnalysis(keywords: any[]) {
    try {
      const serpAnalysis = [];

      for (const keyword of keywords.slice(0, 15)) {
        // Simular datos SERP
        const serpData = {
          keyword: keyword.keyword,
          location: 'United States',
          device: 'desktop',
          totalResults: Math.floor(Math.random() * 1000000) + 100000,
          features: {
            present: ['organic_results', 'paid_ads'],
            absent: ['featured_snippet', 'people_also_ask']
          },
          organicResults: Array.from({ length: 10 }, (_, i) => ({
            position: i + 1,
            url: `https://example${i + 1}.com`,
            title: `Result ${i + 1} for ${keyword.keyword}`,
            domain: `example${i + 1}.com`
          })),
          paidResults: []
        };

        const analysis = await this.serpAnalyzer.analyzeSerpData(serpData);

        serpAnalysis.push({
          keyword: keyword.keyword,
          features: analysis.features.present,
          organicResults: analysis.organicResults.length,
          paidResults: analysis.paidResults.length,
          difficulty: analysis.difficulty.score,
          opportunities: analysis.recommendations.immediate
        });
      }

      return serpAnalysis;
    } catch (error) {
      console.error('Error generating SERP analysis:', error);
      return [];
    }
  }

  /**
   * Genera recomendaciones
   */
  private async generateRecommendations(keywords: any[], analysisData: any) {
    const recommendations = [];

    // Recomendaciones basadas en keywords
    const highVolumeKeywords = keywords.filter(k => k.volume > 10000);
    if (highVolumeKeywords.length > 0) {
      recommendations.push({
        category: 'High Volume Opportunities',
        priority: 'high' as const,
        recommendation: `Focus on ${highVolumeKeywords.length} high-volume keywords with significant traffic potential`,
        impact: 'High traffic increase',
        effort: 'Medium'
      });
    }

    const lowDifficultyKeywords = keywords.filter(k => k.difficulty < 30);
    if (lowDifficultyKeywords.length > 0) {
      recommendations.push({
        category: 'Quick Wins',
        priority: 'high' as const,
        recommendation: `Target ${lowDifficultyKeywords.length} low-difficulty keywords for quick ranking improvements`,
        impact: 'Fast ranking gains',
        effort: 'Low'
      });
    }

    // Recomendaciones basadas en clusters
    if (analysisData.clusters && analysisData.clusters.length > 0) {
      const topCluster = analysisData.clusters[0];
      recommendations.push({
        category: 'Content Strategy',
        priority: 'medium' as const,
        recommendation: `Create comprehensive content around "${topCluster.name}" cluster with ${topCluster.size} related keywords`,
        impact: 'Improved topical authority',
        effort: 'High'
      });
    }

    // Recomendaciones basadas en tendencias
    if (analysisData.trends && analysisData.trends.length > 0) {
      const risingTrends = analysisData.trends.filter(t => t.forecast.predicted > t.data[t.data.length - 1]?.volume);
      if (risingTrends.length > 0) {
        recommendations.push({
          category: 'Trending Opportunities',
          priority: 'medium' as const,
          recommendation: `Capitalize on ${risingTrends.length} keywords showing upward trends`,
          impact: 'Future traffic growth',
          effort: 'Medium'
        });
      }
    }

    // Recomendaciones técnicas
    recommendations.push({
      category: 'Technical SEO',
      priority: 'medium' as const,
      recommendation: 'Optimize page speed and mobile experience for better rankings',
      impact: 'Improved user experience and rankings',
      effort: 'Medium'
    });

    recommendations.push({
      category: 'Content Optimization',
      priority: 'low' as const,
      recommendation: 'Update existing content to target additional related keywords',
      impact: 'Increased keyword coverage',
      effort: 'Low'
    });

    return recommendations;
  }

  /**
   * Genera reporte PDF
   */
  private async generatePDFReport(data: ReportData, options: ReportOptions): Promise<Blob> {
    const pdfOptions: PdfOptions = {
      includeCharts: options.charts !== false,
      includeTables: options.sections?.keywords !== false,
      includeAnalysis: options.sections?.summary !== false,
      colorScheme: options.branding?.colorScheme || 'blue',
      logoUrl: options.branding?.logoUrl,
      companyName: options.branding?.companyName
    };

    return await this.pdfGenerator.generateReport(data, pdfOptions);
  }

  /**
   * Genera reporte Excel
   */
  private generateExcelReport(data: ExcelReportData, options: ReportOptions): Blob {
    const excelOptions: ExcelOptions = {
      includeCharts: options.charts !== false,
      includeFormatting: options.formatting !== false,
      separateSheets: true,
      includeFormulas: true
    };

    return this.excelGenerator.generateReport(data, excelOptions);
  }

  /**
   * Genera reporte CSV
   */
  private generateCSVReport(data: any, options: ReportOptions): Blob {
    const csvData = [
      ['Keyword', 'Volume', 'Difficulty', 'CPC', 'Competition', 'Intent', 'Trend', 'Opportunity'],
      ...data.keywords.map((k: any) => [
        k.keyword,
        k.volume,
        k.difficulty,
        k.cpc,
        k.competition,
        k.intent,
        k.trend,
        k.opportunity
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Genera reporte JSON
   */
  private generateJSONReport(data: any, options: ReportOptions): Blob {
    const jsonContent = JSON.stringify(data, null, 2);
    return new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  }

  /**
   * Genera nombre de archivo
   */
  private generateFilename(title: string, extension: string): string {
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    return `${sanitizedTitle}_${timestamp}.${extension}`;
  }

  /**
   * Obtiene secciones incluidas
   */
  private getIncludedSections(sections: any): string[] {
    const included = [];
    
    if (sections.summary !== false) included.push('summary');
    if (sections.keywords !== false) included.push('keywords');
    if (sections.clusters) included.push('clusters');
    if (sections.trends) included.push('trends');
    if (sections.competitors) included.push('competitors');
    if (sections.serp) included.push('serp');
    if (sections.recommendations !== false) included.push('recommendations');
    
    return included;
  }

  /**
   * Genera datos históricos simulados
   */
  private generateHistoricalData(keyword: any) {
    const data = [];
    const baseVolume = keyword.volume;
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const seasonalMultiplier = 0.8 + Math.random() * 0.4;
      const trendMultiplier = 0.9 + Math.random() * 0.2;
      const volume = Math.floor(baseVolume * seasonalMultiplier * trendMultiplier);

      data.push({
        date: date.toISOString().split('T')[0],
        volume: Math.max(volume, 0)
      });
    }

    return data;
  }

  /**
   * Genera múltiples formatos de reporte
   */
  async generateMultipleReports(
    request: ReportRequest, 
    formats: ('pdf' | 'excel' | 'csv' | 'json')[]
  ): Promise<GeneratedReport[]> {
    const reports = [];

    for (const format of formats) {
      const options: ReportOptions = {
        format,
        template: 'standard',
        sections: {
          summary: true,
          keywords: true,
          clusters: request.includeClusters,
          trends: request.includeTrends,
          competitors: request.includeCompetitors,
          serp: request.includeSerpAnalysis,
          recommendations: true
        },
        charts: format === 'pdf',
        formatting: true
      };

      const report = await this.generateReport(request, options);
      reports.push(report);
    }

    return reports;
  }

  /**
   * Obtiene plantillas disponibles
   */
  getAvailableTemplates() {
    return [
      {
        id: 'standard',
        name: 'Standard Report',
        description: 'Complete keyword analysis with all sections',
        sections: ['summary', 'keywords', 'clusters', 'trends', 'recommendations']
      },
      {
        id: 'executive',
        name: 'Executive Summary',
        description: 'High-level overview for executives',
        sections: ['summary', 'recommendations']
      },
      {
        id: 'detailed',
        name: 'Detailed Analysis',
        description: 'In-depth analysis with all available data',
        sections: ['summary', 'keywords', 'clusters', 'trends', 'competitors', 'serp', 'recommendations']
      },
      {
        id: 'competitive',
        name: 'Competitive Analysis',
        description: 'Focus on competitor insights and opportunities',
        sections: ['summary', 'keywords', 'competitors', 'recommendations']
      }
    ];
  }
}

export default ReportService;
export type { ReportRequest, ReportOptions, GeneratedReport };