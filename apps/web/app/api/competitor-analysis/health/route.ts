import { NextRequest, NextResponse } from 'next/server';
import { getN8nService } from '../../../../lib/services/n8n-integration';
import { ensureDbConnection } from '../../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const n8nService = getN8nService();
    
    // Check n8n service health
    const n8nHealth = await n8nService.healthCheck();
    
    // Check database connection
    let dbHealth = { healthy: false, status: 'Database connection failed' };
    try {
      await ensureDbConnection();
      dbHealth = { healthy: true, status: 'Database connected' };
    } catch (error) {
      dbHealth = { 
        healthy: false, 
        status: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }

    // Get n8n service status
    const serviceStatus = n8nService.getServiceStatus();

    // Overall health status
    const isHealthy = n8nHealth.healthy && dbHealth.healthy;

    const healthResponse = {
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      services: {
        n8n: n8nHealth,
        database: dbHealth,
        circuitBreaker: {
          state: serviceStatus.circuitBreakerState,
          failureCount: serviceStatus.failureCount,
          canMakeRequest: serviceStatus.canMakeRequest
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        n8nBaseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
        hasApiKey: !!process.env.N8N_API_KEY
      }
    };

    return NextResponse.json(
      healthResponse,
      { status: isHealthy ? 200 : 503 }
    );

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        healthy: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}