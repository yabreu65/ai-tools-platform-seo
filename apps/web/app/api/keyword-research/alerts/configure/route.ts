import { NextRequest, NextResponse } from 'next/server';

interface AlertConfigurationRequest {
  type: 'position_change' | 'volume_change' | 'new_competitor' | 'serp_feature' | 'ranking_loss' | 'opportunity';
  name: string;
  description?: string;
  keywords?: string[];
  domain?: string;
  conditions: {
    metric: string;
    operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'increases_by' | 'decreases_by';
    value: number | string;
    timeframe?: '1d' | '7d' | '30d' | '90d';
  }[];
  notifications: {
    email?: boolean;
    webhook?: string;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  isActive?: boolean;
}

interface AlertRule {
  id: string;
  type: string;
  name: string;
  description: string;
  keywords: string[];
  domain?: string;
  conditions: Array<{
    metric: string;
    operator: string;
    value: number | string;
    timeframe: string;
  }>;
  notifications: {
    email: boolean;
    webhook?: string;
    frequency: string;
  };
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface AlertTrigger {
  id: string;
  alertId: string;
  keyword: string;
  metric: string;
  oldValue: number | string;
  newValue: number | string;
  change: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggeredAt: string;
  acknowledged: boolean;
}

// Base de datos simulada de alertas
const alertsDatabase: AlertRule[] = [
  {
    id: 'alert_1',
    type: 'position_change',
    name: 'Caída de Rankings Crítica',
    description: 'Alerta cuando las keywords principales caen más de 5 posiciones',
    keywords: ['seo tools', 'keyword research', 'rank tracker'],
    domain: 'example.com',
    conditions: [
      {
        metric: 'position',
        operator: 'increases_by',
        value: 5,
        timeframe: '7d'
      }
    ],
    notifications: {
      email: true,
      frequency: 'immediate'
    },
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastTriggered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    triggerCount: 3
  },
  {
    id: 'alert_2',
    type: 'volume_change',
    name: 'Cambio de Volumen Significativo',
    description: 'Detecta cambios importantes en el volumen de búsqueda',
    keywords: ['digital marketing', 'seo strategy'],
    conditions: [
      {
        metric: 'search_volume',
        operator: 'increases_by',
        value: 50,
        timeframe: '30d'
      }
    ],
    notifications: {
      email: true,
      frequency: 'weekly'
    },
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    triggerCount: 1
  }
];

// Historial de triggers simulado
const alertTriggersDatabase: AlertTrigger[] = [
  {
    id: 'trigger_1',
    alertId: 'alert_1',
    keyword: 'seo tools',
    metric: 'position',
    oldValue: 3,
    newValue: 8,
    change: 5,
    severity: 'high',
    triggeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledged: false
  },
  {
    id: 'trigger_2',
    alertId: 'alert_2',
    keyword: 'digital marketing',
    metric: 'search_volume',
    oldValue: 12000,
    newValue: 18500,
    change: 54.2,
    severity: 'medium',
    triggeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledged: true
  }
];

// Validar configuración de alerta
function validateAlertConfiguration(config: AlertConfigurationRequest): string[] {
  const errors: string[] = [];
  
  if (!config.name || config.name.trim().length === 0) {
    errors.push('El nombre de la alerta es requerido');
  }
  
  if (!config.type) {
    errors.push('El tipo de alerta es requerido');
  }
  
  if (!['position_change', 'volume_change', 'new_competitor', 'serp_feature', 'ranking_loss', 'opportunity'].includes(config.type)) {
    errors.push('Tipo de alerta no válido');
  }
  
  if (!config.conditions || config.conditions.length === 0) {
    errors.push('Se requiere al menos una condición');
  }
  
  config.conditions?.forEach((condition, index) => {
    if (!condition.metric) {
      errors.push(`Condición ${index + 1}: métrica requerida`);
    }
    
    if (!condition.operator) {
      errors.push(`Condición ${index + 1}: operador requerido`);
    }
    
    if (condition.value === undefined || condition.value === null) {
      errors.push(`Condición ${index + 1}: valor requerido`);
    }
  });
  
  if (!config.notifications) {
    errors.push('Configuración de notificaciones requerida');
  } else {
    if (!config.notifications.frequency) {
      errors.push('Frecuencia de notificación requerida');
    }
    
    if (!config.notifications.email && !config.notifications.webhook) {
      errors.push('Se requiere al menos un método de notificación');
    }
  }
  
  return errors;
}

// Generar ID único para alerta
function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Calcular severidad basada en el tipo y condiciones
function calculateAlertSeverity(type: string, conditions: any[]): 'low' | 'medium' | 'high' | 'critical' {
  if (type === 'ranking_loss' || type === 'position_change') {
    const positionChange = conditions.find(c => c.metric === 'position');
    if (positionChange && positionChange.value >= 10) return 'critical';
    if (positionChange && positionChange.value >= 5) return 'high';
    return 'medium';
  }
  
  if (type === 'volume_change') {
    const volumeChange = conditions.find(c => c.metric === 'search_volume');
    if (volumeChange && volumeChange.value >= 100) return 'high';
    if (volumeChange && volumeChange.value >= 50) return 'medium';
    return 'low';
  }
  
  return 'medium';
}

// Generar recomendaciones para la configuración
function generateAlertRecommendations(config: AlertConfigurationRequest): string[] {
  const recommendations: string[] = [];
  
  if (config.type === 'position_change') {
    recommendations.push('Considera configurar alertas escalonadas (ej: 3, 5, 10 posiciones)');
    recommendations.push('Incluye timeframe de 7d para evitar fluctuaciones diarias');
  }
  
  if (config.type === 'volume_change') {
    recommendations.push('Usa timeframe de 30d para cambios de volumen más estables');
    recommendations.push('Considera alertas bidireccionales (aumentos y disminuciones)');
  }
  
  if (config.keywords && config.keywords.length > 50) {
    recommendations.push('Considera agrupar keywords similares para reducir ruido');
  }
  
  if (config.notifications.frequency === 'immediate') {
    recommendations.push('Frecuencia inmediata puede generar muchas notificaciones');
    recommendations.push('Considera usar frecuencia diaria para alertas menos críticas');
  }
  
  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    const body: AlertConfigurationRequest = await request.json();
    
    // Validar configuración
    const validationErrors = validateAlertConfiguration(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Errores de validación',
          details: validationErrors
        },
        { status: 400 }
      );
    }
    
