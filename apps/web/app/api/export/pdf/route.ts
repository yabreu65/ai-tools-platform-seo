import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { verifyToken } from '@/lib/auth';
import { getUserPlan } from '@/lib/plans';

interface ExportRequest {
  toolType: 'title-generator' | 'keyword-research' | 'seo-audit' | 'core-vitals' | 'content-optimizer' | 'duplicate-detector';
  data: any;
  options?: {
    includeBranding?: boolean;
    template?: 'professional' | 'minimal' | 'detailed';
    format?: 'pdf' | 'csv' | 'json';
  };
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const userPlan = 'free'; // Simulado para demo
    const body: ExportRequest = await request.json();

    // Verificar restricciones por plan
    if (userPlan === 'free' && body.options?.includeBranding) {
      return NextResponse.json({ 
        error: 'El branding personalizado requiere plan Premium' 
      }, { status: 403 });
    }

    // Generar PDF según el tipo de herramienta
    const pdf = await generatePDF(body, userPlan);
    
    // Convertir PDF a buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${getFileName(body.toolType)}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generando PDF:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

async function generatePDF(request: ExportRequest, userPlan: string): Promise<jsPDF> {
  const doc = new jsPDF();
  const template = request.options?.template || 'professional';
  
  // Configuración base
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Agregar marca de agua para plan Trial
  if (userPlan === 'trial') {
    addWatermark(doc, pageWidth, pageHeight);
  }

  // Generar contenido según el tipo de herramienta
  switch (request.toolType) {
    case 'title-generator':
      yPosition = await generateTitleGeneratorPDF(doc, request.data, yPosition, margin, pageWidth, userPlan);
      break;
    case 'keyword-research':
      yPosition = await generateKeywordResearchPDF(doc, request.data, yPosition, margin, pageWidth, userPlan);
      break;
    case 'seo-audit':
      yPosition = await generateSEOAuditPDF(doc, request.data, yPosition, margin, pageWidth, userPlan);
      break;
    case 'core-vitals':
      yPosition = await generateCoreVitalsPDF(doc, request.data, yPosition, margin, pageWidth, userPlan);
      break;
    case 'content-optimizer':
      yPosition = await generateContentOptimizerPDF(doc, request.data, yPosition, margin, pageWidth, userPlan);
      break;
    case 'duplicate-detector':
      yPosition = await generateDuplicateDetectorPDF(doc, request.data, yPosition, margin, pageWidth, userPlan);
      break;
    default:
      throw new Error('Tipo de herramienta no soportado');
  }

  return doc;
}

// Funciones específicas para cada herramienta
async function generateTitleGeneratorPDF(
  doc: jsPDF, 
  data: any, 
  yPosition: number, 
  margin: number, 
  pageWidth: number,
  userPlan: string
): Promise<number> {
  // Header profesional
  yPosition = addProfessionalHeader(doc, 'Reporte de Generador de Títulos SEO', yPosition, pageWidth, userPlan);
  
  // Resumen ejecutivo
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Ejecutivo', margin, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const summary = `Se generaron ${data.titles?.length || 0} títulos SEO optimizados basados en las palabras clave proporcionadas. Los títulos están optimizados para CTR y posicionamiento en buscadores.`;
  const summaryLines = doc.splitTextToSize(summary, pageWidth - 2 * margin);
  doc.text(summaryLines, margin, yPosition);
  yPosition += summaryLines.length * 6 + 10;

  // Títulos generados
  if (data.titles && data.titles.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Títulos SEO Generados', margin, yPosition);
    yPosition += 15;

    data.titles.forEach((title: string, index: number) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
        if (userPlan === 'trial') {
          addWatermark(doc, pageWidth, doc.internal.pageSize.getHeight());
        }
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. `, margin, yPosition);
      
      doc.setFont('helvetica', 'normal');
      const titleLines = doc.splitTextToSize(title, pageWidth - 2 * margin - 15);
      doc.text(titleLines, margin + 15, yPosition);
      yPosition += titleLines.length * 6 + 8;
    });
  }

  // Recomendaciones (solo para Premium)
  if (userPlan === 'premium' || userPlan === 'trial') {
    yPosition = addRecommendations(doc, yPosition, margin, pageWidth, [
      'Utiliza los títulos con mayor potencial de CTR para tus páginas principales',
      'Prueba A/B testing con diferentes variaciones de títulos',
      'Monitorea el rendimiento de cada título en Google Search Console',
      'Actualiza títulos regularmente basándote en tendencias de búsqueda'
    ]);
  }

  return yPosition;
}

async function generateKeywordResearchPDF(
  doc: jsPDF, 
  data: any, 
  yPosition: number, 
  margin: number, 
  pageWidth: number,
  userPlan: string
): Promise<number> {
  // Header profesional
  yPosition = addProfessionalHeader(doc, 'Reporte de Investigación de Palabras Clave', yPosition, pageWidth, userPlan);
  
  // Resumen ejecutivo
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Ejecutivo', margin, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const summary = `Análisis completo de ${data.keywords?.length || 0} palabras clave con métricas de volumen de búsqueda, dificultad y oportunidades de posicionamiento.`;
  const summaryLines = doc.splitTextToSize(summary, pageWidth - 2 * margin);
  doc.text(summaryLines, margin, yPosition);
  yPosition += summaryLines.length * 6 + 15;

  // Métricas principales
  if (data.metrics) {
    yPosition = addMetricsSection(doc, data.metrics, yPosition, margin, pageWidth);
  }

  // Palabras clave principales
  if (data.keywords && data.keywords.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Palabras Clave Analizadas', margin, yPosition);
    yPosition += 15;

    // Tabla de keywords
    yPosition = addKeywordTable(doc, data.keywords, yPosition, margin, pageWidth, userPlan);
  }

  return yPosition;
}

async function generateSEOAuditPDF(
  doc: jsPDF, 
  data: any, 
  yPosition: number, 
  margin: number, 
  pageWidth: number,
  userPlan: string
): Promise<number> {
  // Header profesional
  yPosition = addProfessionalHeader(doc, 'Reporte de Auditoría SEO', yPosition, pageWidth, userPlan);
  
  // Puntuación general
  if (data.overallScore !== undefined) {
    yPosition = addScoreSection(doc, data.overallScore, yPosition, margin, pageWidth);
  }

  // Problemas encontrados
  if (data.issues && data.issues.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Problemas Identificados', margin, yPosition);
    yPosition += 15;

    data.issues.forEach((issue: any, index: number) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
        if (userPlan === 'trial') {
          addWatermark(doc, pageWidth, doc.internal.pageSize.getHeight());
        }
      }

      yPosition = addIssueItem(doc, issue, yPosition, margin, pageWidth, index + 1);
    });
  }

  return yPosition;
}

async function generateCoreVitalsPDF(
  doc: jsPDF, 
  data: any, 
  yPosition: number, 
  margin: number, 
  pageWidth: number,
  userPlan: string
): Promise<number> {
  // Header profesional
  yPosition = addProfessionalHeader(doc, 'Reporte de Core Web Vitals', yPosition, pageWidth, userPlan);
  
  // Métricas principales
  if (data.metrics) {
    yPosition = addVitalsMetrics(doc, data.metrics, yPosition, margin, pageWidth);
  }

  // Recomendaciones de optimización
  if (data.recommendations && (userPlan === 'premium' || userPlan === 'trial')) {
    yPosition = addOptimizationRecommendations(doc, data.recommendations, yPosition, margin, pageWidth);
  }

  return yPosition;
}

async function generateContentOptimizerPDF(
  doc: jsPDF, 
  data: any, 
  yPosition: number, 
  margin: number, 
  pageWidth: number,
  userPlan: string
): Promise<number> {
  // Header profesional
  yPosition = addProfessionalHeader(doc, 'Reporte de Optimización de Contenido', yPosition, pageWidth, userPlan);
  
  // Puntuación de contenido
  if (data.contentScore !== undefined) {
    yPosition = addScoreSection(doc, data.contentScore, yPosition, margin, pageWidth);
  }

  // Análisis de contenido
  if (data.analysis) {
    yPosition = addContentAnalysis(doc, data.analysis, yPosition, margin, pageWidth, userPlan);
  }

  return yPosition;
}

async function generateDuplicateDetectorPDF(
  doc: jsPDF, 
  data: any, 
  yPosition: number, 
  margin: number, 
  pageWidth: number,
  userPlan: string
): Promise<number> {
  // Header profesional
  yPosition = addProfessionalHeader(doc, 'Reporte de Detección de Contenido Duplicado', yPosition, pageWidth, userPlan);
  
  // Puntuación de originalidad
  if (data.originalityScore !== undefined) {
    yPosition = addScoreSection(doc, data.originalityScore, yPosition, margin, pageWidth, 'Puntuación de Originalidad');
  }

  // Fragmentos duplicados
  if (data.duplicateFragments && data.duplicateFragments.length > 0) {
    yPosition = addDuplicateFragments(doc, data.duplicateFragments, yPosition, margin, pageWidth, userPlan);
  }

  return yPosition;
}

// Funciones auxiliares para el diseño
function addProfessionalHeader(
  doc: jsPDF, 
  title: string, 
  yPosition: number, 
  pageWidth: number, 
  userPlan: string
): number {
  // Fondo del header
  doc.setFillColor(59, 130, 246); // Blue-500
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 25);

  // Fecha
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const date = new Date().toLocaleDateString('es-ES');
  doc.text(`Generado el: ${date}`, pageWidth - 80, 25);

  // Plan badge (solo para Premium)
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

function addWatermark(doc: jsPDF, pageWidth: number, pageHeight: number) {
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(50);
  doc.setFont('helvetica', 'bold');
  
  // Rotar texto para diagonal
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  doc.text('TRIAL', centerX, centerY, {
    angle: 45,
    align: 'center'
  });
  
  doc.setTextColor(0, 0, 0);
}

function addRecommendations(
  doc: jsPDF, 
  yPosition: number, 
  margin: number, 
  pageWidth: number, 
  recommendations: string[]
): number {
  if (yPosition > 200) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recomendaciones', margin, yPosition);
  yPosition += 15;

  recommendations.forEach((rec, index) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${index + 1}. `, margin, yPosition);
    
    const recLines = doc.splitTextToSize(rec, pageWidth - 2 * margin - 15);
    doc.text(recLines, margin + 15, yPosition);
    yPosition += recLines.length * 6 + 5;
  });

