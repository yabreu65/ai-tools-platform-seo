'use client'

import { useState } from 'react'
import { AlertTriangle, Crown, X, ArrowRight, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

interface PlanUpgradePromptProps {
  currentPlan: string
  usageType: 'analysis' | 'export' | 'save'
  currentUsage: number
  limit: number
  onDismiss?: () => void
  showDismiss?: boolean
}

export function PlanUpgradePrompt({
  currentPlan,
  usageType,
  currentUsage,
  limit,
  onDismiss,
  showDismiss = true
}: PlanUpgradePromptProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const usagePercentage = Math.min((currentUsage / limit) * 100, 100)
  const isNearLimit = usagePercentage >= 80
  const isAtLimit = currentUsage >= limit

  const getTypeConfig = () => {
    switch (usageType) {
      case 'analysis':
        return {
          title: isAtLimit ? 'Límite de análisis alcanzado' : 'Te estás acercando al límite de análisis',
          description: isAtLimit 
            ? 'Has usado todos tus análisis mensuales. Actualiza tu plan para continuar.'
            : `Has usado ${currentUsage} de ${limit} análisis este mes.`,
          feature: 'análisis mensuales'
        }
      case 'export':
        return {
          title: isAtLimit ? 'Límite de exportaciones alcanzado' : 'Te estás acercando al límite de exportaciones',
          description: isAtLimit
            ? 'Has usado todas tus exportaciones mensuales. Actualiza tu plan para continuar.'
            : `Has usado ${currentUsage} de ${limit} exportaciones este mes.`,
          feature: 'exportaciones mensuales'
        }
      case 'save':
        return {
          title: isAtLimit ? 'Límite de guardados alcanzado' : 'Te estás acercando al límite de guardados',
          description: isAtLimit
            ? 'Has usado todos tus análisis guardados. Actualiza tu plan para continuar.'
            : `Has guardado ${currentUsage} de ${limit} análisis.`,
          feature: 'análisis guardados'
        }
    }
  }

  const getPlanUpgrade = () => {
    switch (currentPlan) {
      case 'free':
        return {
          targetPlan: 'Pro',
          benefits: ['100 análisis mensuales', '50 exportaciones', '100 análisis guardados', 'Herramientas avanzadas'],
          price: '$29/mes',
          icon: Crown
        }
      case 'pro':
        return {
          targetPlan: 'Enterprise',
          benefits: ['Análisis ilimitados', 'Exportaciones ilimitadas', 'Guardados ilimitados', 'Soporte dedicado'],
          price: '$99/mes',
          icon: Crown
        }
      default:
        return {
          targetPlan: 'Pro',
          benefits: ['Más funciones disponibles'],
          price: 'Contactar',
          icon: Crown
        }
    }
  }

  const config = getTypeConfig()
  const upgrade = getPlanUpgrade()

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  // Only show if near limit or at limit
  if (!isNearLimit && !isAtLimit) return null

  return (
    <Card className={`border-2 ${
      isAtLimit 
        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' 
        : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
    }`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-2 rounded-full ${
              isAtLimit 
                ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                : 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
            }`}>
              {isAtLimit ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Zap className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`font-semibold ${
                  isAtLimit 
                    ? 'text-red-800 dark:text-red-200'
                    : 'text-orange-800 dark:text-orange-200'
                }`}>
                  {config.title}
                </h3>
                <Badge variant="outline" className="text-xs">
                  Plan {currentPlan === 'free' ? 'Gratuito' : currentPlan}
                </Badge>
              </div>
              
              <p className={`text-sm mb-3 ${
                isAtLimit 
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-orange-700 dark:text-orange-300'
              }`}>
                {config.description}
              </p>

              {!isAtLimit && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Uso actual</span>
                    <span>{currentUsage}/{limit}</span>
                  </div>
                  <Progress 
                    value={usagePercentage} 
                    className={`h-2 ${
                      usagePercentage >= 90 ? 'bg-red-100' : 'bg-orange-100'
                    }`}
                  />
                </div>
              )}

              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
                <div className="flex items-center gap-2 mb-2">
                  <upgrade.icon className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-sm">Actualiza a {upgrade.targetPlan}</span>
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-xs">
                    {upgrade.price}
                  </Badge>
                </div>
                
                <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                  {upgrade.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href="/precios">
                      Actualizar ahora
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/precios">
                      Ver planes
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {showDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Hook to determine if upgrade prompt should be shown
export function useUpgradePrompt(
  currentPlan: string,
  usage: { monthlyAnalysisCount: number; monthlyExportCount: number; monthlySaveCount: number },
  limits: { monthlyAnalysis: number; monthlyExports: number; monthlySaves: number }
) {
  const shouldShowAnalysisPrompt = () => {
    if (limits.monthlyAnalysis === -1) return false
    const percentage = (usage.monthlyAnalysisCount / limits.monthlyAnalysis) * 100
    return percentage >= 80
  }

  const shouldShowExportPrompt = () => {
    if (limits.monthlyExports === -1) return false
    const percentage = (usage.monthlyExportCount / limits.monthlyExports) * 100
    return percentage >= 80
  }

  const shouldShowSavePrompt = () => {
    if (limits.monthlySaves === -1) return false
    const percentage = (usage.monthlySaveCount / limits.monthlySaves) * 100
    return percentage >= 80
  }

  return {
    showAnalysisPrompt: shouldShowAnalysisPrompt(),
    showExportPrompt: shouldShowExportPrompt(),
    showSavePrompt: shouldShowSavePrompt(),
    hasAnyPrompt: shouldShowAnalysisPrompt() || shouldShowExportPrompt() || shouldShowSavePrompt()
  }
}