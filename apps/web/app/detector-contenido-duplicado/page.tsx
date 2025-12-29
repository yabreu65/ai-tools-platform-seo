'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanLimitWarning } from '@/components/PlanLimitWarning';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';
import { 
  Copy, 
  Search, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RotateCcw,
  Download,
  Eye,
  Target,
  Zap,
  Crown,
  BarChart3,
  FileText,
  Globe,
  Lightbulb,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface DuplicateContentResult {
  url?: string;
  content: string;
  timestamp: string;
  originalidad_score: number;
  
  duplicacion_interna: {
    encontrada: boolean;
    porcentaje_similitud: number;
    fragmentos_duplicados: string[];
    urls_similares: string[];
  };
  
  duplicacion_externa: {
    encontrada: boolean;
    porcentaje_similitud: number;
    fuentes_potenciales: Array<{
      fuente: string;
      similitud: number;
      fragmento: string;
    }>;
  };
  
  analisis_originalidad: {
    contenido_unico: number;
    contenido_comun: number;
    frases_problematicas: string[];
    sugerencias_mejora: string[];
  };
  
  recomendaciones: Array<{
    tipo: 'critico' | 'importante' | 'sugerencia';
    titulo: string;
    descripcion: string;
    impacto: string;
  }>;
  
  analisis_avanzado?: {
    verificacion_multiples_fuentes: boolean;
    analisis_semantico: {
      similitud_conceptual: number;
      temas_comunes: string[];
    };
    sugerencias_reescritura: string[];
    monitoreo_continuo: boolean;
  };
}

export default function DetectorContenidoDuplicado() {
  const { user } = useAuth();
  const { currentPlan, canCreateContentAnalysis, incrementUsage } = usePlan();
  const [inputMode, setInputMode] = useState<'content' | 'url'>('content');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DuplicateContentResult | null>(null);

  const isPremium = currentPlan?.type !== 'free';

  const handleAnalyze = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para usar esta herramienta');
      return;
    }

    // Verificar límites del plan
    if (!canCreateContentAnalysis()) {
      toast.error('Has alcanzado el límite de verificaciones de contenido duplicado para tu plan');
      return;
    }

    // Validar entrada
    if (inputMode === 'content' && (!content || content.trim().length < 50)) {
      toast.error('El contenido debe tener al menos 50 caracteres');
      return;
    }

    if (inputMode === 'url' && (!url || !isValidUrl(url))) {
      toast.error('Por favor, ingresa una URL válida');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 600);

      const response = await fetch('/api/duplicate-content-detector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: inputMode === 'content' ? content : undefined,
          url: inputMode === 'url' ? url : undefined,
          mode: inputMode,
          plan: currentPlan?.id || 'free'
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al analizar el contenido');
      }

      const result = await response.json();
      setResults(result);
      
      // Incrementar el uso después de un análisis exitoso
      incrementUsage('content-analysis');
      
      toast.success('¡Análisis de duplicación completado!');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      toast.error('Error al analizar el contenido');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleExport = async (format: 'json' | 'pdf') => {
    if (!results) {
      toast.error('No hay resultados para exportar');
      return;
    }

    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        reportType: 'Detector de Contenido Duplicado',
        analysis: {
          originalityScore: results.originalidad_score,
          internalDuplication: results.duplicacion_interna,
          externalDuplication: results.duplicacion_externa,
          originalityAnalysis: results.analisis_originalidad,
          recommendations: results.recomendaciones,
          ...(results.analisis_avanzado && { advancedAnalysis: results.analisis_avanzado })
        },
        metadata: {
          inputType: inputMode,
          inputValue: inputMode === 'url' ? url : content.substring(0, 100) + '...',
          userPlan: currentPlan?.id || 'free',
          exportedBy: user?.email,
          analysisDate: new Date().toLocaleDateString('es-ES'),
          wordCount: content.split(' ').length
        },
        exportedAt: new Date().toISOString(),
        format
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `reporte-contenido-duplicado-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        
        incrementUsage('export');
        toast.success('Reporte JSON exportado exitosamente');
      } else {
        toast.info('La exportación PDF estará disponible próximamente');
      }
    } catch (error) {
      toast.error('Error al exportar el reporte');
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Copy className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Detector de Contenido Duplicado
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Verifica la originalidad de tu contenido con IA avanzada. Detecta duplicación interna y externa para proteger tu SEO.
          </p>
        </motion.div>

        {/* Plan Limit Warning */}
        <PlanLimitWarning type="content-analysis" />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Análisis de Contenido
                </CardTitle>
                <CardDescription>
                  Ingresa tu contenido o URL para verificar su originalidad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mode Selection */}
                <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as 'content' | 'url')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="content" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Texto
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      URL
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <Label htmlFor="content">Contenido a Analizar</Label>
                      <Textarea
                        id="content"
                        placeholder="Pega aquí el contenido que quieres verificar por duplicación..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[200px] mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Mínimo 50 caracteres • {content.length} caracteres actuales
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4">
                    <div>
                      <Label htmlFor="url">URL de la Página</Label>
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://ejemplo.com/mi-articulo"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Analizaremos el contenido de esta página web
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Analyze Button */}
                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !user}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Verificar Originalidad
                    </>
                  )}
                </Button>

                {/* Progress Bar */}
                {loading && (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-center text-gray-600">
                      {progress < 30 && "Analizando contenido..."}
                      {progress >= 30 && progress < 60 && "Verificando duplicación interna..."}
                      {progress >= 60 && progress < 90 && "Buscando contenido similar en la web..."}
                      {progress >= 90 && "Generando reporte de originalidad..."}
                    </p>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <p className="text-red-800 font-medium">Error</p>
                    </div>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {results ? (
              <div className="space-y-6">
                {/* Originalidad Score */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        Puntuación de Originalidad
                      </span>
                      <Badge className={getScoreBadgeColor(results.originalidad_score)}>
                        {results.originalidad_score}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Contenido Único</span>
                        <span className={`text-2xl font-bold ${getScoreColor(results.originalidad_score)}`}>
                          {results.originalidad_score}%
                        </span>
                      </div>
                      <Progress value={results.originalidad_score} className="h-3" />
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">
                            {results.analisis_originalidad.contenido_unico}%
                          </p>
                          <p className="text-sm text-green-700">Único</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">
                            {results.analisis_originalidad.contenido_comun}%
                          </p>
                          <p className="text-sm text-red-700">Común</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Duplicación Interna */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Duplicación Interna
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Estado</span>
                        <Badge variant={results.duplicacion_interna.encontrada ? "destructive" : "default"}>
                          {results.duplicacion_interna.encontrada ? "Encontrada" : "No Detectada"}
                        </Badge>
                      </div>
                      
                      {results.duplicacion_interna.encontrada && (
                        <>
                          <div className="flex items-center justify-between">
                            <span>Similitud</span>
                            <span className="font-semibold text-orange-600">
                              {results.duplicacion_interna.porcentaje_similitud}%
                            </span>
                          </div>
                          
                          {results.duplicacion_interna.fragmentos_duplicados.length > 0 && (
                            <div>
                              <p className="font-medium mb-2">Fragmentos Problemáticos:</p>
                              <div className="space-y-1">
                                {results.duplicacion_interna.fragmentos_duplicados.map((fragmento, index) => (
                                  <div key={index} className="p-2 bg-orange-50 rounded text-sm">
                                    "{fragmento}"
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Duplicación Externa */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-purple-600" />
                      Duplicación Externa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Estado</span>
                        <Badge variant={results.duplicacion_externa.encontrada ? "destructive" : "default"}>
                          {results.duplicacion_externa.encontrada ? "Encontrada" : "No Detectada"}
                        </Badge>
                      </div>
                      
                      {results.duplicacion_externa.encontrada && (
                        <>
                          <div className="flex items-center justify-between">
                            <span>Similitud</span>
                            <span className="font-semibold text-red-600">
                              {results.duplicacion_externa.porcentaje_similitud}%
                            </span>
                          </div>
                          
                          {results.duplicacion_externa.fuentes_potenciales.length > 0 && (
                            <div>
                              <p className="font-medium mb-2">Fuentes Potenciales:</p>
                              <div className="space-y-2">
                                {results.duplicacion_externa.fuentes_potenciales.map((fuente, index) => (
                                  <div key={index} className="p-3 bg-red-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-sm">{fuente.fuente}</span>
                                      <Badge variant="outline">{fuente.similitud.toFixed(1)}%</Badge>
                                    </div>
                                    <p className="text-xs text-gray-600">"{fuente.fragmento}"</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Análisis Avanzado (Premium) */}
                {isPremium && results.analisis_avanzado && (
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-purple-600" />
                        Análisis Avanzado Premium
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Verificación Múltiple
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">
                            {results.analisis_avanzado.analisis_semantico.similitud_conceptual}%
                          </p>
                          <p className="text-sm text-purple-700">Similitud Conceptual</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">
                            {results.analisis_avanzado.analisis_semantico.temas_comunes.length}
                          </p>
                          <p className="text-sm text-blue-700">Temas Comunes</p>
                        </div>
                      </div>

                      {results.analisis_avanzado.analisis_semantico.temas_comunes.length > 0 && (
                        <div>
                          <p className="font-medium mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Temas Identificados:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {results.analisis_avanzado.analisis_semantico.temas_comunes.map((tema, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                {tema}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.analisis_avanzado.sugerencias_reescritura.length > 0 && (
                        <div>
                          <p className="font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Sugerencias de Reescritura:
                          </p>
                          <div className="space-y-2">
                            {results.analisis_avanzado.sugerencias_reescritura.map((sugerencia, index) => (
                              <div key={index} className="p-3 bg-white rounded-lg border-l-4 border-purple-500">
                                <p className="text-sm">{sugerencia}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Verificación Múltiples Fuentes:</span>
                          <Badge variant={results.analisis_avanzado.verificacion_multiples_fuentes ? "default" : "secondary"}>
                            {results.analisis_avanzado.verificacion_multiples_fuentes ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Monitoreo Continuo:</span>
                          <Badge variant={results.analisis_avanzado.monitoreo_continuo ? "default" : "secondary"}>
                            {results.analisis_avanzado.monitoreo_continuo ? "Habilitado" : "Deshabilitado"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recomendaciones */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Recomendaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.recomendaciones.map((rec, index) => (
                        <div key={index} className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50">
                          <div className="flex items-start gap-3">
                            {rec.tipo === 'critico' && <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                            {rec.tipo === 'importante' && <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                            {rec.tipo === 'sugerencia' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{rec.titulo}</h4>
                              <p className="text-gray-700 mt-1">{rec.descripcion}</p>
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>Impacto:</strong> {rec.impacto}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Export Options */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-gray-600" />
                      Exportar Reporte
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleExport('json')}
                        variant="outline"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        JSON
                      </Button>
                      <Button
                        onClick={() => handleExport('pdf')}
                        variant="outline"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Copy className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Listo para Analizar
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Ingresa tu contenido o URL en el panel izquierdo y haz clic en "Verificar Originalidad" para comenzar el análisis.
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">
                ¿Por qué usar nuestro Detector de Contenido Duplicado?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-90" />
                  <h3 className="font-semibold mb-2">Protección SEO</h3>
                  <p className="text-sm opacity-90">
                    Evita penalizaciones por contenido duplicado y protege tu ranking en buscadores.
                  </p>
                </div>
                <div className="text-center">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-90" />
                  <h3 className="font-semibold mb-2">Análisis con IA</h3>
                  <p className="text-sm opacity-90">
                    Tecnología avanzada de OpenAI para detectar similitudes semánticas y conceptuales.
                  </p>
                </div>
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-90" />
                  <h3 className="font-semibold mb-2">Reportes Detallados</h3>
                  <p className="text-sm opacity-90">
                    Obtén insights precisos sobre la originalidad de tu contenido con recomendaciones específicas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <HomeFloatingButton />
    </div>
  );
}