  return yPosition + 10;
}

function addMetricsSection(
  doc: jsPDF, 
  metrics: any, 
  yPosition: number, 
  margin: number, 
  pageWidth: number
): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Métricas Principales', margin, yPosition);
  yPosition += 15;

  // Crear tabla de métricas
  const metricsData = [
    ['Palabras clave analizadas', metrics.totalKeywords || '0'],
    ['Volumen promedio de búsqueda', metrics.avgSearchVolume || '0'],
    ['Dificultad promedio', metrics.avgDifficulty || '0'],
    ['Oportunidades identificadas', metrics.opportunities || '0']
  ];

  yPosition = addSimpleTable(doc, metricsData, yPosition, margin, pageWidth);
  return yPosition + 10;
}

function addKeywordTable(
  doc: jsPDF, 
  keywords: any[], 
  yPosition: number, 
  margin: number, 
  pageWidth: number,
  userPlan: string
): number {
  const headers = ['Palabra Clave', 'Volumen', 'Dificultad', 'CPC'];
  const colWidths = [80, 30, 30, 30];
  
  // Headers
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  let xPos = margin + 5;
  headers.forEach((header, index) => {
    doc.text(header, xPos, yPosition + 5);
    xPos += colWidths[index];
  });
  
  yPosition += 15;

  // Datos (limitar según plan)
  const maxRows = userPlan === 'free' ? 5 : keywords.length;
  const displayKeywords = keywords.slice(0, maxRows);

  doc.setFont('helvetica', 'normal');
  displayKeywords.forEach((keyword, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
    }

    xPos = margin + 5;
    const rowData = [
      keyword.keyword || '',
      keyword.volume?.toString() || '0',
      keyword.difficulty?.toString() || '0',
      keyword.cpc || '$0.00'
    ];

    rowData.forEach((data, colIndex) => {
      const text = doc.splitTextToSize(data, colWidths[colIndex] - 5);
      doc.text(text, xPos, yPosition + 5);
      xPos += colWidths[colIndex];
    });

    yPosition += 12;
  });

  return yPosition + 10;
}

