'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Gauge, 
  Home, 
  Loader2, 
  Monitor, 
  RotateCcw, 
  Smartphone, 
  TrendingUp, 
  Zap,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAnalytics } from '@/src/contexts/AnalyticsContext';
import { ExportDropdown } from '@/components/export';
import { useAuth } from '@/contexts/AuthContext';

interface CoreWebVitalsResult {
  url: string;
  timestamp: string;
  puntuacion_general: number;
  
  metricas_laboratorio: {
    lcp: {
      valor: number;
      unidad: string;
      estado: 'bueno' | 'necesita_mejora' | 'pobre';
      puntuacion: number;
    };
    cls: {
      valor: number;
      unidad: string;
      estado: 'bueno' | 'necesita_mejora' | 'pobre';
      puntuacion: number;
    };
    inp: {
      valor: number;
      unidad: string;
      estado: 'bueno' | 'necesita_mejora' | 'pobre';
      puntuacion: number;
    };
    fcp: {
      valor: number;
      unidad: string;
      estado: 'bueno' | 'necesita_mejora' | 'pobre';
      puntuacion: number;
    };
    si: {
      valor: number;
      unidad: string;
      estado: 'bueno' | 'necesita_mejora' | 'pobre';
      puntuacion: number;
    };
  };
  
  metricas_campo?: {
    lcp?: {
      valor: number;
      categoria: string;
    };
    cls?: {
      valor: number;
      categoria: string;
    };
    inp?: {
      valor: number;
      categoria: string;
    };
  };
  
  recomendaciones: {
    criticas: string[];
    importantes: string[];
    sugerencias: string[];
  };
  
  resumen: {
    estado_general: 'excelente' | 'bueno' | 'necesita_mejoras' | 'pobre';
    problemas_detectados: number;
    oportunidades_mejora: string[];
  };
}

