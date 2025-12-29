import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export interface PlanLimits {
  monthlyAnalysis: number
  monthlyExports: number
  monthlySaves: number
  toolsAccess: string[]
  features: string[]
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    monthlyAnalysis: 10,
    monthlyExports: 3,
    monthlySaves: 5,
    toolsAccess: [
      'generar-titulo-seo',
      'keyword-scraper-tool',
      'seo-audit-tool'
    ],
    features: ['basic-analysis', 'basic-export']
  },
  pro: {
    monthlyAnalysis: 100,
    monthlyExports: 50,
    monthlySaves: 100,
    toolsAccess: ['*'], // All tools
    features: [
      'basic-analysis',
      'basic-export',
      'advanced-analysis',
      'premium-export',
      'custom-templates',
      'priority-support'
    ]
  },
  enterprise: {
    monthlyAnalysis: -1, // Unlimited
    monthlyExports: -1, // Unlimited
    monthlySaves: -1, // Unlimited
    toolsAccess: ['*'], // All tools
    features: [
      'basic-analysis',
      'basic-export',
      'advanced-analysis',
      'premium-export',
      'custom-templates',
      'priority-support',
      'unlimited-analysis',
      'white-label',
      'api-access',
      'dedicated-support'
    ]
  }
}

export interface PlanRestrictionResult {
  allowed: boolean
  reason?: string
  upgradeRequired?: boolean
  currentUsage?: number
  limit?: number
}

export class PlanRestrictionService {
  static canAccessTool(userPlan: string, toolPath: string): boolean {
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free
    
    // If user has access to all tools
    if (limits.toolsAccess.includes('*')) {
      return true
    }
    
    // Check if specific tool is allowed
    return limits.toolsAccess.includes(toolPath)
  }

  static canUseFeature(userPlan: string, feature: string): boolean {
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free
    return limits.features.includes(feature)
  }

  static checkAnalysisLimit(
    userPlan: string,
    currentUsage: number
  ): PlanRestrictionResult {
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free
    
    // Unlimited for enterprise
    if (limits.monthlyAnalysis === -1) {
      return { allowed: true }
    }
    
    if (currentUsage >= limits.monthlyAnalysis) {
      return {
        allowed: false,
        reason: 'Has alcanzado el límite de análisis para este mes',
        upgradeRequired: true,
        currentUsage,
        limit: limits.monthlyAnalysis
      }
    }
    
    return { 
      allowed: true,
      currentUsage,
      limit: limits.monthlyAnalysis
    }
  }

  static checkExportLimit(
    userPlan: string,
    currentUsage: number
  ): PlanRestrictionResult {
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free
    
    // Unlimited for enterprise
    if (limits.monthlyExports === -1) {
      return { allowed: true }
    }
    
    if (currentUsage >= limits.monthlyExports) {
      return {
        allowed: false,
        reason: 'Has alcanzado el límite de exportaciones para este mes',
        upgradeRequired: true,
        currentUsage,
        limit: limits.monthlyExports
      }
    }
    
    return { 
      allowed: true,
      currentUsage,
      limit: limits.monthlyExports
    }
  }

  static checkSaveLimit(
    userPlan: string,
    currentUsage: number
  ): PlanRestrictionResult {
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free
    
    // Unlimited for enterprise
    if (limits.monthlySaves === -1) {
      return { allowed: true }
    }
    
    if (currentUsage >= limits.monthlySaves) {
      return {
        allowed: false,
        reason: 'Has alcanzado el límite de análisis guardados',
        upgradeRequired: true,
        currentUsage,
        limit: limits.monthlySaves
      }
    }
    
    return { 
      allowed: true,
      currentUsage,
      limit: limits.monthlySaves
    }
  }

  static getUpgradeMessage(userPlan: string): string {
    switch (userPlan) {
      case 'free':
        return 'Actualiza a un plan Pro para obtener más análisis y funciones avanzadas'
      case 'pro':
        return 'Actualiza a un plan Enterprise para obtener análisis ilimitados'
      default:
        return 'Contacta con soporte para más información sobre planes'
    }
  }
}

// Middleware function to check plan restrictions
export async function withPlanRestriction(
  request: NextRequest,
  restrictionType: 'analysis' | 'export' | 'save' | 'tool',
  toolPath?: string
) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Get user data (in a real app, this would come from database)
    const userData = {
      plan: 'free', // This should come from the database
      monthlyAnalysisCount: 5,
      monthlyExportCount: 2,
      monthlySaveCount: 3
    }

    let result: PlanRestrictionResult

    switch (restrictionType) {
      case 'analysis':
        result = PlanRestrictionService.checkAnalysisLimit(
          userData.plan,
          userData.monthlyAnalysisCount
        )
        break
      case 'export':
        result = PlanRestrictionService.checkExportLimit(
          userData.plan,
          userData.monthlyExportCount
        )
        break
      case 'save':
        result = PlanRestrictionService.checkSaveLimit(
          userData.plan,
          userData.monthlySaveCount
        )
        break
      case 'tool':
        if (!toolPath) {
          return NextResponse.json(
            { error: 'Tool path requerido' },
            { status: 400 }
          )
        }
        const canAccess = PlanRestrictionService.canAccessTool(userData.plan, toolPath)
        result = {
          allowed: canAccess,
          reason: canAccess ? undefined : 'Tu plan actual no incluye acceso a esta herramienta',
          upgradeRequired: !canAccess
        }
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de restricción inválido' },
          { status: 400 }
        )
    }

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: result.reason,
          upgradeRequired: result.upgradeRequired,
          upgradeMessage: PlanRestrictionService.getUpgradeMessage(userData.plan),
          currentUsage: result.currentUsage,
          limit: result.limit
        },
        { status: 403 }
      )
    }

    return null // No restriction, continue
  } catch (error) {
    console.error('Error checking plan restrictions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}