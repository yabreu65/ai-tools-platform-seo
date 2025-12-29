import { jsPDF } from 'jspdf';

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json';
  template?: 'professional' | 'minimal' | 'detailed';
  includeBranding?: boolean;
  includeCharts?: boolean;
  customBranding?: {
    logo?: string;
    companyName?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
}

export interface ExportData {
  toolType: string;
  title: string;
  data: any;
  metadata: {
    generatedAt: string;
    userPlan: string;
    analysisDate?: string;
  };
}

export class ExportService {
  private static instance: ExportService;

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  async exportToPDF(data: ExportData, options: ExportOptions, userPlan: string): Promise<Blob> {
    const doc = new jsPDF();
    
    // Configurar documento
    this.setupDocument(doc, options, userPlan);
    
    // Agregar contenido según el tipo de herramienta
    await this.addContent(doc, data, options, userPlan);
    
    // Convertir a blob
    return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  }

  async exportToCSV(data: ExportData, userPlan: string): Promise<Blob> {
    const csvContent = this.generateCSVContent(data, userPlan);
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  async exportToJSON(data: ExportData, userPlan: string): Promise<Blob> {
    const exportData = {
      ...data,
      exportInfo: {
        format: 'json',
        exportedAt: new Date().toISOString(),
        userPlan: userPlan
      }
    };

    // Limitar datos para plan free
    if (userPlan === 'free') {
      exportData.data = this.limitDataForFreePlan(exportData.data, data.toolType);
    }

    const jsonContent = JSON.stringify(exportData, null, 2);
    return new Blob([jsonContent], { type: 'application/json' });
  }

  private setupDocument(doc: jsPDF, options: ExportOptions, userPlan: string): void {
    // Configurar fuentes y estilos base
    doc.setFont('helvetica');
    
    // Agregar marca de agua para trial
    if (userPlan === 'trial') {
      this.addWatermark(doc);
    }
  }

  private async addContent(doc: jsPDF, data: ExportData, options: ExportOptions, userPlan: string): Promise<void> {
    let yPosition = 20;
    
    // Header profesional
    yPosition = this.addHeader(doc, data.title, yPosition, options, userPlan);
    
    // Contenido específico por herramienta
    switch (data.toolType) {
      case 'title-generator':
        yPosition = this.addTitleGeneratorContent(doc, data.data, yPosition, userPlan);
        break;
      case 'keyword-research':
        yPosition = this.addKeywordResearchContent(doc, data.data, yPosition, userPlan);
        break;
      case 'seo-audit':
        yPosition = this.addSEOAuditContent(doc, data.data, yPosition, userPlan);
        break;
      case 'core-vitals':
        yPosition = this.addCoreVitalsContent(doc, data.data, yPosition, userPlan);
        break;
      case 'content-optimizer':
        yPosition = this.addContentOptimizerContent(doc, data.data, yPosition, userPlan);
        break;
      case 'duplicate-detector':
        yPosition = this.addDuplicateDetectorContent(doc, data.data, yPosition, userPlan);
        break;
    }

    // Footer
    this.addFooter(doc, data.metadata, userPlan);
  }

  private addHeader(doc: jsPDF, title: string, yPosition: number, options: ExportOptions, userPlan: string): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Fondo del header
    if (options.includeBranding && (userPlan === 'premium' || userPlan === 'trial')) {
      const primaryColor = options.customBranding?.colors?.primary || '#3B82F6';
      const rgb = this.hexToRgb(primaryColor);
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
    } else {
      doc.setFillColor(59, 130, 246); // Blue-500 por defecto
    }
    
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Logo personalizado (solo Premium)
    if (userPlan === 'premium' && options.customBranding?.logo) {
      // Aquí se agregaría la lógica para insertar logo personalizado
      // doc.addImage(options.customBranding.logo, 'PNG', 10, 5, 30, 30);
    }

    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 25);

    // Fecha y hora
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES');
    const timeStr = now.toLocaleTimeString('es-ES');
    doc.text(`${dateStr} - ${timeStr}`, pageWidth - 80, 25);

    // Badge del plan
    if (userPlan === 'premium') {
      doc.setFillColor(34, 197, 94); // Green-500
      doc.rect(pageWidth - 80, 5, 60, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('PREMIUM', pageWidth - 65, 15);
    }

    // Reset color
    doc.setTextColor(0, 0, 0);
    
    return 60;
  }

