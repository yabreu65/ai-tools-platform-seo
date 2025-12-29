import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { PlanSelectionRequest, PlanSelectionResponse } from '@/shared/types/plan';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener datos de la solicitud
    const body: PlanSelectionRequest = await request.json();
    const { plan: planId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID es requerido' },
        { status: 400 }
      );
    }

    // Validar que el plan existe
    const validPlans = ['free', 'premium', 'trial'];
    if (!validPlans.includes(planId)) {
      return NextResponse.json(
        { error: 'Plan inválido' },
        { status: 400 }
      );
    }

    // Simular usuario para demo
    const user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      plan: decoded.plan || 'free'
    };

    // Determinar si requiere pago
    const requiresPayment = planId === 'premium';
    let clientSecret: string | undefined;

    // Si es plan premium, crear Payment Intent con Stripe
    if (requiresPayment) {
      // TODO: Integrar con Stripe
      // Por ahora, simulamos el clientSecret
      clientSecret = `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Actualizar plan del usuario
    const now = new Date();
    let planEndDate: Date | undefined;

    // Calcular fecha de fin según el plan
    if (planId === 'trial') {
      planEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días
    } else if (planId === 'premium') {
      planEndDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()); // 1 mes
    }

    // Simular actualización del usuario para demo
    const updatedUser = {
      ...user,
      plan: planId as 'free' | 'premium' | 'trial',
      planStartDate: now,
      planEndDate,
      stripeCustomerId: undefined,
      stripeSubscriptionId: undefined
    };

    const response: PlanSelectionResponse = {
      success: true,
      message: `Plan ${planId} seleccionado exitosamente`,
      plan: updatedUser.plan
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al seleccionar plan:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}