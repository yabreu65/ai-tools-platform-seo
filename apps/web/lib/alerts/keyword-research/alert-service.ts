/**
 * Sistema de alertas y seguimiento de rankings para Keyword Research Tool
 * Gestiona alertas automáticas basadas en cambios de rankings y métricas
 */

interface KeywordAlert {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  conditions: AlertCondition[];
  notifications: NotificationConfig[];
  isActive: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface AlertCondition {
  id: string;
  type: 'ranking_change' | 'volume_change' | 'difficulty_change' | 'new_competitor' | 'serp_feature';
  operator: 'increases' | 'decreases' | 'equals' | 'greater_than' | 'less_than' | 'changes_by';
  value: number | string;
  threshold?: number;
  timeframe: 'day' | 'week' | 'month';
}

interface NotificationConfig {
  type: 'email' | 'webhook' | 'dashboard';
  enabled: boolean;
  settings: {
    email?: string;
    webhookUrl?: string;
    includeDetails?: boolean;
    format?: 'summary' | 'detailed';
  };
}

interface RankingData {
  keyword: string;
  position: number;
  url: string;
  date: string;
  volume: number;
  difficulty: number;
  cpc: number;
  serpFeatures: string[];
  competitors: Array<{
    domain: string;
    position: number;
    url: string;
  }>;
}

interface AlertTrigger {
  alertId: string;
  conditionId: string;
  keyword: string;
  oldValue: any;
  newValue: any;
  change: number | string;
  triggeredAt: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

interface TrackingConfig {
  keywords: string[];
  domains: string[];
  locations: string[];
  devices: ('desktop' | 'mobile' | 'tablet')[];
  frequency: 'daily' | 'weekly';
  includeCompetitors: boolean;
  maxCompetitors: number;
}

class AlertService {
  private alerts: Map<string, KeywordAlert> = new Map();
  private trackingData: Map<string, RankingData[]> = new Map();
  private activeTracking: Map<string, TrackingConfig> = new Map();

  /**
   * Crea una nueva alerta
   */
  createAlert(alertData: Omit<KeywordAlert, 'id' | 'createdAt' | 'triggerCount'>): KeywordAlert {
    const alert: KeywordAlert = {
      ...alertData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      triggerCount: 0
    };

    this.alerts.set(alert.id, alert);
    return alert;
  }

  /**
   * Actualiza una alerta existente
   */
  updateAlert(alertId: string, updates: Partial<KeywordAlert>): KeywordAlert | null {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;

    const updatedAlert = { ...alert, ...updates };
    this.alerts.set(alertId, updatedAlert);
    return updatedAlert;
  }

  /**
   * Elimina una alerta
   */
  deleteAlert(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }

  /**
   * Obtiene todas las alertas
   */
  getAlerts(): KeywordAlert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Obtiene una alerta específica
   */
  getAlert(alertId: string): KeywordAlert | null {
    return this.alerts.get(alertId) || null;
  }

  /**
   * Configura seguimiento de rankings
   */
  setupRankingTracking(config: TrackingConfig): string {
    const trackingId = this.generateId();
    this.activeTracking.set(trackingId, config);
    
    // Inicializar datos de seguimiento
    config.keywords.forEach(keyword => {
      if (!this.trackingData.has(keyword)) {
        this.trackingData.set(keyword, []);
      }
    });

    return trackingId;
  }

  /**
   * Actualiza datos de ranking
   */
  updateRankingData(keyword: string, data: RankingData): void {
    const existingData = this.trackingData.get(keyword) || [];
    existingData.push(data);
    
    // Mantener solo los últimos 90 días
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    
    const filteredData = existingData.filter(d => 
      new Date(d.date) >= cutoffDate
    );
    
    this.trackingData.set(keyword, filteredData);
    
    // Verificar alertas
    this.checkAlerts(keyword, data);
  }

