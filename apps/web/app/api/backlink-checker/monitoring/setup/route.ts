import { NextRequest, NextResponse } from 'next/server';

interface MonitoringSetupRequest {
  domain: string;
  monitoringName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  alertThreshold: number;
  trackingOptions: {
    newBacklinks: boolean;
    lostBacklinks: boolean;
    toxicBacklinks: boolean;
    authorityChanges: boolean;
    anchorTextChanges: boolean;
    competitorBacklinks: boolean;
  };
  competitors?: string[];
  notificationSettings: {
    email: boolean;
    emailAddress?: string;
    webhook: boolean;
    webhookUrl?: string;
    inApp: boolean;
  };
  advancedFilters?: {
    minDomainAuthority?: number;
    excludeDomains?: string[];
    includeNofollow?: boolean;
    languageFilter?: string[];
    countryFilter?: string[];
  };
}

interface MonitoringConfig {
  id: string;
  domain: string;
  monitoringName: string;
  status: 'active' | 'paused' | 'setup';
  frequency: 'daily' | 'weekly' | 'monthly';
  alertThreshold: number;
  trackingOptions: {
    newBacklinks: boolean;
    lostBacklinks: boolean;
    toxicBacklinks: boolean;
    authorityChanges: boolean;
    anchorTextChanges: boolean;
    competitorBacklinks: boolean;
  };
  competitors: string[];
  notificationSettings: {
    email: boolean;
    emailAddress?: string;
    webhook: boolean;
    webhookUrl?: string;
    inApp: boolean;
  };
  advancedFilters: {
    minDomainAuthority?: number;
    excludeDomains?: string[];
    includeNofollow?: boolean;
    languageFilter?: string[];
    countryFilter?: string[];
  };
  createdAt: string;
  lastCheck?: string;
  nextCheck: string;
  totalChecks: number;
  alertsGenerated: number;
  currentMetrics: {
    totalBacklinks: number;
    referringDomains: number;
    domainAuthority: number;
    toxicScore: number;
    newBacklinksToday: number;
    lostBacklinksToday: number;
  };
}

interface MonitoringSetupResponse {
  success: boolean;
  data?: {
    monitoringConfig: MonitoringConfig;
    estimatedCrawlTime: string;
    nextCheckDate: string;
    setupComplete: boolean;
  };
  message?: string;
}

// Calcular próxima fecha de verificación
const calculateNextCheck = (frequency: string): string => {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
  }
  return now.toISOString();
};

// Generar métricas actuales simuladas
const generateCurrentMetrics = (domain: string) => {
  return {
    totalBacklinks: Math.floor(Math.random() * 10000) + 1000,
    referringDomains: Math.floor(Math.random() * 1000) + 100,
    domainAuthority: Math.floor(Math.random() * 60) + 30,
    toxicScore: Math.floor(Math.random() * 30) + 5,
    newBacklinksToday: Math.floor(Math.random() * 20),
    lostBacklinksToday: Math.floor(Math.random() * 15)
  };
};

// Estimar tiempo de crawl basado en configuración
const estimateCrawlTime = (trackingOptions: any, competitors: string[]): string => {
  let baseTime = 15; // minutos base
  
  // Agregar tiempo por cada opción de tracking
  const activeOptions = Object.values(trackingOptions).filter(Boolean).length;
  baseTime += activeOptions * 5;
  
  // Agregar tiempo por competidores
  baseTime += competitors.length * 10;
  
  if (baseTime < 60) {
    return `${baseTime} minutos`;
  } else {
    const hours = Math.floor(baseTime / 60);
    const minutes = baseTime % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body: MonitoringSetupRequest = await request.json();
    
    // Validaciones
    if (!body.domain) {
      return NextResponse.json(
        { success: false, message: 'Domain is required' },
        { status: 400 }
      );
    }

    if (!body.monitoringName) {
      return NextResponse.json(
        { success: false, message: 'Monitoring name is required' },
        { status: 400 }
      );
    }

    if (body.notificationSettings.email && !body.notificationSettings.emailAddress) {
      return NextResponse.json(
        { success: false, message: 'Email address is required when email notifications are enabled' },
        { status: 400 }
      );
    }

    if (body.notificationSettings.webhook && !body.notificationSettings.webhookUrl) {
      return NextResponse.json(
        { success: false, message: 'Webhook URL is required when webhook notifications are enabled' },
        { status: 400 }
      );
    }

    // Simular tiempo de configuración
    await new Promise(resolve => setTimeout(resolve, 1500));

    const competitors = body.competitors || [];
    const nextCheck = calculateNextCheck(body.frequency);
    const currentMetrics = generateCurrentMetrics(body.domain);
    const estimatedCrawlTime = estimateCrawlTime(body.trackingOptions, competitors);

    // Crear configuración de monitoreo
    const monitoringConfig: MonitoringConfig = {
      id: `monitor_${Date.now()}`,
      domain: body.domain,
      monitoringName: body.monitoringName,
      status: 'active',
      frequency: body.frequency,
      alertThreshold: body.alertThreshold,
      trackingOptions: body.trackingOptions,
      competitors,
      notificationSettings: body.notificationSettings,
      advancedFilters: body.advancedFilters || {},
      createdAt: new Date().toISOString(),
      nextCheck,
      totalChecks: 0,
      alertsGenerated: 0,
      currentMetrics
    };

    const response: MonitoringSetupResponse = {
      success: true,
      data: {
        monitoringConfig,
        estimatedCrawlTime,
        nextCheckDate: nextCheck,
        setupComplete: true
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error setting up monitoring:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET para obtener configuraciones existentes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json(
        { success: false, message: 'Domain parameter is required' },
        { status: 400 }
      );
    }

    // Simular configuraciones existentes
    const existingConfigs: MonitoringConfig[] = [
      {
        id: 'monitor_1',
        domain,
        monitoringName: 'Main Domain Monitoring',
        status: 'active',
        frequency: 'daily',
        alertThreshold: 10,
        trackingOptions: {
          newBacklinks: true,
          lostBacklinks: true,
          toxicBacklinks: true,
          authorityChanges: false,
          anchorTextChanges: false,
          competitorBacklinks: false
        },
        competitors: ['competitor1.com', 'competitor2.com'],
        notificationSettings: {
          email: true,
          emailAddress: 'admin@example.com',
          webhook: false,
          inApp: true
        },
        advancedFilters: {
          minDomainAuthority: 20,
          includeNofollow: false
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastCheck: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        nextCheck: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
        totalChecks: 7,
        alertsGenerated: 3,
        currentMetrics: generateCurrentMetrics(domain)
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        configurations: existingConfigs,
        totalActive: existingConfigs.filter(config => config.status === 'active').length,
        totalPaused: existingConfigs.filter(config => config.status === 'paused').length
      }
    });
  } catch (error) {
    console.error('Error fetching monitoring configurations:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}