import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

interface PlanLimits {
  monthlyAnalysis: number;
  monthlyExports: number;
  monthlySaves: number;
}

interface PlanUsage {
  monthlyAnalysisCount: number;
  monthlyExportCount: number;
  monthlySaveCount: number;
  usageResetDate: Date;
}

// Límites por plan
const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    monthlyAnalysis: 5,
    monthlyExports: 2,
    monthlySaves: 5
  },
  premium: {
    monthlyAnalysis: -1, // Ilimitado
    monthlyExports: -1,
    monthlySaves: -1
  },
  trial: {
    monthlyAnalysis: -1, // Ilimitado
    monthlyExports: -1,
    monthlySaves: -1
  }
};

export async function GET(request: NextRequest) {
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

    // Obtener usuario actual
    const { UserDatabase } = await import('@/lib/auth');
    const user = await UserDatabase.findById(decoded.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si necesita resetear el uso mensual
    const now = new Date();
    const usageResetDate = user.usageResetDate ? new Date(user.usageResetDate) : now;
    
    if (now >= usageResetDate) {
      // Resetear contadores y actualizar fecha de reset
      const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      await UserDatabase.updateUser(decoded.id, {
        monthlyAnalysisCount: 0,
        monthlyExportCount: 0,
        monthlySaveCount: 0,
        monthlyContentAnalysisCount: 0,
        usageResetDate: nextResetDate
      });

      // Obtener usuario actualizado
      const updatedUser = await UserDatabase.findUserById(decoded.id);
      if (updatedUser) {
        user.monthlyAnalysisCount = updatedUser.monthlyAnalysisCount;
        user.monthlyExportCount = updatedUser.monthlyExportCount;
        user.monthlySaveCount = updatedUser.monthlySaveCount;
        user.usageResetDate = updatedUser.usageResetDate;
      }
    }

    const usage: PlanUsage = {
      monthlyAnalysisCount: user.monthlyAnalysisCount || 0,
      monthlyExportCount: user.monthlyExportCount || 0,
      monthlySaveCount: user.monthlySaveCount || 0,
      usageResetDate: user.usageResetDate || now
    };

    const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;

    return NextResponse.json({
      success: true,
      usage,
      limits,
      plan: user.plan,
      canUseAnalysis: limits.monthlyAnalysis === -1 || usage.monthlyAnalysisCount < limits.monthlyAnalysis,
      canUseExport: limits.monthlyExports === -1 || usage.monthlyExportCount < limits.monthlyExports,
      canUseSave: limits.monthlySaves === -1 || usage.monthlySaveCount < limits.monthlySaves
    });

  } catch (error) {
    console.error('Error al obtener uso del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

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

    // Obtener tipo de uso a incrementar
    const { type } = await request.json();
    
    if (!type || !['analysis', 'export', 'save'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de uso inválido' },
        { status: 400 }
      );
    }

    const usageType = type as 'analysis' | 'export' | 'save';

    // Obtener usuario actual
    const { UserDatabase } = await import('@/lib/auth');
    const user = await UserDatabase.findUserById(decoded.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar límites antes de incrementar
    const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
    const currentUsage = {
      analysis: user.monthlyAnalysisCount || 0,
      export: user.monthlyExportCount || 0,
      save: user.monthlySaveCount || 0
    };

    // Verificar si puede usar la función
    if (usageType === 'analysis' && limits.monthlyAnalysis !== -1 && currentUsage.analysis >= limits.monthlyAnalysis) {
      return NextResponse.json(
        { error: 'Límite de análisis mensuales alcanzado' },
        { status: 403 }
      );
    }
    
    if (usageType === 'export' && limits.monthlyExports !== -1 && currentUsage.export >= limits.monthlyExports) {
      return NextResponse.json(
        { error: 'Límite de exportaciones mensuales alcanzado' },
        { status: 403 }
      );
    }
    
    if (usageType === 'save' && limits.monthlySaves !== -1 && currentUsage.save >= limits.monthlySaves) {
      return NextResponse.json(
        { error: 'Límite de guardados mensuales alcanzado' },
        { status: 403 }
      );
    }

    // Incrementar contador correspondiente
    const updateField = usageType === 'analysis' ? 'monthlyAnalysisCount' : 
                       usageType === 'export' ? 'monthlyExportCount' : 
                       'monthlySaveCount';

    await UserDatabase.updateUser(decoded.id, {
      [updateField]: currentUsage[usageType] + 1
    });

    return NextResponse.json({
      success: true,
      message: `Uso de ${usageType} incrementado exitosamente`
    });

  } catch (error) {
    console.error('Error al incrementar uso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}