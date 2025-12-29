// Configuración centralizada para n8n
export const n8nConfig = {
  // URLs base
  baseUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook',
  apiKey: process.env.N8N_API_KEY || '',
  webhookSecret: process.env.N8N_WEBHOOK_SECRET || '',
  
  // URLs específicas de webhooks
  webhooks: {
    competitor: process.env.N8N_COMPETITOR_WEBHOOK || 'http://localhost:5678/webhook/competitor-analysis',
    technical: process.env.N8N_TECHNICAL_WEBHOOK || 'http://localhost:5678/webhook/seo-technical-analysis',
    content: process.env.N8N_CONTENT_WEBHOOK || 'http://localhost:5678/webhook/keyword-content-analysis',
    backlinks: process.env.N8N_BACKLINK_WEBHOOK || 'http://localhost:5678/webhook/backlink-analysis'
  },
  
  // Configuración de timeouts y reintentos
  timeout: parseInt(process.env.N8N_TIMEOUT_MS || '300000'), // 5 minutos
  retryAttempts: parseInt(process.env.N8N_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.N8N_RETRY_DELAY_MS || '5000'), // 5 segundos
  
  // Headers por defecto
  defaultHeaders: {
    'Content-Type': 'application/json',
    'User-Agent': 'SEO-Tools-Platform/1.0',
    ...(process.env.N8N_API_KEY && {
      'Authorization': `Bearer ${process.env.N8N_API_KEY}`
    })
  }
};

// Tipos para las payloads de n8n
export interface N8nWebhookPayload {
  analysisId: string;
  type: 'competitor' | 'technical' | 'content' | 'backlinks';
  data: any;
  config?: {
    timeout?: number;
    retries?: number;
    priority?: 'low' | 'normal' | 'high';
  };
}

export interface N8nCompetitorPayload extends N8nWebhookPayload {
  type: 'competitor';
  data: {
    competitors: string[];
    analysisType: 'basic' | 'advanced' | 'comprehensive';
    targetKeywords?: string[];
    userPlan: string;
  };
}

export interface N8nTechnicalPayload extends N8nWebhookPayload {
  type: 'technical';
  data: {
    url: string;
    analysisDepth: 'basic' | 'standard' | 'advanced';
    checks: string[];
  };
}

export interface N8nContentPayload extends N8nWebhookPayload {
  type: 'content';
  data: {
    url: string;
    targetKeywords: string[];
    analysisDepth: 'basic' | 'standard' | 'advanced';
    includeAI?: boolean;
  };
}

export interface N8nBacklinkPayload extends N8nWebhookPayload {
  type: 'backlinks';
  data: {
    url: string;
    competitors: string[];
    analysisDepth: 'basic' | 'standard' | 'advanced';
  };
}

// Función helper para enviar webhooks a n8n
export async function sendN8nWebhook(
  type: 'competitor' | 'technical' | 'content' | 'backlinks',
  payload: N8nWebhookPayload
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const webhookUrl = n8nConfig.webhooks[type];
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: n8nConfig.defaultHeaders,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(n8nConfig.timeout)
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      jobId: result.jobId || result.executionId,
      ...result
    };

  } catch (error) {
    console.error(`Error sending ${type} webhook to n8n:`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Función helper para validar la configuración de n8n
export function validateN8nConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!n8nConfig.baseUrl) {
    errors.push('N8N_WEBHOOK_URL is required');
  }
  
  if (!n8nConfig.webhooks.competitor) {
    errors.push('N8N_COMPETITOR_WEBHOOK is required');
  }
  
  if (!n8nConfig.webhooks.technical) {
    errors.push('N8N_TECHNICAL_WEBHOOK is required');
  }
  
  if (!n8nConfig.webhooks.content) {
    errors.push('N8N_CONTENT_WEBHOOK is required');
  }
  
  if (!n8nConfig.webhooks.backlinks) {
    errors.push('N8N_BACKLINK_WEBHOOK is required');
  }
  
  if (n8nConfig.timeout < 30000) {
    errors.push('N8N_TIMEOUT_MS should be at least 30000 (30 seconds)');
  }
  
  if (n8nConfig.retryAttempts < 1 || n8nConfig.retryAttempts > 5) {
    errors.push('N8N_RETRY_ATTEMPTS should be between 1 and 5');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Función helper para generar IDs únicos para análisis
export function generateAnalysisId(type: string, baseId?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  if (baseId) {
    return `${baseId}_${type}_${timestamp}_${random}`;
  }
  
  return `${type}_${timestamp}_${random}`;
}

// Función helper para extraer información del analysisId
export function parseAnalysisId(analysisId: string): {
  parentId?: string;
  type: string;
  timestamp: number;
  random: string;
} {
  const parts = analysisId.split('_');
  
  if (parts.length >= 4) {
    // Format: parentId_type_timestamp_random
    return {
      parentId: parts[0],
      type: parts[1],
      timestamp: parseInt(parts[2]),
      random: parts[3]
    };
  } else if (parts.length === 3) {
    // Format: type_timestamp_random
    return {
      type: parts[0],
      timestamp: parseInt(parts[1]),
      random: parts[2]
    };
  }
  
  // Fallback
  return {
    type: 'unknown',
    timestamp: Date.now(),
    random: 'unknown'
  };
}