function addScoreSection(
  doc: jsPDF, 
  score: number, 
  yPosition: number, 
  margin: number, 
  pageWidth: number,
  title: string = 'Puntuación General'
): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, yPosition);
  yPosition += 20;

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

function addSimpleTable(
  doc: jsPDF, 
  data: string[][], 
  yPosition: number, 
  margin: number, 
  pageWidth: number
): number {
  data.forEach(row => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(row[0], margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(row[1], pageWidth - margin - 50, yPosition);
    yPosition += 12;
  });
  
  return yPosition;
}

function addIssueItem(
  doc: jsPDF, 
  issue: any, 
  yPosition: number, 
  margin: number, 
  pageWidth: number,
  index: number
): number {
  // Prioridad color
  let priorityColor = [239, 68, 68]; // Red (High)
  if (issue.priority === 'medium') priorityColor = [251, 191, 36]; // Yellow
  else if (issue.priority === 'low') priorityColor = [34, 197, 94]; // Green

  // Indicador de prioridad
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
    yPosition += descLines.length * 5 + 10;
  }

  return yPosition;
}

function addVitalsMetrics(
  doc: jsPDF, 
  metrics: any, 
  yPosition: number, 
  margin: number, 
  pageWidth: number
): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Métricas Core Web Vitals', margin, yPosition);
  yPosition += 20;

  const vitalsData = [
    ['Largest Contentful Paint (LCP)', `${metrics.lcp || 0}s`],
    ['First Input Delay (FID)', `${metrics.fid || 0}ms`],
    ['Cumulative Layout Shift (CLS)', metrics.cls || '0'],
    ['First Contentful Paint (FCP)', `${metrics.fcp || 0}s`],
    ['Time to Interactive (TTI)', `${metrics.tti || 0}s`]
  ];

  return addSimpleTable(doc, vitalsData, yPosition, margin, pageWidth);
}