  /**
   * Obtiene datos de ranking históricos
   */
  getRankingHistory(keyword: string, days: number = 30): RankingData[] {
    const data = this.trackingData.get(keyword) || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return data.filter(d => new Date(d.date) >= cutoffDate)
               .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Verifica alertas para un keyword específico
   */
  private async checkAlerts(keyword: string, currentData: RankingData): Promise<void> {
    const relevantAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.isActive && alert.keywords.includes(keyword));

    for (const alert of relevantAlerts) {
      const triggers = await this.evaluateAlertConditions(alert, keyword, currentData);
      
      if (triggers.length > 0) {
        await this.triggerAlert(alert, triggers);
      }
    }
  }

  /**
   * Evalúa condiciones de alerta
   */
  private async evaluateAlertConditions(
    alert: KeywordAlert, 
    keyword: string, 
    currentData: RankingData
  ): Promise<AlertTrigger[]> {
    const triggers: AlertTrigger[] = [];
    const historicalData = this.getRankingHistory(keyword, 30);
    
    if (historicalData.length < 2) return triggers;

    const previousData = historicalData[historicalData.length - 2];

    for (const condition of alert.conditions) {
      const trigger = await this.evaluateCondition(
        alert.id,
        condition,
        keyword,
        previousData,
        currentData
      );

      if (trigger) {
        triggers.push(trigger);
      }
    }

    return triggers;
  }

  /**
   * Evalúa una condición específica
   */
  private async evaluateCondition(
    alertId: string,
    condition: AlertCondition,
    keyword: string,
    previousData: RankingData,
    currentData: RankingData
  ): Promise<AlertTrigger | null> {
    let triggered = false;
    let oldValue: any;
    let newValue: any;
    let change: number | string = 0;
    let message = '';
    let severity: 'low' | 'medium' | 'high' = 'low';

    switch (condition.type) {
      case 'ranking_change':
        oldValue = previousData.position;
        newValue = currentData.position;
        change = oldValue - newValue; // Positivo = mejora, negativo = empeora
        
        switch (condition.operator) {
          case 'increases':
            triggered = change < 0 && Math.abs(change) >= (condition.threshold || 1);
            message = `Ranking dropped by ${Math.abs(change)} positions`;
            severity = Math.abs(change) > 5 ? 'high' : 'medium';
            break;
          case 'decreases':
            triggered = change > 0 && change >= (condition.threshold || 1);
            message = `Ranking improved by ${change} positions`;
            severity = change > 5 ? 'high' : 'medium';
            break;
          case 'changes_by':
            triggered = Math.abs(change) >= (condition.value as number);
            message = `Ranking changed by ${change} positions`;
            severity = Math.abs(change) > 10 ? 'high' : 'medium';
            break;
        }
        break;

      case 'volume_change':
        oldValue = previousData.volume;
        newValue = currentData.volume;
        change = ((newValue - oldValue) / oldValue) * 100;
        
        switch (condition.operator) {
          case 'increases':
            triggered = change > (condition.value as number);
            message = `Search volume increased by ${change.toFixed(1)}%`;
            severity = change > 50 ? 'high' : 'medium';
            break;
          case 'decreases':
            triggered = change < -(condition.value as number);
            message = `Search volume decreased by ${Math.abs(change).toFixed(1)}%`;
            severity = Math.abs(change) > 50 ? 'high' : 'medium';
            break;
        }
        break;

      case 'difficulty_change':
        oldValue = previousData.difficulty;
        newValue = currentData.difficulty;
        change = newValue - oldValue;
        
        switch (condition.operator) {
          case 'increases':
            triggered = change > (condition.value as number);
            message = `Keyword difficulty increased by ${change}`;
            severity = change > 10 ? 'high' : 'medium';
            break;
          case 'decreases':
            triggered = change < -(condition.value as number);
            message = `Keyword difficulty decreased by ${Math.abs(change)}`;
            severity = 'low';
            break;
        }
        break;

      case 'new_competitor':
        const previousCompetitors = new Set(previousData.competitors.map(c => c.domain));
        const newCompetitors = currentData.competitors.filter(c => 
          !previousCompetitors.has(c.domain) && c.position <= 10
        );
        
        if (newCompetitors.length > 0) {
          triggered = true;
          newValue = newCompetitors.map(c => c.domain);
          message = `New competitors in top 10: ${newCompetitors.map(c => c.domain).join(', ')}`;
          severity = newCompetitors.some(c => c.position <= 3) ? 'high' : 'medium';
        }
        break;

      case 'serp_feature':
        const previousFeatures = new Set(previousData.serpFeatures);
        const newFeatures = currentData.serpFeatures.filter(f => !previousFeatures.has(f));
        const lostFeatures = previousData.serpFeatures.filter(f => !currentData.serpFeatures.includes(f));
        
        if (newFeatures.length > 0 || lostFeatures.length > 0) {
          triggered = true;
          message = '';
          if (newFeatures.length > 0) {
            message += `New SERP features: ${newFeatures.join(', ')}`;
          }
          if (lostFeatures.length > 0) {
            message += `${message ? '; ' : ''}Lost SERP features: ${lostFeatures.join(', ')}`;
          }
          severity = 'medium';
        }
        break;
    }

    if (triggered) {
      return {
        alertId,
        conditionId: condition.id,
        keyword,
        oldValue,
        newValue,
        change,
        triggeredAt: new Date().toISOString(),
        severity,
        message
      };
    }

    return null;
  }

