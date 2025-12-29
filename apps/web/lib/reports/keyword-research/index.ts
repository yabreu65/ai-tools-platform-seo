/**
 * Exportaciones principales para el sistema de reportes de Keyword Research
 */

// Generadores
export { default as PDFReportGenerator } from './pdf-generator';
export { default as ExcelReportGenerator } from './excel-generator';
export { default as ReportService } from './report-service';

// Tipos
export type { ReportData, PdfOptions } from './pdf-generator';
export type { ExcelReportData, ExcelOptions } from './excel-generator';
export type { ReportRequest, ReportOptions, GeneratedReport } from './report-service';

// Instancia singleton del servicio de reportes
export const reportService = new ReportService();