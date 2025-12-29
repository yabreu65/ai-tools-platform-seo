'use client';

import { AlertTriangle, Crown, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePlan } from '@/contexts/PlanContext';
import Link from 'next/link';

interface PlanLimitWarningProps {
  type: 'analysis' | 'export' | 'save' | 'content-analysis';
  onUpgrade?: () => void;
}

export function PlanLimitWarning({ type, onUpgrade }: PlanLimitWarningProps) {
  const { currentPlan, usage, canCreateAnalysis, canCreateContentAnalysis, canExport, canSaveAnalysis } = usePlan();

  if (!currentPlan || !usage) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'analysis':
        return {
          canUse: canCreateAnalysis(),
          current: usage.analysesThisMonth,
          limit: currentPlan.limits.analysesPerMonth,
          title: 'Límite de análisis alcanzado',
          description: 'Has alcanzado el límite de análisis para este mes.',
          feature: 'análisis'
        };
      case 'content-analysis':
        return {
          canUse: canCreateContentAnalysis(),
          current: usage.contentAnalysesThisMonth,
          limit: currentPlan.limits.contentAnalysesPerMonth,
          title: 'Límite de análisis de contenido alcanzado',
          description: 'Has alcanzado el límite de análisis de contenido para este mes.',
          feature: 'análisis de contenido'
        };
      case 'export':
        return {
          canUse: canExport(),
          current: usage.exportsThisMonth,
          limit: currentPlan.limits.exportsPerMonth,
          title: 'Límite de exportaciones alcanzado',
          description: 'Has alcanzado el límite de exportaciones para este mes.',
          feature: 'exportaciones'
        };
      case 'save':
        return {
          canUse: canSaveAnalysis(),
          current: usage.savedAnalysesCount,
          limit: currentPlan.limits.savedAnalyses,
          title: 'Límite de análisis guardados alcanzado',
          description: 'Has alcanzado el límite de análisis guardados.',
          feature: 'análisis guardados'
        };
    }
  };

  const config = getTypeConfig();

  // Si puede usar la función, mostrar progreso
  if (config.canUse && config.limit !== -1) {
    const percentage = (config.current / config.limit) * 100;
    const isNearLimit = percentage >= 80;

    if (isNearLimit) {
      return (
        <Card className="border-warning bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-warning">
                    Cerca del límite de {config.feature}
                  </p>
                  <Badge variant="warning" className="text-xs">
                    {config.current}/{config.limit}
                  </Badge>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Te quedan {config.limit - config.current} {config.feature} este mes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  // Si no puede usar la función, mostrar advertencia de límite
  if (!config.canUse) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg text-destructive">
              {config.title}
            </CardTitle>
          </div>
          <CardDescription className="text-destructive/80">
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Plan actual: {currentPlan.name}</p>
              <p className="text-xs text-muted-foreground">
                {config.limit === -1 ? 'Ilimitado' : `${config.current}/${config.limit}`} {config.feature}
              </p>
            </div>
            <Badge variant={currentPlan.type === 'free' ? 'secondary' : 'default'}>
              {currentPlan.type === 'free' ? 'Gratuito' : currentPlan.name}
            </Badge>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Actualiza tu plan para obtener más {config.feature} y funciones avanzadas:
            </p>
            
            <div className="grid gap-2">
              {currentPlan.type === 'free' && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Plan Profesional</p>
                      <p className="text-xs text-muted-foreground">100 análisis/mes • 50 exportaciones</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">$29/mes</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Plan Empresarial</p>
                    <p className="text-xs text-muted-foreground">Análisis ilimitados • Todas las funciones</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">$99/mes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/precios">
                <Crown className="h-4 w-4 mr-2" />
                Ver planes
              </Link>
            </Button>
            {onUpgrade && (
              <Button onClick={onUpgrade} variant="outline">
                Actualizar ahora
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}