import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Schema de validación para configuración de alertas
const alertConfigurationSchema = z.object({
  alert_name: z.string().min(1, 'Nombre de la alerta es requerido').max(100, 'Nombre muy largo'),
  alert_type: z.enum(['position_change', 'visibility_change', 'new_competitor', 'serp_feature', 'traffic_change', 'keyword_opportunity']),
  keywords: z.array(z.string()).min(1, 'Al menos una keyword es requerida').max(50, 'Máximo 50 keywords por alerta'),
  conditions: z.object({
    position_threshold: z.number().min(1).max(100).optional(),
    position_change_threshold: z.number().min(1).max(50).optional(),
    visibility_threshold: z.number().min(1).max(100).optional(),
    traffic_change_threshold: z.number().min(1).max(500).optional(),
    serp_features: z.array(z.enum(['featured_snippet', 'sitelinks', 'images', 'videos', 'local_pack', 'knowledge_panel', 'people_also_ask'])).optional(),
    competitor_domains: z.array(z.string().url()).max(10, 'Máximo 10 competidores').optional(),
    frequency_check: z.enum(['daily', 'weekly', 'monthly']).default('weekly')
  }),
  notification_settings: z.object({
    email_enabled: z.boolean().default(true),
    email_recipients: z.array(z.string().email()).max(10, 'Máximo 10 destinatarios').default([]),
    webhook_enabled: z.boolean().default(false),
    webhook_url: z.string().url().optional(),
    slack_enabled: z.boolean().default(false),
    slack_webhook: z.string().url().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium')
  }).default({}),
  active: z.boolean().default(true),
  location: z.string().default('United States'),
  language: z.string().default('en'),
  device: z.enum(['desktop', 'mobile', 'tablet']).default('desktop')
});

