import { NextRequest, NextResponse } from 'next/server';

// Interfaces
interface AlertCondition {
  metric: string;
  operator: string;
  value: number;
  threshold?: number;
}

interface Alert {
  id: string;
  name: string;
  type: 'keyword-ranking' | 'backlinks' | 'content' | 'technical' | 'traffic' | 'competitor';
  description: string;
  conditions: AlertCondition;
  frequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  channels: string[];
  domains: string[];
  keywords?: string[];
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface AlertHistory {
  id: string;
  alertId: string;
  alertName: string;
  type: string;
  message: string;
  triggeredAt: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  data: any;
  acknowledged: boolean;
}

// Simulación de base de datos en memoria
let alerts: Alert[] = [];
let alertHistory: AlertHistory[] = [];

// Función para validar dominios
function validateDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

// Función para validar configuración de alerta
function validateAlert(alertData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!alertData.name || alertData.name.trim().length < 3) {
    errors.push('El nombre de la alerta debe tener al menos 3 caracteres');
  }

  if (!alertData.description || alertData.description.trim().length < 10) {
    errors.push('La descripción debe tener al menos 10 caracteres');
  }

  if (!['keyword-ranking', 'backlinks', 'content', 'technical', 'traffic', 'competitor'].includes(alertData.type)) {
    errors.push('Tipo de alerta inválido');
  }

  if (!alertData.domains || alertData.domains.length === 0) {
    errors.push('Debe especificar al menos un dominio');
  } else {
    const invalidDomains = alertData.domains.filter((domain: string) => !validateDomain(domain));
    if (invalidDomains.length > 0) {
      errors.push(`Dominios inválidos: ${invalidDomains.join(', ')}`);
    }
  }

  if (!alertData.conditions || !alertData.conditions.metric || !alertData.conditions.operator || alertData.conditions.value === undefined) {
    errors.push('Condiciones de alerta incompletas');
  }

  if (!['real-time', 'hourly', 'daily', 'weekly', 'monthly'].includes(alertData.frequency)) {
    errors.push('Frecuencia de alerta inválida');
  }

  if (!alertData.channels || alertData.channels.length === 0) {
    errors.push('Debe especificar al menos un canal de notificación');
  }

  if (!['low', 'medium', 'high', 'critical'].includes(alertData.priority)) {
    errors.push('Prioridad de alerta inválida');
  }

  return { isValid: errors.length === 0, errors };
}

// Función para simular el procesamiento de alertas
async function processAlert(alert: Alert): Promise<void> {
  // Simular análisis de competidores
  const shouldTrigger = Math.random() > 0.7; // 30% de probabilidad de activación

  if (shouldTrigger) {
    const historyEntry: AlertHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      alertId: alert.id,
      alertName: alert.name,
      type: alert.type,
      message: generateAlertMessage(alert),
      triggeredAt: new Date().toISOString(),
      severity: getSeverityFromPriority(alert.priority),
      data: generateMockData(alert),
      acknowledged: false
    };

    alertHistory.push(historyEntry);
    
    // Actualizar contador de activaciones
    const alertIndex = alerts.findIndex(a => a.id === alert.id);
    if (alertIndex !== -1) {
      alerts[alertIndex].triggerCount += 1;
      alerts[alertIndex].lastTriggered = new Date().toISOString();
    }

    // Simular envío de notificaciones
    await sendNotifications(alert, historyEntry);
  }
}

function generateAlertMessage(alert: Alert): string {
  const domain = alert.domains[0];
  
  switch (alert.type) {
    case 'keyword-ranking':
      return `Cambio detectado en rankings de keywords para ${domain}`;
    case 'backlinks':
      return `Nuevos backlinks detectados para ${domain}`;
    case 'content':
      return `Nuevo contenido publicado en ${domain}`;
    case 'technical':
      return `Cambios técnicos detectados en ${domain}`;
    case 'traffic':
      return `Variación en tráfico orgánico de ${domain}`;
    case 'competitor':
      return `Actividad competitiva detectada en ${domain}`;
    default:
      return `Alerta activada para ${domain}`;
  }
}

function getSeverityFromPriority(priority: string): 'info' | 'warning' | 'error' | 'critical' {
  switch (priority) {
    case 'critical': return 'critical';
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'info';
  }
}

function generateMockData(alert: Alert): any {
  switch (alert.type) {
    case 'keyword-ranking':
      return {
        keyword: alert.keywords?.[0] || 'keyword ejemplo',
        oldPosition: Math.floor(Math.random() * 10) + 1,
        newPosition: Math.floor(Math.random() * 20) + 1,
        domain: alert.domains[0],
        change: Math.floor(Math.random() * 10) - 5
      };
    case 'backlinks':
      return {
        domain: alert.domains[0],
        newBacklinks: Math.floor(Math.random() * 20) + 1,
        averageDR: Math.floor(Math.random() * 30) + 50,
        topDomains: ['authority-site.com', 'industry-leader.com']
      };
    case 'technical':
      return {
        domain: alert.domains[0],
        oldScore: Math.floor(Math.random() * 20) + 80,
        newScore: Math.floor(Math.random() * 20) + 60,
        issues: ['Core Web Vitals', 'Mobile Usability', 'Page Speed']
      };
    default:
      return { domain: alert.domains[0], timestamp: new Date().toISOString() };
  }
}