  private addTitleGeneratorContent(doc: jsPDF, data: any, yPosition: number, userPlan: string): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Resumen ejecutivo
    yPosition = this.addSection(doc, 'Resumen Ejecutivo', yPosition, margin);
    
    const summary = `Se generaron ${data.titles?.length || 0} títulos SEO optimizados. Cada título está diseñado para maximizar el CTR y mejorar el posicionamiento en buscadores.`;
    yPosition = this.addParagraph(doc, summary, yPosition, margin, pageWidth);

    // Estadísticas
    if (data.titles && data.titles.length > 0) {
      yPosition = this.addSection(doc, 'Estadísticas', yPosition, margin);
      
      const avgLength = data.titles.reduce((acc: number, title: string) => acc + title.length, 0) / data.titles.length;
      const stats = [
        ['Total de títulos generados', data.titles.length.toString()],
        ['Longitud promedio', `${Math.round(avgLength)} caracteres`],
        ['Palabras clave objetivo', data.keywords || 'N/A'],
        ['Tono utilizado', data.tone || 'Profesional']
      ];
      
      yPosition = this.addTable(doc, stats, yPosition, margin, pageWidth);
    }

    // Títulos generados
    if (data.titles && data.titles.length > 0) {
      yPosition = this.addSection(doc, 'Títulos SEO Generados', yPosition, margin);
      
      data.titles.forEach((title: string, index: number) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
          if (userPlan === 'trial') {
            this.addWatermark(doc);
          }
        }

        // Número y título
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}.`, margin, yPosition);
        
        doc.setFont('helvetica', 'normal');
        const titleLines = doc.splitTextToSize(title, pageWidth - 2 * margin - 15);
        doc.text(titleLines, margin + 15, yPosition);
        
        // Métricas del título
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Longitud: ${title.length} caracteres`, margin + 15, yPosition + titleLines.length * 6 + 5);
        doc.setTextColor(0, 0, 0);
        
        yPosition += titleLines.length * 6 + 15;
      });
    }

    // Recomendaciones (solo Premium)
    if (userPlan === 'premium' || userPlan === 'trial') {
      yPosition = this.addRecommendations(doc, yPosition, margin, pageWidth, [
        'Prueba A/B testing con los títulos de mejor rendimiento',
        'Monitorea el CTR en Google Search Console',
        'Actualiza títulos basándote en tendencias estacionales',
        'Considera la intención de búsqueda del usuario'
      ]);
    }

    return yPosition;
  }

  private addKeywordResearchContent(doc: jsPDF, data: any, yPosition: number, userPlan: string): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Resumen ejecutivo
    yPosition = this.addSection(doc, 'Resumen Ejecutivo', yPosition, margin);
    
    const totalKeywords = data.keywords?.length || 0;
    const avgVolume = data.keywords?.reduce((acc: number, kw: any) => acc + (kw.volume || 0), 0) / totalKeywords || 0;
    const avgDifficulty = data.keywords?.reduce((acc: number, kw: any) => acc + (kw.difficulty || 0), 0) / totalKeywords || 0;

    const summary = `Análisis de ${totalKeywords} palabras clave con un volumen promedio de ${Math.round(avgVolume)} búsquedas mensuales y dificultad promedio de ${Math.round(avgDifficulty)}/100.`;
    yPosition = this.addParagraph(doc, summary, yPosition, margin, pageWidth);

    // Métricas principales
    yPosition = this.addSection(doc, 'Métricas Principales', yPosition, margin);
    
    const metrics = [
      ['Total de palabras clave', totalKeywords.toString()],
      ['Volumen promedio mensual', Math.round(avgVolume).toLocaleString()],
      ['Dificultad promedio', `${Math.round(avgDifficulty)}/100`],
      ['Oportunidades de alto volumen', data.highVolumeCount?.toString() || '0']
    ];
    
    yPosition = this.addTable(doc, metrics, yPosition, margin, pageWidth);

    // Tabla de palabras clave
    if (data.keywords && data.keywords.length > 0) {
      yPosition = this.addSection(doc, 'Análisis de Palabras Clave', yPosition, margin);
      
      // Limitar según plan
      const maxKeywords = userPlan === 'free' ? 5 : data.keywords.length;
      const displayKeywords = data.keywords.slice(0, maxKeywords);
      
      yPosition = this.addKeywordTable(doc, displayKeywords, yPosition, margin, pageWidth);
      
      if (userPlan === 'free' && data.keywords.length > 5) {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Mostrando ${maxKeywords} de ${data.keywords.length} palabras clave. Actualiza a Premium para ver todas.`, margin, yPosition + 10);
        doc.setTextColor(0, 0, 0);
        yPosition += 20;
      }
    }

    return yPosition;
  }

  private addSEOAuditContent(doc: jsPDF, data: any, yPosition: number, userPlan: string): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Puntuación general
    if (data.overallScore !== undefined) {
      yPosition = this.addScoreCircle(doc, data.overallScore, yPosition, pageWidth, 'Puntuación SEO General');
    }

    // Resumen de problemas
    if (data.issues && data.issues.length > 0) {
      yPosition = this.addSection(doc, 'Resumen de Problemas', yPosition, margin);
      
      const highPriority = data.issues.filter((issue: any) => issue.priority === 'high').length;
      const mediumPriority = data.issues.filter((issue: any) => issue.priority === 'medium').length;
      const lowPriority = data.issues.filter((issue: any) => issue.priority === 'low').length;
      
      const problemSummary = [
        ['Problemas de alta prioridad', highPriority.toString()],
        ['Problemas de prioridad media', mediumPriority.toString()],
        ['Problemas de baja prioridad', lowPriority.toString()],
        ['Total de problemas', data.issues.length.toString()]
      ];
      
      yPosition = this.addTable(doc, problemSummary, yPosition, margin, pageWidth);
    }

    // Lista detallada de problemas
    if (data.issues && data.issues.length > 0) {
      yPosition = this.addSection(doc, 'Problemas Identificados', yPosition, margin);
      
      // Limitar según plan
      const maxIssues = userPlan === 'free' ? 3 : data.issues.length;
      const displayIssues = data.issues.slice(0, maxIssues);
      
      displayIssues.forEach((issue: any, index: number) => {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = margin;
          if (userPlan === 'trial') {
            this.addWatermark(doc);
          }
        }
        
        yPosition = this.addIssueItem(doc, issue, yPosition, margin, pageWidth, index + 1);
      });
      
      if (userPlan === 'free' && data.issues.length > 3) {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Mostrando ${maxIssues} de ${data.issues.length} problemas. Actualiza a Premium para ver todos.`, margin, yPosition + 10);
        doc.setTextColor(0, 0, 0);
        yPosition += 20;
      }
    }

    return yPosition;
  }

  private addCoreVitalsContent(doc: jsPDF, data: any, yPosition: number, userPlan: string): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Resumen ejecutivo
    yPosition = this.addSection(doc, 'Resumen de Core Web Vitals', yPosition, margin);
    
    const summary = 'Análisis de las métricas principales de experiencia de usuario según los estándares de Google Core Web Vitals.';
    yPosition = this.addParagraph(doc, summary, yPosition, margin, pageWidth);

    // Métricas principales
    if (data.metrics) {
      yPosition = this.addSection(doc, 'Métricas Principales', yPosition, margin);
      
      const vitalsData = [
        ['Largest Contentful Paint (LCP)', `${data.metrics.lcp || 0}s`, this.getVitalStatus(data.metrics.lcp, 'lcp')],
        ['First Input Delay (FID)', `${data.metrics.fid || 0}ms`, this.getVitalStatus(data.metrics.fid, 'fid')],
        ['Cumulative Layout Shift (CLS)', `${data.metrics.cls || 0}`, this.getVitalStatus(data.metrics.cls, 'cls')],
        ['First Contentful Paint (FCP)', `${data.metrics.fcp || 0}s`, this.getVitalStatus(data.metrics.fcp, 'fcp')]
      ];
      
      yPosition = this.addVitalsTable(doc, vitalsData, yPosition, margin, pageWidth);
    }

    // Recomendaciones (Premium)
    if ((userPlan === 'premium' || userPlan === 'trial') && data.recommendations) {
      yPosition = this.addRecommendations(doc, yPosition, margin, pageWidth, data.recommendations);
    }

    return yPosition;
  }

  private addContentOptimizerContent(doc: jsPDF, data: any, yPosition: number, userPlan: string): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Puntuación de contenido
    if (data.contentScore !== undefined) {
      yPosition = this.addScoreCircle(doc, data.contentScore, yPosition, pageWidth, 'Puntuación de Contenido');
    }

    // Análisis de contenido
    if (data.analysis) {
      yPosition = this.addSection(doc, 'Análisis de Contenido', yPosition, margin);
      
      const analysisData = [
        ['Densidad de palabras clave', `${data.analysis.keywordDensity || 0}%`],
        ['Puntuación de legibilidad', `${data.analysis.readabilityScore || 0}/100`],
        ['Longitud del contenido', `${data.analysis.wordCount || 0} palabras`],
        ['Estructura de encabezados', data.analysis.headingStructure || 'N/A']
      ];
      
      // Datos adicionales para Premium
      if (userPlan === 'premium' || userPlan === 'trial') {
        analysisData.push(
          ['Análisis de sentimiento', data.analysis.sentiment || 'Neutral'],
          ['Temas principales', data.analysis.topics?.join(', ') || 'N/A']
        );
      }
      
      yPosition = this.addTable(doc, analysisData, yPosition, margin, pageWidth);
    }

    // Sugerencias de mejora
    if (data.suggestions && (userPlan === 'premium' || userPlan === 'trial')) {
      yPosition = this.addRecommendations(doc, yPosition, margin, pageWidth, data.suggestions);
    }

    return yPosition;
  }

  private addDuplicateDetectorContent(doc: jsPDF, data: any, yPosition: number, userPlan: string): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Puntuación de originalidad
    if (data.originalityScore !== undefined) {
      yPosition = this.addScoreCircle(doc, data.originalityScore, yPosition, pageWidth, 'Puntuación de Originalidad');
    }

    // Resumen de duplicación
    yPosition = this.addSection(doc, 'Resumen de Análisis', yPosition, margin);
    
    const duplicateCount = data.duplicateFragments?.length || 0;
    const avgSimilarity = duplicateCount > 0 
      ? data.duplicateFragments.reduce((acc: number, frag: any) => acc + (frag.similarity || 0), 0) / duplicateCount 
      : 0;

    const summaryData = [
      ['Fragmentos duplicados encontrados', duplicateCount.toString()],
      ['Similitud promedio', `${Math.round(avgSimilarity)}%`],
      ['Estado de originalidad', data.originalityScore > 80 ? 'Excelente' : data.originalityScore > 60 ? 'Bueno' : 'Necesita mejora'],
      ['Fuentes analizadas', data.sourcesAnalyzed?.toString() || '1000+']
    ];
    
    yPosition = this.addTable(doc, summaryData, yPosition, margin, pageWidth);

    // Fragmentos duplicados
    if (data.duplicateFragments && data.duplicateFragments.length > 0) {
      yPosition = this.addSection(doc, 'Fragmentos Duplicados Detectados', yPosition, margin);
      
      // Limitar según plan
      const maxFragments = userPlan === 'free' ? 3 : data.duplicateFragments.length;
      const displayFragments = data.duplicateFragments.slice(0, maxFragments);
      
      displayFragments.forEach((fragment: any, index: number) => {
        if (yPosition > 230) {
          doc.addPage();
          yPosition = margin;
          if (userPlan === 'trial') {
            this.addWatermark(doc);
          }
        }
        
        yPosition = this.addDuplicateFragment(doc, fragment, yPosition, margin, pageWidth, index + 1);
      });
      
      if (userPlan === 'free' && data.duplicateFragments.length > 3) {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Mostrando ${maxFragments} de ${data.duplicateFragments.length} fragmentos. Actualiza a Premium para ver todos.`, margin, yPosition + 10);
        doc.setTextColor(0, 0, 0);
        yPosition += 20;
      }
    }

    return yPosition;
  }

  // Métodos auxiliares para elementos comunes
  private addSection(doc: jsPDF, title: string, yPosition: number, margin: number): number {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPosition);
    return yPosition + 20;
  }

  private addParagraph(doc: jsPDF, text: string, yPosition: number, margin: number, pageWidth: number): number {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    doc.text(lines, margin, yPosition);
    return yPosition + lines.length * 6 + 15;
  }

  private addTable(doc: jsPDF, data: string[][], yPosition: number, margin: number, pageWidth: number): number {
    data.forEach(row => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(row[0], margin, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(row[1], pageWidth - margin - 80, yPosition);
      yPosition += 12;
    });
    
    return yPosition + 10;
  }

  private addKeywordTable(doc: jsPDF, keywords: any[], yPosition: number, margin: number, pageWidth: number): number {
    // Headers
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Palabra Clave', margin + 5, yPosition + 5);
    doc.text('Volumen', margin + 100, yPosition + 5);
    doc.text('Dificultad', margin + 140, yPosition + 5);
    doc.text('CPC', margin + 180, yPosition + 5);
    
    yPosition += 15;

    // Datos
    doc.setFont('helvetica', 'normal');
    keywords.forEach(keyword => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
      }

      doc.text(keyword.keyword || '', margin + 5, yPosition + 5);
      doc.text((keyword.volume || 0).toLocaleString(), margin + 100, yPosition + 5);
      doc.text(`${keyword.difficulty || 0}/100`, margin + 140, yPosition + 5);
      doc.text(keyword.cpc || '$0.00', margin + 180, yPosition + 5);
      
      yPosition += 12;
    });

    return yPosition + 10;
  }

  private addScoreCircle(doc: jsPDF, score: number, yPosition: number, pageWidth: number, title: string): number {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, yPosition);
    yPosition += 25;

    // Círculo de puntuación
    const centerX = pageWidth / 2;
    const radius = 25;
    
    // Fondo del círculo
    doc.setFillColor(240, 240, 240);
    doc.circle(centerX, yPosition, radius, 'F');
    
    // Color según puntuación
    let color = [239, 68, 68]; // Red
    if (score >= 70) color = [34, 197, 94]; // Green
    else if (score >= 50) color = [251, 191, 36]; // Yellow
    
    doc.setFillColor(color[0], color[1], color[2]);
    doc.circle(centerX, yPosition, radius - 5, 'F');
    
    // Texto de puntuación
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(score.toString(), centerX, yPosition + 5, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    return yPosition + radius + 20;
  }

  private addVitalsTable(doc: jsPDF, vitalsData: string[][], yPosition: number, margin: number, pageWidth: number): number {
    // Headers
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Métrica', margin + 5, yPosition + 5);
    doc.text('Valor', margin + 80, yPosition + 5);
    doc.text('Estado', margin + 130, yPosition + 5);
    
    yPosition += 15;

    // Datos
    doc.setFont('helvetica', 'normal');
    vitalsData.forEach(row => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
      }

      doc.text(row[0], margin + 5, yPosition + 5);
      doc.text(row[1], margin + 80, yPosition + 5);
      
      // Color del estado
      const status = row[2];
      if (status === 'Bueno') doc.setTextColor(34, 197, 94);
      else if (status === 'Necesita mejora') doc.setTextColor(251, 191, 36);
      else doc.setTextColor(239, 68, 68);
      
      doc.text(status, margin + 130, yPosition + 5);
      doc.setTextColor(0, 0, 0);
      
      yPosition += 12;
    });

    return yPosition + 10;
  }

  private addIssueItem(doc: jsPDF, issue: any, yPosition: number, margin: number, pageWidth: number, index: number): number {
    // Indicador de prioridad
    let priorityColor = [239, 68, 68]; // Red (High)
    if (issue.priority === 'medium') priorityColor = [251, 191, 36]; // Yellow
    else if (issue.priority === 'low') priorityColor = [34, 197, 94]; // Green

    doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
    doc.rect(margin, yPosition - 2, 3, 12, 'F');

    // Título del problema
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index}. ${issue.title || 'Problema identificado'}`, margin + 10, yPosition + 5);
    yPosition += 15;

    // Descripción
    if (issue.description) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(issue.description, pageWidth - 2 * margin - 10);
      doc.text(descLines, margin + 10, yPosition);
      yPosition += descLines.length * 5 + 5;
    }

    // Solución (si está disponible)
    if (issue.solution) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Solución:', margin + 10, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      const solutionLines = doc.splitTextToSize(issue.solution, pageWidth - 2 * margin - 10);
      doc.text(solutionLines, margin + 10, yPosition);
      yPosition += solutionLines.length * 5 + 10;
    }

    return yPosition;
  }

  private addDuplicateFragment(doc: jsPDF, fragment: any, yPosition: number, margin: number, pageWidth: number, index: number): number {
    // Header del fragmento
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index}. Similitud: ${fragment.similarity || 0}%`, margin, yPosition);
    
    // Fuente
    if (fragment.source) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fuente: ${fragment.source}`, margin + 100, yPosition);
      doc.setTextColor(0, 0, 0);
    }
    
    yPosition += 15;

    // Texto del fragmento
    if (fragment.text) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const fragmentText = doc.splitTextToSize(fragment.text, pageWidth - 2 * margin);
      doc.text(fragmentText, margin, yPosition);
      yPosition += fragmentText.length * 5 + 15;
    }

    return yPosition;
  }

  private addRecommendations(doc: jsPDF, yPosition: number, margin: number, pageWidth: number, recommendations: string[]): number {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recomendaciones', margin, yPosition);
    yPosition += 15;

    recommendations.forEach((rec, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`${index + 1}. `, margin, yPosition);
      
      const recLines = doc.splitTextToSize(rec, pageWidth - 2 * margin - 15);
      doc.text(recLines, margin + 15, yPosition);
      yPosition += recLines.length * 6 + 8;
    });

    return yPosition + 10;
  }

  private addFooter(doc: jsPDF, metadata: any, userPlan: string): void {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
    
    // Información del footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Generado por AI Tools Platform', 20, pageHeight - 20);
    doc.text(`Plan: ${userPlan.toUpperCase()}`, pageWidth - 80, pageHeight - 20);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, pageHeight - 10);
    
    doc.setTextColor(0, 0, 0);
  }

  private addWatermark(doc: jsPDF): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(50);
    doc.setFont('helvetica', 'bold');
    
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    
    doc.text('TRIAL', centerX, centerY, {
      angle: 45,
      align: 'center'
    });
    
    doc.setTextColor(0, 0, 0);
  }

  private generateCSVContent(data: ExportData, userPlan: string): string {
    // Implementación específica para cada tipo de herramienta
    switch (data.toolType) {
      case 'title-generator':
        return this.generateTitleGeneratorCSV(data.data, userPlan);
      case 'keyword-research':
        return this.generateKeywordResearchCSV(data.data, userPlan);
      case 'seo-audit':
        return this.generateSEOAuditCSV(data.data, userPlan);
      case 'core-vitals':
        return this.generateCoreVitalsCSV(data.data, userPlan);
      case 'content-optimizer':
        return this.generateContentOptimizerCSV(data.data, userPlan);
      case 'duplicate-detector':
        return this.generateDuplicateDetectorCSV(data.data, userPlan);
      default:
        return 'Error: Tipo de herramienta no soportado\n';
    }
  }

  private generateTitleGeneratorCSV(data: any, userPlan: string): string {
    let csv = 'Número,Título SEO,Longitud,Palabras Clave\n';
    if (data.titles) {
      data.titles.forEach((title: string, index: number) => {
        csv += `${index + 1},"${title.replace(/"/g, '""')}",${title.length},"${data.keywords || ''}"\n`;
      });
    }
    return csv;
  }

  private generateKeywordResearchCSV(data: any, userPlan: string): string {
    let csv = 'Palabra Clave,Volumen de Búsqueda,Dificultad,CPC,Tendencia\n';
    if (data.keywords) {
      const maxKeywords = userPlan === 'free' ? 5 : data.keywords.length;
      const displayKeywords = data.keywords.slice(0, maxKeywords);
      
      displayKeywords.forEach((keyword: any) => {
        csv += `"${keyword.keyword || ''}",${keyword.volume || 0},${keyword.difficulty || 0},"${keyword.cpc || '$0.00'}","${keyword.trend || 'Estable'}"\n`;
      });
    }
    return csv;
  }

  private generateSEOAuditCSV(data: any, userPlan: string): string {
    let csv = 'Problema,Prioridad,Categoría,Descripción,Solución\n';
    if (data.issues) {
      const maxIssues = userPlan === 'free' ? 3 : data.issues.length;
      const displayIssues = data.issues.slice(0, maxIssues);
      
      displayIssues.forEach((issue: any) => {
        csv += `"${issue.title || ''}","${issue.priority || ''}","${issue.category || ''}","${(issue.description || '').replace(/"/g, '""')}","${(issue.solution || '').replace(/"/g, '""')}"\n`;
      });
    }
    return csv;
  }

  private generateCoreVitalsCSV(data: any, userPlan: string): string {
    let csv = 'Métrica,Valor,Estado,Recomendación\n';
    if (data.metrics) {
      const metrics = data.metrics;
      csv += `"LCP","${metrics.lcp || 0}s","${this.getVitalStatus(metrics.lcp, 'lcp')}","Optimizar carga de imágenes"\n`;
      csv += `"FID","${metrics.fid || 0}ms","${this.getVitalStatus(metrics.fid, 'fid')}","Reducir JavaScript bloqueante"\n`;
      csv += `"CLS","${metrics.cls || 0}","${this.getVitalStatus(metrics.cls, 'cls')}","Estabilizar elementos visuales"\n`;
    }
    return csv;
  }

  private generateContentOptimizerCSV(data: any, userPlan: string): string {
    let csv = 'Aspecto,Puntuación,Estado,Recomendación\n';
    if (data.analysis) {
      const analysis = data.analysis;
      csv += `"Densidad de Keywords","${analysis.keywordDensity || 0}%","${analysis.keywordDensity > 2 ? 'Bueno' : 'Mejorar'}","Mantener entre 1-3%"\n`;
      csv += `"Legibilidad","${analysis.readability || 'N/A'}","${analysis.readabilityScore > 60 ? 'Bueno' : 'Mejorar'}","Simplificar oraciones"\n`;
      csv += `"Longitud","${analysis.wordCount || 0} palabras","${analysis.wordCount > 300 ? 'Bueno' : 'Mejorar'}","Mínimo 300 palabras"\n`;
    }
    return csv;
  }

  private generateDuplicateDetectorCSV(data: any, userPlan: string): string {
    let csv = 'Fragmento,Similitud,Fuente,Tipo\n';
    if (data.duplicateFragments) {
      const maxFragments = userPlan === 'free' ? 3 : data.duplicateFragments.length;
      const displayFragments = data.duplicateFragments.slice(0, maxFragments);
      
      displayFragments.forEach((fragment: any) => {
        csv += `"${(fragment.text || '').substring(0, 100).replace(/"/g, '""')}","${fragment.similarity || 0}%","${fragment.source || 'Desconocida'}","${fragment.type || 'Interno'}"\n`;
      });
    }
    return csv;
  }

  private limitDataForFreePlan(data: any, toolType: string): any {
    switch (toolType) {
      case 'keyword-research':
        return {
          ...data,
          keywords: data.keywords?.slice(0, 5) || [],
          note: 'Datos limitados - Actualiza a Premium para acceso completo'
        };
      case 'seo-audit':
        return {
          ...data,
          issues: data.issues?.slice(0, 3) || [],
          note: 'Análisis limitado - Actualiza a Premium para reporte completo'
        };
      case 'duplicate-detector':
        return {
          ...data,
          duplicateFragments: data.duplicateFragments?.slice(0, 3) || [],
          note: 'Fragmentos limitados - Actualiza a Premium para análisis completo'
        };
      default:
        return data;
    }
  }

  private getVitalStatus(value: number, metric: string): string {
    switch (metric) {
      case 'lcp':
        if (value <= 2.5) return 'Bueno';
        if (value <= 4.0) return 'Necesita mejora';
        return 'Pobre';
      case 'fid':
        if (value <= 100) return 'Bueno';
        if (value <= 300) return 'Necesita mejora';
        return 'Pobre';
      case 'cls':
        if (value <= 0.1) return 'Bueno';
        if (value <= 0.25) return 'Necesita mejora';
        return 'Pobre';
      case 'fcp':
        if (value <= 1.8) return 'Bueno';
        if (value <= 3.0) return 'Necesita mejora';
        return 'Pobre';
      default:
        return 'N/A';
    }
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 59, g: 130, b: 246 }; // Default blue
  }
}