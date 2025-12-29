/**
 * Servicios de simulación de APIs externas para Keyword Research
 * Exporta todos los servicios disponibles y tipos relacionados
 */

// Servicios individuales
export { default as GoogleKWPlannerService } from './google-kw-planner';
export { default as SEMrushService } from './semrush';
export { default as AhrefsService } from './ahrefs';
export { default as APIIntegratorService } from './api-integrator';

// Tipos de Google Keyword Planner
export type {
  GoogleKWPlannerKeyword,
  GoogleKWPlannerResponse,
  KeywordIdeasRequest
} from './google-kw-planner';

// Tipos de SEMrush
export type {
  SEMrushKeywordData,
  SEMrushCompetitorData,
  SEMrushDomainAnalysis,
  SEMrushSerpFeatures
} from './semrush';

// Tipos de Ahrefs
export type {
  AhrefsKeywordData,
  AhrefsBacklinkData,
  AhrefsContentGap,
  AhrefsSiteExplorer,
  AhrefsRankTracker
} from './ahrefs';

// Tipos del integrador
export type {
  UnifiedKeywordData,
  CompetitorAnalysis,
  TrendAnalysis
} from './api-integrator';

// Instancia singleton del integrador para uso global
export const apiIntegrator = new APIIntegratorService();

// Instancias individuales para uso específico
export const googleKWPlanner = new GoogleKWPlannerService();
export const semrush = new SEMrushService();
export const ahrefs = new AhrefsService();