async function sendNotifications(alert: Alert, historyEntry: AlertHistory): Promise<void> {
  // Simular envío de notificaciones por diferentes canales
  for (const channel of alert.channels) {
    switch (channel) {
      case 'email':
        console.log(`📧 Email enviado: ${historyEntry.message}`);
        break;
      case 'slack':
        console.log(`💬 Slack notificado: ${historyEntry.message}`);
        break;
      case 'sms':
        console.log(`📱 SMS enviado: ${historyEntry.message}`);
        break;
      case 'webhook':
        console.log(`🔗 Webhook llamado: ${historyEntry.message}`);
        break;
    }
  }
}

// POST - Crear nueva alerta
export async function POST(request: NextRequest) {
  try {
    const alertData = await request.json();

    // Validar datos de entrada
    const validation = validateAlert(alertData);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Datos de alerta inválidos', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Crear nueva alerta
    const newAlert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: alertData.name.trim(),
      type: alertData.type,
      description: alertData.description.trim(),
      conditions: alertData.conditions,
      frequency: alertData.frequency,
      channels: alertData.channels,
      domains: alertData.domains.map((d: string) => d.trim().toLowerCase()),
      keywords: alertData.keywords?.map((k: string) => k.trim()) || [],
      isActive: alertData.isActive !== false,
      createdAt: new Date().toISOString(),
      triggerCount: 0,
      priority: alertData.priority || 'medium'
    };

    // Guardar alerta
    alerts.push(newAlert);

    // Si la alerta está activa, iniciar procesamiento
    if (newAlert.isActive) {
      // Procesar inmediatamente para demostración
      setTimeout(() => processAlert(newAlert), 2000);
    }

    return NextResponse.json({
      success: true,
      alert: newAlert,
      message: 'Alerta creada exitosamente'
    });

  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Obtener alertas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const includeHistory = searchParams.get('includeHistory') === 'true';

    let filteredAlerts = [...alerts];

    // Filtrar por tipo
    if (type && type !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
    }

    // Filtrar por estado
    if (status === 'active') {
      filteredAlerts = filteredAlerts.filter(alert => alert.isActive);
    } else if (status === 'inactive') {
      filteredAlerts = filteredAlerts.filter(alert => !alert.isActive);
    }

    const response: any = {
      success: true,
      alerts: filteredAlerts,
      total: filteredAlerts.length,
      stats: {
        total: alerts.length,
        active: alerts.filter(a => a.isActive).length,
        inactive: alerts.filter(a => !a.isActive).length,
        triggered_today: alertHistory.filter(h => 
          new Date(h.triggeredAt).toDateString() === new Date().toDateString()
        ).length
      }
    };

    if (includeHistory) {
      response.history = alertHistory.sort((a, b) => 
        new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
      );
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar alerta
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');
    
    if (!alertId) {
      return NextResponse.json(
        { error: 'ID de alerta requerido' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const alertIndex = alerts.findIndex(alert => alert.id === alertId);

    if (alertIndex === -1) {
      return NextResponse.json(
        { error: 'Alerta no encontrada' },
        { status: 404 }
      );
    }

    // Validar datos de actualización si se proporcionan
    if (updateData.name || updateData.description || updateData.domains) {
      const validation = validateAlert({ ...alerts[alertIndex], ...updateData });
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            error: 'Datos de actualización inválidos', 
            details: validation.errors 
          },
          { status: 400 }
        );
      }
    }

    // Actualizar alerta
    alerts[alertIndex] = {
      ...alerts[alertIndex],
      ...updateData,
      id: alertId, // Mantener ID original
      createdAt: alerts[alertIndex].createdAt // Mantener fecha de creación
    };

    return NextResponse.json({
      success: true,
      alert: alerts[alertIndex],
      message: 'Alerta actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar alerta
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');
    
    if (!alertId) {
      return NextResponse.json(
        { error: 'ID de alerta requerido' },
        { status: 400 }
      );
    }

    const alertIndex = alerts.findIndex(alert => alert.id === alertId);

    if (alertIndex === -1) {
      return NextResponse.json(
        { error: 'Alerta no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar alerta
    const deletedAlert = alerts.splice(alertIndex, 1)[0];

    // Eliminar historial relacionado (opcional)
    alertHistory = alertHistory.filter(history => history.alertId !== alertId);

    return NextResponse.json({
      success: true,
      deletedAlert,
      message: 'Alerta eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}