    // Crear nueva alerta
    const newAlert: AlertRule = {
      id: generateAlertId(),
      type: body.type,
      name: body.name,
      description: body.description || '',
      keywords: body.keywords || [],
      domain: body.domain,
      conditions: body.conditions.map(condition => ({
        ...condition,
        timeframe: condition.timeframe || '7d'
      })),
      notifications: {
        email: body.notifications.email || false,
        webhook: body.notifications.webhook,
        frequency: body.notifications.frequency
      },
      isActive: body.isActive !== false,
      createdAt: new Date().toISOString(),
      triggerCount: 0
    };
    
    // Simular guardado en base de datos
    alertsDatabase.push(newAlert);
    
    // Calcular estadísticas
    const severity = calculateAlertSeverity(body.type, body.conditions);
    const estimatedTriggers = Math.floor(Math.random() * 10) + 1; // Por mes
    
    // Generar recomendaciones
    const recommendations = generateAlertRecommendations(body);
    
    // Simular configuración de webhook si se proporciona
    let webhookStatus;
    if (body.notifications.webhook) {
      webhookStatus = {
        url: body.notifications.webhook,
        status: 'verified',
        lastTest: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 200) + 50 // ms
      };
    }
    
    return NextResponse.json({
      success: true,
      data: {
        alert: newAlert,
        configuration: {
          severity,
          estimatedTriggersPerMonth: estimatedTriggers,
          keywordsMonitored: body.keywords?.length || 0,
          conditionsCount: body.conditions.length,
          notificationMethods: [
            body.notifications.email ? 'email' : null,
            body.notifications.webhook ? 'webhook' : null
          ].filter(Boolean)
        },
        webhook: webhookStatus,
        recommendations,
        nextSteps: [
          'La alerta está activa y monitoreando',
          'Recibirás notificaciones según la frecuencia configurada',
          'Puedes modificar o pausar la alerta en cualquier momento',
          'Revisa el historial de triggers regularmente'
        ]
      }
    });
    
  } catch (error) {
    console.error('Error configuring alert:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');
    const domain = searchParams.get('domain');
    const type = searchParams.get('type');
    const status = searchParams.get('status'); // active, inactive, all
    const includeHistory = searchParams.get('includeHistory') === 'true';
    
    if (alertId) {
      // Obtener alerta específica
      const alert = alertsDatabase.find(a => a.id === alertId);
      if (!alert) {
        return NextResponse.json(
          { error: 'Alerta no encontrada' },
          { status: 404 }
        );
      }
      
      let history;
      if (includeHistory) {
        history = alertTriggersDatabase
          .filter(t => t.alertId === alertId)
          .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
      }
      
      return NextResponse.json({
        success: true,
        data: {
          alert,
          history,
          stats: {
            totalTriggers: alert.triggerCount,
            lastTriggered: alert.lastTriggered,
            avgTriggersPerWeek: Math.round(alert.triggerCount / 4),
            acknowledgedTriggers: history?.filter(h => h.acknowledged).length || 0
          }
        }
      });
    }
    
    // Filtrar alertas
    let filteredAlerts = alertsDatabase;
    
    if (domain) {
      filteredAlerts = filteredAlerts.filter(a => a.domain === domain);
    }
    
    if (type) {
      filteredAlerts = filteredAlerts.filter(a => a.type === type);
    }
    
    if (status && status !== 'all') {
      const isActive = status === 'active';
      filteredAlerts = filteredAlerts.filter(a => a.isActive === isActive);
    }
    
    // Obtener triggers recientes
    const recentTriggers = alertTriggersDatabase
      .filter(t => filteredAlerts.some(a => a.id === t.alertId))
      .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
      .slice(0, 10);
    
    // Calcular estadísticas generales
    const stats = {
      totalAlerts: filteredAlerts.length,
      activeAlerts: filteredAlerts.filter(a => a.isActive).length,
      totalTriggers: filteredAlerts.reduce((sum, a) => sum + a.triggerCount, 0),
      unacknowledgedTriggers: recentTriggers.filter(t => !t.acknowledged).length,
      alertsByType: {
        position_change: filteredAlerts.filter(a => a.type === 'position_change').length,
        volume_change: filteredAlerts.filter(a => a.type === 'volume_change').length,
        new_competitor: filteredAlerts.filter(a => a.type === 'new_competitor').length,
        serp_feature: filteredAlerts.filter(a => a.type === 'serp_feature').length,
        ranking_loss: filteredAlerts.filter(a => a.type === 'ranking_loss').length,
        opportunity: filteredAlerts.filter(a => a.type === 'opportunity').length
      },
      triggersBySeverity: {
        critical: recentTriggers.filter(t => t.severity === 'critical').length,
        high: recentTriggers.filter(t => t.severity === 'high').length,
        medium: recentTriggers.filter(t => t.severity === 'medium').length,
        low: recentTriggers.filter(t => t.severity === 'low').length
      }
    };
    
    return NextResponse.json({
      success: true,
      data: {
        alerts: filteredAlerts,
        recentTriggers,
        stats,
        availableTypes: [
          'position_change',
          'volume_change', 
          'new_competitor',
          'serp_feature',
          'ranking_loss',
          'opportunity'
        ],
        availableOperators: [
          'greater_than',
          'less_than',
          'equals',
          'not_equals',
          'increases_by',
          'decreases_by'
        ]
      }
    });
    
  } catch (error) {
    console.error('Error getting alerts:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT endpoint para actualizar alertas
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');
    
    if (!alertId) {
      return NextResponse.json(
        { error: 'ID de alerta requerido' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const alertIndex = alertsDatabase.findIndex(a => a.id === alertId);
    
    if (alertIndex === -1) {
      return NextResponse.json(
        { error: 'Alerta no encontrada' },
        { status: 404 }
      );
    }
    
    // Actualizar alerta
    alertsDatabase[alertIndex] = {
      ...alertsDatabase[alertIndex],
      ...body,
      id: alertId, // Mantener ID original
      createdAt: alertsDatabase[alertIndex].createdAt // Mantener fecha de creación
    };
    
    return NextResponse.json({
      success: true,
      data: {
        alert: alertsDatabase[alertIndex],
        message: 'Alerta actualizada correctamente'
      }
    });
    
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE endpoint para eliminar alertas
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');
    
    if (!alertId) {
      return NextResponse.json(
        { error: 'ID de alerta requerido' },
        { status: 400 }
      );
    }
    
    const alertIndex = alertsDatabase.findIndex(a => a.id === alertId);
    
    if (alertIndex === -1) {
      return NextResponse.json(
        { error: 'Alerta no encontrada' },
        { status: 404 }
      );
    }
    
    // Eliminar alerta
    const deletedAlert = alertsDatabase.splice(alertIndex, 1)[0];
    
    // Eliminar triggers asociados
    const triggersToDelete = alertTriggersDatabase.filter(t => t.alertId === alertId);
    triggersToDelete.forEach(trigger => {
      const triggerIndex = alertTriggersDatabase.findIndex(t => t.id === trigger.id);
      if (triggerIndex !== -1) {
        alertTriggersDatabase.splice(triggerIndex, 1);
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        deletedAlert,
        deletedTriggers: triggersToDelete.length,
        message: 'Alerta eliminada correctamente'
      }
    });
    
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}