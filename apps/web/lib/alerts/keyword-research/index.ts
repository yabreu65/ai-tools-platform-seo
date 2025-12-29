/**
 * Exportaciones principales para el sistema de alertas de Keyword Research
 */

// Servicio principal
export { default as AlertService } from './alert-service';

// Tipos
export type { 
  KeywordAlert, 
  AlertCondition, 
  NotificationConfig, 
  RankingData, 
  AlertTrigger, 
  TrackingConfig 
} from './alert-service';

// Instancia singleton del servicio de alertas
export const alertService = new AlertService();