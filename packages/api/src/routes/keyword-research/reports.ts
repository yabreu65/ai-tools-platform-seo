import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Schema de validación para generación de reportes
const reportGenerationSchema = z.object({
  template_type: z.enum(['keyword_overview', 'competitor_analysis', 'trend_analysis', 'serp_analysis', 'custom']),
  report_title: z.string().min(1, 'Título del reporte es requerido').max(100, 'Título muy largo'),
  date_range: z.enum(['7d', '30d', '90d', '6m', '1y']),
  keywords: z.array(z.string()).min(1, 'Al menos una keyword es requerida').max(100, 'Máximo 100 keywords'),
  competitors: z.array(z.string().url()).max(10, 'Máximo 10 competidores').default([]),
  location: z.string().default('United States'),
  language: z.string().default('en'),
  content_sections: z.object({
    executive_summary: z.boolean().default(true),
    keyword_performance: z.boolean().default(true),
    competitor_analysis: z.boolean().default(true),
    trend_analysis: z.boolean().default(true),
    serp_features: z.boolean().default(true),
    recommendations: z.boolean().default(true),
    detailed_data: z.boolean().default(false)
  }).default({}),
  format: z.enum(['pdf', 'excel', 'csv', 'json']).default('pdf'),
  branding: z.object({
    company_name: z.string().optional(),
    logo_url: z.string().url().optional(),
    brand_colors: z.object({
      primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
    }).optional()
  }).default({}),
  delivery_options: z.object({
    email_recipients: z.array(z.string().email()).max(10, 'Máximo 10 destinatarios').default([]),
    schedule_delivery: z.boolean().default(false),
    delivery_frequency: z.enum(['once', 'weekly', 'monthly']).default('once')
  }).default({})
});

// Schema para obtener historial de reportes
const reportHistorySchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  template_type: z.enum(['keyword_overview', 'competitor_analysis', 'trend_analysis', 'serp_analysis', 'custom']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional()
});

interface ReportSection {
  section_id: string;
  title: string;
  content_type: 'text' | 'table' | 'chart' | 'metrics';
  data: any;
  insights: string[];
}

interface KeywordPerformanceData {
  keyword: string;
  current_position: number | null;
  position_change: number;
  search_volume: number;
  difficulty: number;
  cpc: number;
  traffic_potential: number;
  serp_features: string[];
}

interface CompetitorAnalysisData {
  competitor: string;
  domain: string;
  visibility_score: number;
  avg_position: number;
  keywords_ranking: number;
  estimated_traffic: number;
  top_keywords: {
    keyword: string;
    position: number;
    volume: number;
  }[];
  content_gaps: string[];
}

interface TrendAnalysisData {
  keyword: string;
  trend_direction: 'up' | 'down' | 'stable';
  seasonality_score: number;
  peak_months: string[];
  growth_rate: number;
  forecast_data: {
    month: string;
    predicted_volume: number;
    confidence: number;
  }[];
}

interface GeneratedReport {
  report_id: string;
  title: string;
  template_type: string;
  generated_date: string;
  date_range: string;
  keywords_analyzed: number;
  competitors_analyzed: number;
  format: string;
  file_size: string;
  download_url: string;
  status: 'generating' | 'completed' | 'failed';
  sections: ReportSection[];
  executive_summary: {
    key_findings: string[];
    recommendations: string[];
    performance_score: number;
    trend_summary: string;
  };
  metadata: {
    generation_time: number;
    data_sources: string[];
    location: string;
    language: string;
    total_pages: number;
  };
}

// Función para generar datos de rendimiento de keywords
const generateKeywordPerformanceData = (keywords: string[]): KeywordPerformanceData[] => {
  return keywords.map(keyword => {
    const currentPosition = Math.random() > 0.1 ? Math.floor(Math.random() * 50) + 1 : null;
    const positionChange = Math.floor(Math.random() * 21) - 10; // -10 a +10
    const searchVolume = Math.floor(Math.random() * 50000) + 100;
    const difficulty = Math.floor(Math.random() * 100) + 1;
    const cpc = Math.round((Math.random() * 10 + 0.1) * 100) / 100;
    
    // SERP features más probables para posiciones altas
    const serpFeatures = [];
    if (currentPosition && currentPosition <= 3 && Math.random() > 0.6) serpFeatures.push('featured_snippet');
    if (currentPosition && currentPosition <= 5 && Math.random() > 0.7) serpFeatures.push('sitelinks');
    if (Math.random() > 0.8) serpFeatures.push('images');
    if (Math.random() > 0.9) serpFeatures.push('videos');
    
    return {
      keyword,
      current_position: currentPosition,
      position_change: positionChange,
      search_volume: searchVolume,
      difficulty,
      cpc,
      traffic_potential: currentPosition ? Math.round(searchVolume * (currentPosition <= 10 ? 0.1 : 0.01)) : 0,
      serp_features: serpFeatures
    };
  });
};