  /**
   * Dispara una alerta
   */
  private async triggerAlert(alert: KeywordAlert, triggers: AlertTrigger[]): Promise<void> {
    // Actualizar contador de disparos
    alert.triggerCount++;
    alert.lastTriggered = new Date().toISOString();
    this.alerts.set(alert.id, alert);

    // Enviar notificaciones
    for (const notification of alert.notifications) {
      if (notification.enabled) {
        await this.sendNotification(alert, triggers, notification);
      }
    }
  }

  /**
   * Envía notificación
   */
  private async sendNotification(
    alert: KeywordAlert,
    triggers: AlertTrigger[],
    config: NotificationConfig
  ): Promise<void> {
    const notificationData = {
      alert,
      triggers,
      timestamp: new Date().toISOString()
    };

    switch (config.type) {
      case 'email':
        await this.sendEmailNotification(notificationData, config);
        break;
      case 'webhook':
        await this.sendWebhookNotification(notificationData, config);
        break;
      case 'dashboard':
        await this.sendDashboardNotification(notificationData, config);
        break;
    }
  }

  /**
   * Envía notificación por email
   */
  private async sendEmailNotification(data: any, config: NotificationConfig): Promise<void> {
    // Implementación de envío de email
    console.log('Sending email notification:', {
      to: config.settings.email,
      subject: `Keyword Alert: ${data.alert.name}`,
      triggers: data.triggers.length
    });
  }

  /**
   * Envía notificación por webhook
   */
  private async sendWebhookNotification(data: any, config: NotificationConfig): Promise<void> {
    try {
      const response = await fetch(config.settings.webhookUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        console.error('Webhook notification failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending webhook notification:', error);
    }
  }

  /**
   * Envía notificación al dashboard
   */
  private async sendDashboardNotification(data: any, config: NotificationConfig): Promise<void> {
    // Implementación de notificación en dashboard
    console.log('Dashboard notification:', data);
  }

  /**
   * Obtiene estadísticas de alertas
   */
  getAlertStats(): {
    totalAlerts: number;
    activeAlerts: number;
    triggeredToday: number;
    triggeredThisWeek: number;
    topKeywords: Array<{ keyword: string; triggers: number }>;
  } {
    const alerts = Array.from(this.alerts.values());
    const today = new Date().toDateString();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const triggeredToday = alerts.filter(a => 
      a.lastTriggered && new Date(a.lastTriggered).toDateString() === today
    ).length;

    const triggeredThisWeek = alerts.filter(a => 
      a.lastTriggered && new Date(a.lastTriggered) >= weekAgo
    ).length;

    // Calcular keywords más activos
    const keywordTriggers = new Map<string, number>();
    alerts.forEach(alert => {
      alert.keywords.forEach(keyword => {
        keywordTriggers.set(keyword, (keywordTriggers.get(keyword) || 0) + alert.triggerCount);
      });
    });

    const topKeywords = Array.from(keywordTriggers.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, triggers]) => ({ keyword, triggers }));