export default function CoreWebVitalsChecker() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CoreWebVitalsResult | null>(null);
  const [error, setError] = useState('');
  const { trackEvent } = useAnalytics();

  const handleAnalysis = async () => {
    if (!url.trim()) {
      setError('Por favor, ingresa una URL válida');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Track usage
      await trackEvent('core_web_vitals_analysis', {
        url: url,
        timestamp: new Date().toISOString()
      });

      const response = await fetch('/api/core-web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el análisis');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'bueno':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'necesita_mejora':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'pobre':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'bueno':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'necesita_mejora':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pobre':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Gauge className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Core Web Vitals Checker</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Analiza las métricas de rendimiento web más importantes de tu sitio con Google PageSpeed Insights
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Análisis de Core Web Vitals
          </CardTitle>
          <CardDescription>
            Ingresa la URL de tu sitio web para analizar LCP, CLS, INP y otras métricas importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="url"
              placeholder="https://ejemplo.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              disabled={loading}
            />
            <Button 
              onClick={handleAnalysis} 
              disabled={loading || !url.trim()}
              className="min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Analizar
                </>
              )}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resumen General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(results.puntuacion_general)}`}>
                    {results.puntuacion_general}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">Puntuación General</div>
                  <Progress 
                    value={results.puntuacion_general} 
                    className="h-2"
                    style={{
                      '--progress-background': getProgressColor(results.puntuacion_general)
                    } as React.CSSProperties}
                  />
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2 text-gray-900">
                    {results.resumen.problemas_detectados}
                  </div>
                  <div className="text-sm text-gray-600">Problemas Detectados</div>
                  <Badge 
                    variant="outline" 
                    className={`mt-2 ${getStatusColor(results.resumen.estado_general)}`}
                  >
                    {results.resumen.estado_general.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2 text-blue-600">
                    {results.resumen.oportunidades_mejora.length}
                  </div>
                  <div className="text-sm text-gray-600">Oportunidades de Mejora</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Análisis: {new Date(results.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Core Web Vitals Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Métricas Core Web Vitals
              </CardTitle>
              <CardDescription>
                Métricas de laboratorio obtenidas de Google PageSpeed Insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* LCP */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">LCP</span>
                    </div>
                    {getStatusIcon(results.metricas_laboratorio.lcp.estado)}
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {results.metricas_laboratorio.lcp.valor}{results.metricas_laboratorio.lcp.unidad}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Largest Contentful Paint</div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(results.metricas_laboratorio.lcp.estado)}`}
                  >
                    Puntuación: {results.metricas_laboratorio.lcp.puntuacion}
                  </Badge>
                </div>

                {/* CLS */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-green-500" />
                      <span className="font-medium">CLS</span>
                    </div>
                    {getStatusIcon(results.metricas_laboratorio.cls.estado)}
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {results.metricas_laboratorio.cls.valor.toFixed(3)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Cumulative Layout Shift</div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(results.metricas_laboratorio.cls.estado)}`}
                  >
                    Puntuación: {results.metricas_laboratorio.cls.puntuacion}
                  </Badge>
                </div>

                {/* INP */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">INP</span>
                    </div>
                    {getStatusIcon(results.metricas_laboratorio.inp.estado)}
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {results.metricas_laboratorio.inp.valor}{results.metricas_laboratorio.inp.unidad}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Interaction to Next Paint</div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(results.metricas_laboratorio.inp.estado)}`}
                  >
                    Puntuación: {results.metricas_laboratorio.inp.puntuacion}
                  </Badge>
                </div>

                {/* FCP */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">FCP</span>
                    </div>
                    {getStatusIcon(results.metricas_laboratorio.fcp.estado)}
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {results.metricas_laboratorio.fcp.valor}{results.metricas_laboratorio.fcp.unidad}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">First Contentful Paint</div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(results.metricas_laboratorio.fcp.estado)}`}
                  >
                    Puntuación: {results.metricas_laboratorio.fcp.puntuacion}
                  </Badge>
                </div>

                {/* Speed Index */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-red-500" />
                      <span className="font-medium">SI</span>
                    </div>
                    {getStatusIcon(results.metricas_laboratorio.si.estado)}
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {results.metricas_laboratorio.si.valor}{results.metricas_laboratorio.si.unidad}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Speed Index</div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(results.metricas_laboratorio.si.estado)}`}
                  >
                    Puntuación: {results.metricas_laboratorio.si.puntuacion}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Data (if available) */}
          {results.metricas_campo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Datos de Campo (Usuarios Reales)
                </CardTitle>
                <CardDescription>
                  Métricas basadas en experiencias reales de usuarios de Chrome
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {results.metricas_campo.lcp && (
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">LCP (Campo)</div>
                      <div className="text-xl font-bold">
                        {results.metricas_campo.lcp.valor}ms
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {results.metricas_campo.lcp.categoria}
                      </Badge>
                    </div>
                  )}
                  
                  {results.metricas_campo.cls && (
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">CLS (Campo)</div>
                      <div className="text-xl font-bold">
                        {results.metricas_campo.cls.valor.toFixed(3)}
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {results.metricas_campo.cls.categoria}
                      </Badge>
                    </div>
                  )}
                  
                  {results.metricas_campo.inp && (
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">INP (Campo)</div>
                      <div className="text-xl font-bold">
                        {results.metricas_campo.inp.valor}ms
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {results.metricas_campo.inp.categoria}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recomendaciones de Optimización
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Critical Issues */}
              {results.recomendaciones.criticas.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Problemas Críticos
                  </h4>
                  <ul className="space-y-2">
                    {results.recomendaciones.criticas.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Important Issues */}
              {results.recomendaciones.importantes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Mejoras Importantes
                  </h4>
                  <ul className="space-y-2">
                    {results.recomendaciones.importantes.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {results.recomendaciones.sugerencias.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Sugerencias Adicionales
                  </h4>
                  <ul className="space-y-2">
                    {results.recomendaciones.sugerencias.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => {
                setResults(null);
                setUrl('');
                setError('');
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Analizar Otra URL
            </Button>

            {user && (
              <ExportDropdown
                toolType="core-vitals"
                data={{
                  url: results.url,
                  puntuacion_general: results.puntuacion_general,
                  metricas_laboratorio: results.metricas_laboratorio,
                  metricas_campo: results.metricas_campo,
                  recomendaciones: results.recomendaciones,
                  resumen: results.resumen,
                  metadata: {
                    url: results.url,
                    timestamp: results.timestamp,
                    generatedAt: new Date().toISOString()
                  }
                }}
                title="Core Web Vitals"
              />
            )}
            
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Volver al Inicio
            </Button>
          </div>
        </div>
      )}

      {/* Information Cards */}
      {!results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gauge className="h-5 w-5 text-blue-500" />
                Core Web Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Analiza las métricas más importantes para la experiencia del usuario: LCP, CLS e INP.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-green-500" />
                Datos Reales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Obtén métricas tanto de laboratorio como de usuarios reales cuando estén disponibles.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Recomendaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Recibe sugerencias específicas para mejorar el rendimiento de tu sitio web.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