// Función para generar análisis de competidores
const generateCompetitorAnalysisData = (competitors: string[], keywords: string[]): CompetitorAnalysisData[] => {
  return competitors.map(competitor => {
    const domain = new URL(competitor).hostname;
    const keywordsRanking = Math.floor(Math.random() * keywords.length * 0.8) + 1;
    const avgPosition = Math.round((Math.random() * 20 + 5) * 10) / 10;
    const visibilityScore = Math.round((keywordsRanking / keywords.length) * 100);
    
    // Top keywords del competidor
    const topKeywords = keywords.slice(0, 5).map(keyword => ({
      keyword,
      position: Math.floor(Math.random() * 10) + 1,
      volume: Math.floor(Math.random() * 20000) + 1000
    }));
    
    // Content gaps identificados
    const contentGaps = [
      'Falta contenido sobre long-tail keywords',
      'Oportunidad en featured snippets',
      'Contenido técnico insuficiente',
      'Falta optimización para búsquedas locales',
      'Contenido de video limitado'
    ].slice(0, Math.floor(Math.random() * 3) + 1);
    
    return {
      competitor,
      domain,
      visibility_score: visibilityScore,
      avg_position: avgPosition,
      keywords_ranking: keywordsRanking,
      estimated_traffic: Math.floor(Math.random() * 100000) + 10000,
      top_keywords: topKeywords,
      content_gaps: contentGaps
    };
  });
};

// Función para generar análisis de tendencias
const generateTrendAnalysisData = (keywords: string[]): TrendAnalysisData[] => {
  return keywords.map(keyword => {
    const trendType = Math.random();
    const trendDirection: 'up' | 'down' | 'stable' = 
      trendType < 0.4 ? 'up' : trendType < 0.7 ? 'down' : 'stable';
    
    const seasonalityScore = Math.floor(Math.random() * 100);
    const growthRate = trendDirection === 'up' ? Math.random() * 50 + 5 :
                     trendDirection === 'down' ? -(Math.random() * 30 + 5) :
                     Math.random() * 10 - 5;
    
    // Meses pico (simulados)
    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const peakMonths = allMonths.slice(0, Math.floor(Math.random() * 4) + 1);
    
    // Datos de pronóstico para los próximos 6 meses
    const forecastData = [];
    const baseVolume = Math.floor(Math.random() * 20000) + 1000;
    
    for (let i = 1; i <= 6; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const seasonalMultiplier = peakMonths.includes(month.toLocaleDateString('en-US', { month: 'short' })) ? 1.3 : 1;
      const trendMultiplier = 1 + (growthRate / 100) * i;
      const predictedVolume = Math.round(baseVolume * seasonalMultiplier * trendMultiplier);
      
      forecastData.push({
        month: monthName,
        predicted_volume: predictedVolume,
        confidence: Math.round((90 - i * 5) + Math.random() * 10) // Confianza decrece con el tiempo
      });
    }
    
    return {
      keyword,
      trend_direction: trendDirection,
      seasonality_score: seasonalityScore,
      peak_months: peakMonths,
      growth_rate: Math.round(growthRate * 10) / 10,
      forecast_data: forecastData
    };
  });
};