    return {
      totalAlerts: alerts.length,
      activeAlerts: alerts.filter(a => a.isActive).length,
      triggeredToday,
      triggeredThisWeek,
      topKeywords
    };
  }

  /**
   * Simula actualización de datos de ranking
   */
  async simulateRankingUpdate(keyword: string): Promise<RankingData> {
    const existingData = this.getRankingHistory(keyword, 1);
    const lastPosition = existingData.length > 0 ? existingData[0].position : Math.floor(Math.random() * 50) + 1;
    
    // Simular cambio de posición
    const positionChange = Math.floor(Math.random() * 10) - 5; // -5 a +5
    const newPosition = Math.max(1, Math.min(100, lastPosition + positionChange));

    const rankingData: RankingData = {
      keyword,
      position: newPosition,
      url: `https://example.com/${keyword.replace(/\s+/g, '-')}`,
      date: new Date().toISOString(),
      volume: Math.floor(Math.random() * 10000) + 1000,
      difficulty: Math.floor(Math.random() * 100),
      cpc: Math.random() * 5 + 0.5,
      serpFeatures: this.generateRandomSerpFeatures(),
      competitors: this.generateRandomCompetitors()
    };

    this.updateRankingData(keyword, rankingData);
    return rankingData;
  }

  /**
   * Genera características SERP aleatorias
   */
  private generateRandomSerpFeatures(): string[] {
    const allFeatures = [
      'featured_snippet', 'people_also_ask', 'local_pack', 'knowledge_panel',
      'image_pack', 'video_carousel', 'shopping_results', 'news_results'
    ];
    
    const numFeatures = Math.floor(Math.random() * 4) + 1;
    const shuffled = allFeatures.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numFeatures);
  }

  /**
   * Genera competidores aleatorios
   */
  private generateRandomCompetitors(): Array<{ domain: string; position: number; url: string }> {
    const domains = [
      'competitor1.com', 'competitor2.com', 'competitor3.com',
      'competitor4.com', 'competitor5.com', 'example.org',
      'testsite.net', 'demo.co', 'sample.io', 'rival.com'
    ];

    const competitors = [];
    const usedPositions = new Set<number>();

    for (let i = 0; i < Math.min(10, domains.length); i++) {
      let position;
      do {
        position = Math.floor(Math.random() * 10) + 1;
      } while (usedPositions.has(position));
      
      usedPositions.add(position);
      
      competitors.push({
        domain: domains[i],
        position,
        url: `https://${domains[i]}/page-${position}`
      });
    }

    return competitors.sort((a, b) => a.position - b.position);
  }

  /**
   * Genera ID único
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Plantillas de alertas predefinidas
   */
  getAlertTemplates(): Array<{
    name: string;
    description: string;
    conditions: Omit<AlertCondition, 'id'>[];
    frequency: 'daily' | 'weekly' | 'monthly';
  }> {
    return [
      {
        name: 'Ranking Drop Alert',
        description: 'Alert when keyword ranking drops significantly',
        conditions: [{
          type: 'ranking_change',
          operator: 'increases',
          value: 5,
          timeframe: 'day'
        }],
        frequency: 'daily'
      },
      {
        name: 'New Competitor Alert',
        description: 'Alert when new competitors appear in top 10',
        conditions: [{
          type: 'new_competitor',
          operator: 'changes_by',
          value: 1,
          timeframe: 'day'
        }],
        frequency: 'daily'
      },
      {
        name: 'Volume Spike Alert',
        description: 'Alert when search volume increases significantly',
        conditions: [{
          type: 'volume_change',
          operator: 'increases',
          value: 25,
          timeframe: 'week'
        }],
        frequency: 'weekly'
      },
      {
        name: 'SERP Features Change',
        description: 'Alert when SERP features change',
        conditions: [{
          type: 'serp_feature',
          operator: 'changes_by',
          value: 1,
          timeframe: 'day'
        }],
        frequency: 'daily'
      }
    ];
  }
}

export default AlertService;
export type { 
  KeywordAlert, 
  AlertCondition, 
  NotificationConfig, 
  RankingData, 
  AlertTrigger, 
  TrackingConfig 
};