function addOptimizationRecommendations(
  doc: jsPDF, 
  recommendations: string[], 
  yPosition: number, 
  margin: number, 
  pageWidth: number
): number {
  return addRecommendations(doc, yPosition, margin, pageWidth, recommendations);
}

function addContentAnalysis(
  doc: jsPDF, 
  analysis: any, 
  yPosition: number, 
  margin: number, 
  pageWidth: number,
  userPlan: string
): number {
  const analysisData = [
    ['Densidad de palabras clave', `${analysis.keywordDensity || 0}%`],
    ['Legibilidad', analysis.readability || 'N/A'],
    ['Longitud del contenido', `${analysis.wordCount || 0} palabras`],
    ['Estructura de encabezados', analysis.headingStructure || 'N/A']
  ];

  if (userPlan === 'premium' || userPlan === 'trial') {
    analysisData.push(
      ['Análisis de sentimiento', analysis.sentiment || 'N/A'],
      ['Temas principales', analysis.topics?.join(', ') || 'N/A']
    );
  }

  return addSimpleTable(doc, analysisData, yPosition, margin, pageWidth);
}

function addDuplicateFragments(
  doc: jsPDF, 
  fragments: any[], 
  yPosition: number, 
  margin: number, 
  pageWidth: number,
  userPlan: string
): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Fragmentos Duplicados Detectados', margin, yPosition);
  yPosition += 15;

  const maxFragments = userPlan === 'free' ? 3 : fragments.length;
  const displayFragments = fragments.slice(0, maxFragments);

  displayFragments.forEach((fragment, index) => {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. Similitud: ${fragment.similarity || 0}%`, margin, yPosition);
    yPosition += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const fragmentText = doc.splitTextToSize(fragment.text || '', pageWidth - 2 * margin);
    doc.text(fragmentText, margin, yPosition);
    yPosition += fragmentText.length * 5 + 15;
  });

  return yPosition;
}

function getFileName(toolType: string): string {
  const date = new Date().toISOString().split('T')[0];
  const fileNames = {
    'title-generator': `reporte-titulos-seo-${date}.pdf`,
    'keyword-research': `reporte-keywords-${date}.pdf`,
    'seo-audit': `auditoria-seo-${date}.pdf`,
    'core-vitals': `core-web-vitals-${date}.pdf`,
    'content-optimizer': `optimizacion-contenido-${date}.pdf`,
    'duplicate-detector': `deteccion-duplicados-${date}.pdf`
  };
  
  return fileNames[toolType as keyof typeof fileNames] || `reporte-seo-${date}.pdf`;
}