// Función para generar secciones del reporte
const generateReportSections = (
  templateType: string,
  keywordData: KeywordPerformanceData[],
  competitorData: CompetitorAnalysisData[],
  trendData: TrendAnalysisData[],
  contentSections: any
): ReportSection[] => {
  const sections: ReportSection[] = [];
  
  // Executive Summary
  if (contentSections.executive_summary) {
    sections.push({
      section_id: 'executive_summary',
      title: 'Resumen Ejecutivo',
      content_type: 'text',
      data: {
        total_keywords: keywordData.length,
        avg_position: Math.round(keywordData.reduce((sum, kw) => sum + (kw.current_position || 100), 0) / keywordData.length),
        keywords_in_top_10: keywordData.filter(kw => kw.current_position && kw.current_position <= 10).length,
        total_traffic_potential: keywordData.reduce((sum, kw) => sum + kw.traffic_potential, 0),
        performance_score: Math.round(Math.random() * 40 + 60) // 60-100
      },
      insights: [
        `Se analizaron ${keywordData.length} keywords con un potencial de tráfico total de ${keywordData.reduce((sum, kw) => sum + kw.traffic_potential, 0).toLocaleString()} visitas mensuales`,
        `${keywordData.filter(kw => kw.position_change > 0).length} keywords mejoraron su posición en el período analizado`,
        `Se identificaron ${keywordData.filter(kw => kw.serp_features.length > 0).length} oportunidades de SERP features`,
        competitorData.length > 0 ? `El competidor principal tiene una visibilidad promedio del ${Math.round(competitorData.reduce((sum, comp) => sum + comp.visibility_score, 0) / competitorData.length)}%` : 'No se analizaron competidores'
      ]
    });
  }
  
  // Keyword Performance
  if (contentSections.keyword_performance) {
    sections.push({
      section_id: 'keyword_performance',
      title: 'Rendimiento de Keywords',
      content_type: 'table',
      data: {
        headers: ['Keyword', 'Posición', 'Cambio', 'Volumen', 'Dificultad', 'CPC', 'Tráfico Potencial'],
        rows: keywordData.map(kw => [
          kw.keyword,
          kw.current_position || 'No ranking',
          kw.position_change > 0 ? `+${kw.position_change}` : kw.position_change.toString(),
          kw.search_volume.toLocaleString(),
          `${kw.difficulty}%`,
          `$${kw.cpc}`,
          kw.traffic_potential.toLocaleString()
        ])
      },
      insights: [
        `Keyword con mejor rendimiento: "${keywordData.sort((a, b) => (a.current_position || 100) - (b.current_position || 100))[0]?.keyword}"`,
        `Mayor oportunidad de tráfico: "${keywordData.sort((a, b) => b.traffic_potential - a.traffic_potential)[0]?.keyword}"`,
        `${keywordData.filter(kw => kw.difficulty < 30).length} keywords de baja dificultad identificadas`
      ]
    });
  }
  
  // Competitor Analysis
  if (contentSections.competitor_analysis && competitorData.length > 0) {
    sections.push({
      section_id: 'competitor_analysis',
      title: 'Análisis de Competidores',
      content_type: 'table',
      data: {
        headers: ['Competidor', 'Visibilidad', 'Posición Promedio', 'Keywords Ranking', 'Tráfico Estimado'],
        rows: competitorData.map(comp => [
          comp.domain,
          `${comp.visibility_score}%`,
          comp.avg_position.toString(),
          comp.keywords_ranking.toString(),
          comp.estimated_traffic.toLocaleString()
        ])
      },
      insights: [
        `Competidor líder: ${competitorData.sort((a, b) => b.visibility_score - a.visibility_score)[0]?.domain}`,
        `Se identificaron ${competitorData.reduce((sum, comp) => sum + comp.content_gaps.length, 0)} oportunidades de contenido`,
        `Brecha promedio de posición: ${Math.round(competitorData.reduce((sum, comp) => sum + comp.avg_position, 0) / competitorData.length)} posiciones`
      ]
    });
  }
  
  // Trend Analysis
  if (contentSections.trend_analysis) {
    sections.push({
      section_id: 'trend_analysis',
      title: 'Análisis de Tendencias',
      content_type: 'chart',
      data: {
        chart_type: 'line',
        datasets: trendData.map(trend => ({
          label: trend.keyword,
          data: trend.forecast_data.map(f => f.predicted_volume),
          trend: trend.trend_direction
        })),
        labels: trendData[0]?.forecast_data.map(f => f.month) || []
      },
      insights: [
        `${trendData.filter(t => t.trend_direction === 'up').length} keywords muestran tendencia creciente`,
        `Estacionalidad alta detectada en ${trendData.filter(t => t.seasonality_score > 70).length} keywords`,
        `Crecimiento promedio proyectado: ${Math.round(trendData.reduce((sum, t) => sum + t.growth_rate, 0) / trendData.length)}%`
      ]
    });
  }
  
  // SERP Features
  if (contentSections.serp_features) {
    const allFeatures = keywordData.flatMap(kw => kw.serp_features);
    const featureCounts = allFeatures.reduce((acc, feature) => {
      acc[feature] = (acc[feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    sections.push({
      section_id: 'serp_features',
      title: 'SERP Features',
      content_type: 'chart',
      data: {
        chart_type: 'pie',
        labels: Object.keys(featureCounts),
        values: Object.values(featureCounts)
      },
      insights: [
        `${Object.keys(featureCounts).length} tipos diferentes de SERP features detectadas`,
        `Feature más común: ${Object.entries(featureCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Ninguna'}`,
        `${keywordData.filter(kw => kw.serp_features.includes('featured_snippet')).length} oportunidades de featured snippet`
      ]
    });
  }
  
  return sections;
};

// POST /api/keyword-research/reports/generate
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = reportGenerationSchema.parse(req.body);
    
    const {
      template_type,
      report_title,
      date_range,
      keywords,
      competitors,
      location,
      language,
      content_sections,
      format,
      branding,
      delivery_options
    } = validatedData;

    // Simular tiempo de generación del reporte
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));

    // Generar ID del reporte
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generar datos para el reporte
    const keywordData = generateKeywordPerformanceData(keywords);
    const competitorData = generateCompetitorAnalysisData(competitors, keywords);
    const trendData = generateTrendAnalysisData(keywords);
    
    // Generar secciones del reporte
    const sections = generateReportSections(
      template_type,
      keywordData,
      competitorData,
      trendData,
      content_sections
    );
    
    // Generar resumen ejecutivo
    const executiveSummary = {
      key_findings: [
        `Se analizaron ${keywords.length} keywords con un rendimiento promedio de posición ${Math.round(keywordData.reduce((sum, kw) => sum + (kw.current_position || 100), 0) / keywordData.length)}`,
        `${keywordData.filter(kw => kw.position_change > 0).length} keywords mejoraron su posición`,
        `Potencial de tráfico total identificado: ${keywordData.reduce((sum, kw) => sum + kw.traffic_potential, 0).toLocaleString()} visitas mensuales`,
        competitors.length > 0 ? `Análisis de ${competitors.length} competidores principales completado` : 'Análisis enfocado en rendimiento propio'
      ],
      recommendations: [
        'Optimizar contenido para keywords de baja dificultad con alto volumen',
        'Implementar estrategia de featured snippets para keywords identificadas',
        'Mejorar contenido técnico basado en análisis de competidores',
        'Aprovechar tendencias estacionales para planificación de contenido',
        'Monitorear cambios en SERP features regularmente'
      ],
      performance_score: Math.round(
        (keywordData.filter(kw => kw.current_position && kw.current_position <= 10).length / keywords.length) * 100
      ),
      trend_summary: trendData.filter(t => t.trend_direction === 'up').length > trendData.length / 2 ? 
        'Tendencias generalmente positivas' : 'Tendencias mixtas con oportunidades de mejora'
    };
    
    // Calcular metadatos
    const totalPages = Math.ceil(sections.length * 2.5); // Estimación
    const fileSize = format === 'pdf' ? `${Math.round(totalPages * 0.5 + Math.random() * 2)}MB` :
                    format === 'excel' ? `${Math.round(keywords.length * 0.1 + Math.random())}MB` :
                    `${Math.round(keywords.length * 0.05 + Math.random() * 0.5)}MB`;
    
    const report: GeneratedReport = {
      report_id: reportId,
      title: report_title,
      template_type,
      generated_date: new Date().toISOString(),
      date_range,
      keywords_analyzed: keywords.length,
      competitors_analyzed: competitors.length,
      format,
      file_size: fileSize,
      download_url: `/api/reports/download/${reportId}`,
      status: 'completed',
      sections,
      executive_summary: executiveSummary,
      metadata: {
        generation_time: Math.round(3000 + Math.random() * 5000), // ms
        data_sources: ['Google Search Console', 'SEMrush API', 'Ahrefs API', 'Internal Database'],
        location,
        language,
        total_pages: totalPages
      }
    };

    // Simular envío por email si está configurado
    if (delivery_options.email_recipients.length > 0) {
      // En una implementación real, aquí se enviaría el email
      console.log(`Reporte enviado a: ${delivery_options.email_recipients.join(', ')}`);
    }

    res.json({
      success: true,
      data: {
        report,
        generation_summary: {
          report_id: reportId,
          template_used: template_type,
          sections_generated: sections.length,
          total_insights: sections.reduce((sum, section) => sum + section.insights.length, 0),
          file_format: format,
          estimated_size: fileSize,
          delivery_method: delivery_options.email_recipients.length > 0 ? 'email' : 'download'
        }
      },
      message: `Reporte "${report_title}" generado exitosamente`
    });

  } catch (error) {
    console.error('Error generando reporte:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: error.errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/keyword-research/reports/history
router.post('/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = reportHistorySchema.parse(req.body);
    
    const { limit, offset, template_type, date_from, date_to } = validatedData;

    // Simular tiempo de consulta
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Generar historial de reportes de ejemplo
    const reportHistory = [];
    const templates = ['keyword_overview', 'competitor_analysis', 'trend_analysis', 'serp_analysis', 'custom'];
    const statuses = ['completed', 'completed', 'completed', 'failed', 'generating'];
    
    for (let i = 0; i < Math.min(limit, 20); i++) {
      const daysAgo = Math.floor(Math.random() * 90) + 1;
      const generatedDate = new Date();
      generatedDate.setDate(generatedDate.getDate() - daysAgo);
      
      const template = template_type || templates[Math.floor(Math.random() * templates.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      reportHistory.push({
        report_id: `report_${i + 1}_${Math.random().toString(36).substr(2, 9)}`,
        title: `${template.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Report ${i + 1}`,
        template_type: template,
        generated_date: generatedDate.toISOString(),
        status,
        keywords_analyzed: Math.floor(Math.random() * 50) + 10,
        competitors_analyzed: Math.floor(Math.random() * 5),
        format: ['pdf', 'excel', 'csv'][Math.floor(Math.random() * 3)],
        file_size: `${Math.round(Math.random() * 5 + 1)}MB`,
        download_url: status === 'completed' ? `/api/reports/download/report_${i + 1}` : null,
        created_by: 'user@example.com',
        download_count: status === 'completed' ? Math.floor(Math.random() * 10) : 0
      });
    }
    
    // Filtrar por fechas si se especifican
    let filteredReports = reportHistory;
    if (date_from) {
      filteredReports = filteredReports.filter(r => r.generated_date >= date_from);
    }
    if (date_to) {
      filteredReports = filteredReports.filter(r => r.generated_date <= date_to);
    }
    
    // Aplicar paginación
    const paginatedReports = filteredReports.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: {
        reports: paginatedReports,
        pagination: {
          total: filteredReports.length,
          limit,
          offset,
          has_more: offset + limit < filteredReports.length
        },
        summary: {
          total_reports: filteredReports.length,
          completed_reports: filteredReports.filter(r => r.status === 'completed').length,
          failed_reports: filteredReports.filter(r => r.status === 'failed').length,
          total_keywords_analyzed: filteredReports.reduce((sum, r) => sum + r.keywords_analyzed, 0),
          most_used_template: templates[Math.floor(Math.random() * templates.length)]
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo historial de reportes:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Parámetros de consulta inválidos',
        details: error.errors
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/keyword-research/reports/templates
router.get('/templates', async (req, res) => {
  try {
    // Simular tiempo de consulta
    await new Promise(resolve => setTimeout(resolve, 300));

    const templates = [
      {
        template_id: 'keyword_overview',
        name: 'Resumen de Keywords',
        description: 'Análisis completo del rendimiento de keywords con métricas clave y recomendaciones',
        sections: ['executive_summary', 'keyword_performance', 'serp_features', 'recommendations'],
        estimated_pages: 8,
        best_for: ['Reportes mensuales', 'Análisis de rendimiento general', 'Presentaciones ejecutivas']
      },
      {
        template_id: 'competitor_analysis',
        name: 'Análisis de Competidores',
        description: 'Comparación detallada con competidores y identificación de oportunidades',
        sections: ['executive_summary', 'competitor_analysis', 'content_gaps', 'recommendations'],
        estimated_pages: 12,
        best_for: ['Análisis competitivo', 'Estrategia de contenido', 'Identificación de oportunidades']
      },
      {
        template_id: 'trend_analysis',
        name: 'Análisis de Tendencias',
        description: 'Análisis temporal de keywords con predicciones y estacionalidad',
        sections: ['executive_summary', 'trend_analysis', 'seasonality', 'forecasting', 'recommendations'],
        estimated_pages: 10,
        best_for: ['Planificación de contenido', 'Análisis estacional', 'Predicciones de tráfico']
      },
      {
        template_id: 'serp_analysis',
        name: 'Análisis SERP',
        description: 'Análisis detallado de características SERP y oportunidades de optimización',
        sections: ['executive_summary', 'serp_features', 'competitor_serp', 'opportunities', 'recommendations'],
        estimated_pages: 15,
        best_for: ['Optimización SERP', 'Featured snippets', 'Análisis de características']
      },
      {
        template_id: 'custom',
        name: 'Reporte Personalizado',
        description: 'Reporte completamente personalizable con secciones seleccionables',
        sections: ['customizable'],
        estimated_pages: 'Variable',
        best_for: ['Necesidades específicas', 'Reportes ad-hoc', 'Análisis personalizados']
      }
    ];

    res.json({
      success: true,
      data: {
        templates,
        total_templates: templates.length,
        supported_formats: ['pdf', 'excel', 'csv', 'json'],
        max_keywords_per_report: 100,
        max_competitors_per_report: 10
      }
    });

  } catch (error) {
    console.error('Error obteniendo templates:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;