// Schema para obtener alertas activas
const alertQuerySchema = z.object({
  alert_type: z.enum(['position_change', 'visibility_change', 'new_competitor', 'serp_feature', 'traffic_change', 'keyword_opportunity']).optional(),
  status: z.enum(['active', 'paused', 'triggered']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
});

// Schema para actualizar alertas
const alertUpdateSchema = z.object({
  alert_id: z.string().min(1, 'ID de alerta es requerido'),
  active: z.boolean().optional(),
  conditions: z.object({
    position_threshold: z.number().min(1).max(100).optional(),
    position_change_threshold: z.number().min(1).max(50).optional(),
    visibility_threshold: z.number().min(1).max(100).optional(),
    traffic_change_threshold: z.number().min(1).max(500).optional(),
    frequency_check: z.enum(['daily', 'weekly', 'monthly']).optional()
  }).optional(),
  notification_settings: z.object({
    email_enabled: z.boolean().optional(),
    email_recipients: z.array(z.string().email()).max(10).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional()
  }).optional()
});

interface AlertCondition {
  condition_type: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'contains' | 'not_contains';
  value: number | string | string[];
  description: string;
}

interface AlertTrigger {
  trigger_id: string;
  alert_id: string;
  keyword: string;
  trigger_date: string;
  condition_met: AlertCondition;
  current_value: number | string;
  previous_value: number | string;
  change_percentage: number;
  severity: 'low' | 'medium' | 'high';
  acknowledged: boolean;
  details: {
    position_change?: number;
    visibility_change?: number;
    new_serp_features?: string[];
    competitor_changes?: {
      domain: string;
      position_change: number;
    }[];
    traffic_impact?: number;
  };
}

interface ConfiguredAlert {
  alert_id: string;
  alert_name: string;
  alert_type: string;
  keywords: string[];
  conditions: {
    position_threshold?: number;
    position_change_threshold?: number;
    visibility_threshold?: number;
    traffic_change_threshold?: number;
    serp_features?: string[];
    competitor_domains?: string[];
    frequency_check: string;
  };
  notification_settings: {
    email_enabled: boolean;
    email_recipients: string[];
    webhook_enabled: boolean;
    webhook_url?: string;
    slack_enabled: boolean;
    slack_webhook?: string;
    priority: string;
  };
  status: 'active' | 'paused' | 'error';
  created_date: string;
  last_checked: string;
  last_triggered: string | null;
  trigger_count: number;
  location: string;
  language: string;
  device: string;
  recent_triggers: AlertTrigger[];
  performance_metrics: {
    total_checks: number;
    triggers_this_month: number;
    avg_response_time: number;
    accuracy_score: number;
  };
}

// Función para generar triggers de ejemplo
const generateAlertTriggers = (alertType: string, keywords: string[], count: number = 3): AlertTrigger[] => {
  const triggers: AlertTrigger[] = [];
  const now = new Date();
  
  for (let i = 0; i < Math.min(count, keywords.length); i++) {
    const keyword = keywords[i];
    const triggerDate = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Últimos 7 días
    
    let conditionMet: AlertCondition;
    let currentValue: number | string;
    let previousValue: number | string;
    let changePercentage: number;
    let severity: 'low' | 'medium' | 'high';
    let details: AlertTrigger['details'] = {};
    
    switch (alertType) {
      case 'position_change':
        const positionChange = Math.floor(Math.random() * 20) - 10; // -10 a +10
        currentValue = Math.floor(Math.random() * 50) + 1;
        previousValue = (currentValue as number) - positionChange;
        changePercentage = Math.abs(positionChange);
        severity = Math.abs(positionChange) >= 10 ? 'high' : Math.abs(positionChange) >= 5 ? 'medium' : 'low';
        
        conditionMet = {
          condition_type: 'position_change',
          operator: 'greater_than',
          value: 5,
          description: `Cambio de posición mayor a 5 posiciones`
        };
        
        details.position_change = positionChange;
        break;
        
      case 'visibility_change':
        const visibilityChange = Math.floor(Math.random() * 60) - 30; // -30% a +30%
        currentValue = Math.floor(Math.random() * 100);
        previousValue = Math.max(0, Math.min(100, (currentValue as number) - visibilityChange));
        changePercentage = Math.abs(visibilityChange);
        severity = Math.abs(visibilityChange) >= 25 ? 'high' : Math.abs(visibilityChange) >= 15 ? 'medium' : 'low';
        
        conditionMet = {
          condition_type: 'visibility_change',
          operator: 'greater_than',
          value: 20,
          description: `Cambio de visibilidad mayor al 20%`
        };
        
        details.visibility_change = visibilityChange;
        break;
        
      case 'serp_feature':
        const features = ['featured_snippet', 'sitelinks', 'images', 'videos', 'local_pack'];
        const newFeature = features[Math.floor(Math.random() * features.length)];
        currentValue = newFeature;
        previousValue = 'none';
        changePercentage = 100; // Nueva feature = 100% cambio
        severity = newFeature === 'featured_snippet' ? 'high' : 'medium';
        
        conditionMet = {
          condition_type: 'serp_feature',
          operator: 'contains',
          value: [newFeature],
          description: `Nueva SERP feature detectada: ${newFeature}`
        };
        
        details.new_serp_features = [newFeature];
        break;
        
      case 'new_competitor':
        const competitorDomain = `competitor${Math.floor(Math.random() * 10) + 1}.com`;
        currentValue = Math.floor(Math.random() * 10) + 1; // Posición del nuevo competidor
        previousValue = 'not_ranking';
        changePercentage = 100;
        severity = (currentValue as number) <= 5 ? 'high' : 'medium';
        
        conditionMet = {
          condition_type: 'new_competitor',
          operator: 'less_than',
          value: 10,
          description: `Nuevo competidor en top 10: ${competitorDomain}`
        };
        
        details.competitor_changes = [{
          domain: competitorDomain,
          position_change: -(currentValue as number) // Negativo porque es nuevo
        }];
        break;
        
      case 'traffic_change':
        const trafficChange = Math.floor(Math.random() * 200) - 100; // -100% a +100%
        currentValue = Math.floor(Math.random() * 10000) + 1000;
        previousValue = Math.max(0, (currentValue as number) - (currentValue as number) * (trafficChange / 100));
        changePercentage = Math.abs(trafficChange);
        severity = Math.abs(trafficChange) >= 50 ? 'high' : Math.abs(trafficChange) >= 25 ? 'medium' : 'low';
        
        conditionMet = {
          condition_type: 'traffic_change',
          operator: 'greater_than',
          value: 30,
          description: `Cambio de tráfico mayor al 30%`
        };
        
        details.traffic_impact = trafficChange;
        break;
        
      default:
        continue;
    }
    
    triggers.push({
      trigger_id: `trigger_${Date.now()}_${i}`,
      alert_id: `alert_${Math.random().toString(36).substr(2, 9)}`,
      keyword,
      trigger_date: triggerDate.toISOString(),
      condition_met: conditionMet,
      current_value: currentValue,
      previous_value: previousValue,
      change_percentage: changePercentage,
      severity,
      acknowledged: Math.random() > 0.7,
      details
    });
  }
  
  return triggers;
};

// Función para generar métricas de rendimiento
const generatePerformanceMetrics = (createdDate: string) => {
  const daysSinceCreated = Math.floor((Date.now() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24));
  const totalChecks = Math.floor(daysSinceCreated * (Math.random() * 3 + 1)); // 1-4 checks por día
  const triggersThisMonth = Math.floor(Math.random() * 20);
  
  return {
    total_checks: totalChecks,
    triggers_this_month: triggersThisMonth,
    avg_response_time: Math.round((Math.random() * 2 + 0.5) * 1000), // 0.5-2.5 segundos
    accuracy_score: Math.round((Math.random() * 20 + 80) * 10) / 10 // 80-100%
  };
};

// POST /api/keyword-research/alerts/configure
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = alertConfigurationSchema.parse(req.body);
    
    const {
      alert_name,
      alert_type,
      keywords,
      conditions,
      notification_settings,
      active,
      location,
      language,
      device
    } = validatedData;

    // Simular tiempo de configuración
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generar ID de la alerta
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    // Generar triggers de ejemplo si la alerta está activa
    const recentTriggers = active ? generateAlertTriggers(alert_type, keywords, 2) : [];
    
    const configuredAlert: ConfiguredAlert = {
      alert_id: alertId,
      alert_name,
      alert_type,
      keywords,
      conditions: {
        ...conditions,
        frequency_check: conditions.frequency_check || 'weekly'
      },
      notification_settings: {
        email_enabled: notification_settings.email_enabled ?? true,
        email_recipients: notification_settings.email_recipients || [],
        webhook_enabled: notification_settings.webhook_enabled ?? false,
        webhook_url: notification_settings.webhook_url,
        slack_enabled: notification_settings.slack_enabled ?? false,
        slack_webhook: notification_settings.slack_webhook,
        priority: notification_settings.priority || 'medium'
      },
      status: active ? 'active' : 'paused',
      created_date: now,
      last_checked: active ? now : '',
      last_triggered: recentTriggers.length > 0 ? recentTriggers[0].trigger_date : null,
      trigger_count: recentTriggers.length,
      location,
      language,
      device,
      recent_triggers: recentTriggers,
      performance_metrics: generatePerformanceMetrics(now)
    };

    res.json({
      success: true,
      data: {
        alert: configuredAlert,
        configuration_summary: {
          alert_id: alertId,
          keywords_monitored: keywords.length,
          notification_channels: [
            notification_settings.email_enabled && 'email',
            notification_settings.webhook_enabled && 'webhook',
            notification_settings.slack_enabled && 'slack'
          ].filter(Boolean),
          check_frequency: conditions.frequency_check || 'weekly',
          estimated_monthly_checks: conditions.frequency_check === 'daily' ? 30 : 
                                   conditions.frequency_check === 'weekly' ? 4 : 1
        }
      },
      message: `Alerta "${alert_name}" configurada exitosamente`
    });

  } catch (error) {
    console.error('Error configurando alerta:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Datos de configuración inválidos',
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

// GET /api/keyword-research/alerts/list
router.post('/list', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = alertQuerySchema.parse(req.body);
    
    const {
      alert_type,
      status,
      priority,
      date_from,
      date_to,
      limit,
      offset
    } = validatedData;

    // Simular tiempo de consulta
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Generar alertas de ejemplo
    const alertTypes = ['position_change', 'visibility_change', 'new_competitor', 'serp_feature', 'traffic_change', 'keyword_opportunity'];
    const statuses: ('active' | 'paused' | 'error')[] = ['active', 'paused', 'active', 'active']; // Más activas que pausadas
    const priorities = ['low', 'medium', 'high', 'medium']; // Más medium
    
    const allAlerts: ConfiguredAlert[] = [];
    
    for (let i = 0; i < 25; i++) {
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90)); // Últimos 90 días
      
      const alertTypeSelected = alert_type || alertTypes[Math.floor(Math.random() * alertTypes.length)];
      // Mapear 'triggered' a 'active' para compatibilidad con la interfaz
      const statusFromQuery = status === 'triggered' ? 'active' : status;
      const statusSelected = statusFromQuery || statuses[Math.floor(Math.random() * statuses.length)];
      const prioritySelected = priority || priorities[Math.floor(Math.random() * priorities.length)];
      
      const keywords = [
        'seo tools', 'keyword research', 'rank tracking', 'serp analysis', 'competitor analysis'
      ].slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 keywords
      
      const recentTriggers = statusSelected === 'active' ? 
        generateAlertTriggers(alertTypeSelected, keywords, Math.floor(Math.random() * 3)) : [];
      
      allAlerts.push({
        alert_id: `alert_${i + 1}`,
        alert_name: `${alertTypeSelected.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Alert ${i + 1}`,
        alert_type: alertTypeSelected,
        keywords,
        conditions: {
          position_change_threshold: alertTypeSelected === 'position_change' ? Math.floor(Math.random() * 10) + 5 : undefined,
          visibility_threshold: alertTypeSelected === 'visibility_change' ? Math.floor(Math.random() * 30) + 20 : undefined,
          frequency_check: ['daily', 'weekly', 'monthly'][Math.floor(Math.random() * 3)]
        },
        notification_settings: {
          email_enabled: true,
          email_recipients: [`user${i + 1}@example.com`],
          webhook_enabled: Math.random() > 0.8,
          slack_enabled: Math.random() > 0.9,
          priority: prioritySelected
        },
        status: statusSelected,
        created_date: createdDate.toISOString(),
        last_checked: statusSelected === 'active' ? new Date().toISOString() : createdDate.toISOString(),
        last_triggered: recentTriggers.length > 0 ? recentTriggers[0].trigger_date : null,
        trigger_count: Math.floor(Math.random() * 20),
        location: 'United States',
        language: 'en',
        device: 'desktop',
        recent_triggers: recentTriggers,
        performance_metrics: generatePerformanceMetrics(createdDate.toISOString())
      });
    }
    
    // Filtrar alertas
    let filteredAlerts = allAlerts;
    
    if (date_from) {
      filteredAlerts = filteredAlerts.filter(alert => alert.created_date >= date_from);
    }
    if (date_to) {
      filteredAlerts = filteredAlerts.filter(alert => alert.created_date <= date_to);
    }
    
    // Aplicar paginación
    const paginatedAlerts = filteredAlerts.slice(offset, offset + limit);

    res.json({
      success: true,
      data: {
        alerts: paginatedAlerts,
        pagination: {
          total: filteredAlerts.length,
          limit,
          offset,
          has_more: offset + limit < filteredAlerts.length
        },
        summary: {
          total_alerts: filteredAlerts.length,
          active_alerts: filteredAlerts.filter(a => a.status === 'active').length,
          paused_alerts: filteredAlerts.filter(a => a.status === 'paused').length,
          total_keywords_monitored: filteredAlerts.reduce((sum, a) => sum + a.keywords.length, 0),
          alerts_triggered_today: filteredAlerts.filter(a => 
            a.last_triggered && new Date(a.last_triggered).toDateString() === new Date().toDateString()
          ).length,
          most_common_type: alertTypes[Math.floor(Math.random() * alertTypes.length)]
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo lista de alertas:', error);
    
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

// PUT /api/keyword-research/alerts/update
router.put('/update', async (req, res) => {
  try {
    const validatedData = alertUpdateSchema.parse(req.body);
    
    const { alert_id, active, conditions, notification_settings } = validatedData;

    // Simular tiempo de actualización
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Simular actualización de alerta (en una implementación real, se actualizaría la base de datos)
    const updatedAlert = {
      alert_id,
      updated_date: new Date().toISOString(),
      changes_applied: {
        status_changed: active !== undefined,
        conditions_updated: conditions !== undefined,
        notifications_updated: notification_settings !== undefined
      },
      new_status: active !== undefined ? (active ? 'active' : 'paused') : 'unchanged'
    };

    res.json({
      success: true,
      data: {
        alert_update: updatedAlert,
        message: 'Alerta actualizada exitosamente'
      }
    });

  } catch (error) {
    console.error('Error actualizando alerta:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Datos de actualización inválidos',
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

// DELETE /api/keyword-research/alerts/:alertId
router.delete('/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    
    if (!alertId) {
      res.status(400).json({
        success: false,
        error: 'ID de alerta es requerido'
      });
      return;
    }

    // Simular tiempo de eliminación
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

    res.json({
      success: true,
      data: {
        alert_id: alertId,
        deleted_date: new Date().toISOString(),
        cleanup_performed: {
          triggers_removed: Math.floor(Math.random() * 10),
          notifications_cancelled: Math.floor(Math.random() * 5),
          webhooks_unregistered: Math.random() > 0.8 ? 1 : 0
        }
      },
      message: 'Alerta eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando alerta:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/keyword-research/alerts/triggers
router.get('/triggers', async (req, res) => {
  try {
    const { limit = 20, offset = 0, severity, acknowledged } = req.query;

    // Simular tiempo de consulta
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600));

    // Generar triggers recientes
    const keywords = ['seo tools', 'keyword research', 'rank tracking', 'serp analysis', 'competitor analysis'];
    const alertTypes = ['position_change', 'visibility_change', 'new_competitor', 'serp_feature', 'traffic_change'];
    
    const allTriggers: AlertTrigger[] = [];
    
    for (let i = 0; i < 50; i++) {
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const triggers = generateAlertTriggers(alertType, keywords, 1);
      if (triggers.length > 0) {
        allTriggers.push(triggers[0]);
      }
    }
    
    // Filtrar por severity si se especifica
    let filteredTriggers = allTriggers;
    if (severity) {
      filteredTriggers = filteredTriggers.filter(t => t.severity === severity);
    }
    if (acknowledged !== undefined) {
      const isAcknowledged = acknowledged === 'true';
      filteredTriggers = filteredTriggers.filter(t => t.acknowledged === isAcknowledged);
    }
    
    // Ordenar por fecha (más recientes primero)
    filteredTriggers.sort((a, b) => new Date(b.trigger_date).getTime() - new Date(a.trigger_date).getTime());
    
    // Aplicar paginación
    const paginatedTriggers = filteredTriggers.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      success: true,
      data: {
        triggers: paginatedTriggers,
        pagination: {
          total: filteredTriggers.length,
          limit: Number(limit),
          offset: Number(offset),
          has_more: Number(offset) + Number(limit) < filteredTriggers.length
        },
        summary: {
          total_triggers: filteredTriggers.length,
          unacknowledged: filteredTriggers.filter(t => !t.acknowledged).length,
          high_severity: filteredTriggers.filter(t => t.severity === 'high').length,
          medium_severity: filteredTriggers.filter(t => t.severity === 'medium').length,
          low_severity: filteredTriggers.filter(t => t.severity === 'low').length,
          triggers_today: filteredTriggers.filter(t => 
            new Date(t.trigger_date).toDateString() === new Date().toDateString()
          ).length
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo triggers:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;