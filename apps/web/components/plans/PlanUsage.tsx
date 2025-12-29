'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, Save, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UsageData {
  monthlyAnalysisCount: number;
  monthlyExportCount: number;
  monthlySaveCount: number;
  limits: {
    monthlyAnalysis: number;
    monthlyExports: number;
    monthlySaves: number;
  };
  usageResetDate: string;
  plan: string;
}

export function PlanUsage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();

  const fetchUsage = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/user/usage', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar el uso del plan');
      }

      const data = await response.json();
      setUsage(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Uso del Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Uso del Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || 'Error al cargar los datos'}
            </p>
            <Button onClick={fetchUsage} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatResetDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isNearLimit = (used: number, limit: number): boolean => {
    if (limit === -1) return false;
    return (used / limit) >= 0.8;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Uso del Plan
        </CardTitle>
        <CardDescription>
          Plan actual: <Badge variant="outline" className="ml-1">{usage.plan}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Análisis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Análisis</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {usage.monthlyAnalysisCount} / {usage.limits.monthlyAnalysis === -1 ? '∞' : usage.limits.monthlyAnalysis}
            </div>
          </div>
          {usage.limits.monthlyAnalysis !== -1 && (
            <div className="space-y-1">
              <Progress 
                value={getUsagePercentage(usage.monthlyAnalysisCount, usage.limits.monthlyAnalysis)} 
                className="h-2"
              />
              {isNearLimit(usage.monthlyAnalysisCount, usage.limits.monthlyAnalysis) && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Cerca del límite mensual
                </p>
              )}
            </div>
          )}
        </div>

        {/* Exportaciones */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Exportaciones</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {usage.monthlyExportCount} / {usage.limits.monthlyExports === -1 ? '∞' : usage.limits.monthlyExports}
            </div>
          </div>
          {usage.limits.monthlyExports !== -1 && (
            <div className="space-y-1">
              <Progress 
                value={getUsagePercentage(usage.monthlyExportCount, usage.limits.monthlyExports)} 
                className="h-2"
              />
              {isNearLimit(usage.monthlyExportCount, usage.limits.monthlyExports) && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Cerca del límite mensual
                </p>
              )}
            </div>
          )}
        </div>

        {/* Guardados */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Guardados</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {usage.monthlySaveCount} / {usage.limits.monthlySaves === -1 ? '∞' : usage.limits.monthlySaves}
            </div>
          </div>
          {usage.limits.monthlySaves !== -1 && (
            <div className="space-y-1">
              <Progress 
                value={getUsagePercentage(usage.monthlySaveCount, usage.limits.monthlySaves)} 
                className="h-2"
              />
              {isNearLimit(usage.monthlySaveCount, usage.limits.monthlySaves) && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Cerca del límite mensual
                </p>
              )}
            </div>
          )}
        </div>

        {/* Reset date */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Los límites se reinician el {formatResetDate(usage.usageResetDate)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}