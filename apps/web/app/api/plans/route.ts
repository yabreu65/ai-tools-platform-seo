import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
// import { Plan } from '@/shared/types/plan';

// Definición de planes disponibles
const AVAILABLE_PLANS = [
  {
    id: 'free',
    name: 'Gratuito',
    description: 'Perfecto para empezar con análisis básicos',
    price: 0,
    currency: 'USD',
    interval: 'month' as const,
    features: [
      '5 análisis de sitemap por mes',
      '2 exportaciones por mes',
      '5 análisis guardados',
      'Soporte por email'
    ],
    limits: {
      monthlyAnalysis: 5,
      monthlyExports: 2,
      monthlySaves: 5
    },
    popular: false,
    active: true
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Para profesionales que necesitan análisis ilimitados',
    price: 29.99,
    currency: 'USD',
    interval: 'month' as const,
    features: [
      'Análisis ilimitados de sitemap',
      'Exportaciones ilimitadas',
      'Análisis guardados ilimitados',
      'Soporte prioritario 24/7',
      'Análisis avanzados',
      'Reportes personalizados',
      'API access'
    ],
    limits: {
      monthlyAnalysis: -1, // -1 significa ilimitado
      monthlyExports: -1,
      monthlySaves: -1
    },
    popular: true,
    active: true
  },
  {
    id: 'trial',
    name: 'Prueba Premium',
    description: 'Prueba todas las funciones premium por 30 días',
    price: 0,
    currency: 'USD',
    interval: 'month' as const,
    features: [
      'Todas las funciones Premium',
      'Válido por 30 días',
      'Sin compromiso',
      'Cancela en cualquier momento'
    ],
    limits: {
      monthlyAnalysis: -1,
      monthlyExports: -1,
      monthlySaves: -1
    },
    popular: false,
    active: true
  }
];

export async function GET(request: NextRequest) {
  try {
    // Filtrar solo planes activos
    const activePlans = AVAILABLE_PLANS.filter(plan => plan.active);

    return NextResponse.json({
      success: true,
      plans: activePlans,
      userCurrentPlan: 'free' // Demo user plan
    });

  } catch (error) {
    console.error('Error al obtener planes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}