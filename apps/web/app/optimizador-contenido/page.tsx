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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlanLimitWarning } from '@/components/PlanLimitWarning';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';
import { 
  FileText, 
  Search, 
  TrendingUp, 
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
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

interface ContentAnalysisResult {
  seoScore: {
    overall: number;
    breakdown: {
      keywordDensity: number;
      readability: number;
      structure: number;
      metaOptimization: number;
      contentLength: number;
    };
  };
  keywordAnalysis: {
    density: Record<string, number>;
    suggestions: string[];
    missing: string[];
  };
  structureAnalysis: {
    headings: {
      h1Count: number;
      h2Count: number;
      h3Count: number;
      suggestions: string[];
    };
    paragraphs: {
      count: number;
      averageLength: number;
      suggestions: string[];
    };
  };
  readabilityAnalysis: {
    score: number;
    level: string;
    suggestions: string[];
  };
  recommendations: Array<{
    type: 'critical' | 'important' | 'suggestion';
    category: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  optimizedContent?: string;
  competitorInsights?: {
    suggestedKeywords: string[];
    contentGaps: string[];
    competitorStrategies: string[];
    differentiationOpportunities: string[];
  };
  advancedRecommendations?: Array<{
    category: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    implementation: string;
  }>;
  metadata: {
    timestamp: string;
    contentLength: number;
    wordCount: number;
    targetKeywords: string[];
    contentType: string;
    language: string;
    url?: string;
    userPlan: string;
    analysisId: string;
  };
}

export default function OptimizadorContenido() {
  const { user } = useAuth();
  const { canCreateContentAnalysis, incrementUsage } = usePlan();
  const [inputMode, setInputMode] = useState<'content' | 'url'>('content');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [contentType, setContentType] = useState('general');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ContentAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para usar esta herramienta');
      return;
    }

    // Verificar límites del plan
    if (!canCreateContentAnalysis()) {
      toast.error('Has alcanzado el límite de análisis de contenido para tu plan');
      return;
    }

    // Validar entrada
    if (inputMode === 'content' && (!content || content.trim().length < 100)) {
      toast.error('El contenido debe tener al menos 100 caracteres');
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
      }, 500);

      const response = await fetch('/api/content-optimizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: inputMode === 'content' ? content : undefined,
          url: inputMode === 'url' ? url : undefined,
          targetKeywords: targetKeywords ? targetKeywords.split(',').map(k => k.trim()) : undefined,
          contentType,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al analizar el contenido');
      }

      const result = await response.json();
      setResults(result.data);

      // Incrementar el uso después de un análisis exitoso
      incrementUsage('content-analysis');
      
      toast.success('¡Análisis completado exitosamente!');
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
      if (format === 'json') {
        // Crear datos de exportación con metadatos adicionales
        const exportData = {
          timestamp: new Date().toISOString(),
          analysis: results,
          metadata: {
            contentLength: inputMode === 'content' ? content.length : 0,
            wordCount: inputMode === 'content' ? content.split(/\s+/).length : 0,
            targetKeywords: targetKeywords ? targetKeywords.split(',').map(k => k.trim()) : [],
            contentType,
            inputMode,
            url: inputMode === 'url' ? url : undefined
          }
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `analisis-contenido-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        toast.success('Análisis exportado en formato JSON');
      } else if (format === 'pdf') {
        // Implementar exportación PDF
        await handlePDFExport();
      }
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar el análisis');
    }
  };

  const handlePDFExport = async () => {
    if (!results) return;

    try {
      // Crear el contenido HTML para el PDF
      const htmlContent = generatePDFContent(results);
      
      // Crear un elemento temporal para el contenido
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('No se pudo abrir la ventana de impresión');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Análisis de Contenido SEO</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .score { font-size: 24px; font-weight: bold; margin: 10px 0; }
            .section { margin: 20px 0; }
            .recommendation { margin: 10px 0; padding: 10px; border-left: 3px solid #007bff; }
            .critical { border-left-color: #dc3545; }
            .important { border-left-color: #ffc107; }
            .suggestion { border-left-color: #28a745; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Esperar a que se cargue el contenido y luego imprimir
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
      toast.success('Preparando PDF para descarga...');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  const generatePDFContent = (data: any) => {
    const date = new Date().toLocaleDateString('es-ES');
    
    return `
      <div class="header">
        <h1>Análisis de Contenido SEO</h1>
        <p>Fecha: ${date}</p>
        <p>Puntuación General: <span class="score">${data.seoScore?.overall || 0}/100</span></p>
      </div>

      <div class="section">
        <h2>Puntuaciones Detalladas</h2>
        <table>
          <tr><th>Aspecto</th><th>Puntuación</th></tr>
          <tr><td>Densidad de Palabras Clave</td><td>${data.seoScore?.breakdown?.keywordDensity || 0}/100</td></tr>
          <tr><td>Legibilidad</td><td>${data.seoScore?.breakdown?.readability || 0}/100</td></tr>
          <tr><td>Estructura</td><td>${data.seoScore?.breakdown?.structure || 0}/100</td></tr>
          <tr><td>Meta Optimización</td><td>${data.seoScore?.breakdown?.metaOptimization || 0}/100</td></tr>
          <tr><td>Longitud de Contenido</td><td>${data.seoScore?.breakdown?.contentLength || 0}/100</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Recomendaciones</h2>
        ${data.recommendations?.map((rec: any) => `
          <div class="recommendation ${rec.type}">
            <h3>${rec.title}</h3>
            <p><strong>Categoría:</strong> ${rec.category}</p>
            <p><strong>Impacto:</strong> ${rec.impact}</p>
            <p>${rec.description}</p>
          </div>
        `).join('') || '<p>No hay recomendaciones disponibles</p>'}
      </div>

      <div class="section">
        <h2>Análisis de Palabras Clave</h2>
        ${data.keywordAnalysis?.density ? `
          <table>
            <tr><th>Palabra Clave</th><th>Densidad</th></tr>
            ${Object.entries(data.keywordAnalysis.density).map(([keyword, density]) => 
              `<tr><td>${keyword}</td><td>${density}%</td></tr>`
            ).join('')}
          </table>
        ` : '<p>No hay análisis de palabras clave disponible</p>'}
      </div>

      <div class="section">
        <h2>Análisis de Legibilidad</h2>
        <p><strong>Puntuación:</strong> ${data.readabilityAnalysis?.score || 0}/100</p>
        <p><strong>Nivel:</strong> ${data.readabilityAnalysis?.level || 'No disponible'}</p>
        ${data.readabilityAnalysis?.suggestions ? `
          <h3>Sugerencias:</h3>
          <ul>
            ${data.readabilityAnalysis.suggestions.map((suggestion: string) => 
              `<li>${suggestion}</li>`
            ).join('')}
          </ul>
        ` : ''}
      </div>
    `;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const resetForm = () => {
    setContent('');
    setUrl('');
    setTargetKeywords('');
    setContentType('general');
    setResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <HomeFloatingButton />
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Optimizador de Contenido SEO
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Analiza tu contenido con IA avanzada y obtén recomendaciones específicas para mejorar tu SEO
            </p>
          </motion.div>
        </div>

        {/* Plan Limit Warning */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <PlanLimitWarning type="content-analysis" />
          </motion.div>
        )}

        {!results ? (
          <>
            {/* Main Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Análisis de Contenido
                  </CardTitle>
                  <CardDescription>
                    Ingresa tu contenido o URL para obtener un análisis completo con IA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Input Mode Selector */}
                  <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'content' | 'url')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="content">Texto Directo</TabsTrigger>
                      <TabsTrigger value="url">URL</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="content" className="space-y-4">
                      <div>
                        <Label htmlFor="content">Contenido a analizar *</Label>
                        <Textarea
                          id="content"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Pega aquí el contenido que quieres optimizar..."
                          className="min-h-[200px] mt-2"
                          maxLength={10000}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {content.length}/10,000 caracteres
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="url" className="space-y-4">
                      <div>
                        <Label htmlFor="url">URL del contenido *</Label>
                        <Input
                          id="url"
                          type="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://ejemplo.com/mi-articulo"
                          className="mt-2"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Additional Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="keywords">Palabras clave objetivo (opcional)</Label>
                      <Input
                        id="keywords"
                        value={targetKeywords}
                        onChange={(e) => setTargetKeywords(e.target.value)}
                        placeholder="SEO, marketing digital, contenido"
                        className="mt-2"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Separadas por comas
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="contentType">Tipo de contenido</Label>
                      <Select value={contentType} onValueChange={setContentType}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="blog">Blog/Artículo</SelectItem>
                          <SelectItem value="product">Página de Producto</SelectItem>
                          <SelectItem value="landing">Landing Page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {loading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Analizando contenido...</span>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <Card className="border-destructive bg-destructive/5">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-destructive" />
                          <p className="text-sm text-destructive font-medium">{error}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Submit Button */}
                  <Button
                    onClick={handleAnalyze}
                    disabled={loading || (!content.trim() && !url.trim())}
                    size="lg"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analizando...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Analizar Contenido
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <Card className="border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-primary/10 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg mb-2">Análisis con IA</CardTitle>
                  <CardDescription>
                    Utiliza inteligencia artificial avanzada para analizar tu contenido y generar recomendaciones específicas
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-secondary/10 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-lg mb-2">Puntuación SEO</CardTitle>
                  <CardDescription>
                    Obtén una puntuación detallada de 0-100 con análisis específicos de cada aspecto de tu contenido
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-accent/10 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                    <Lightbulb className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg mb-2">Recomendaciones</CardTitle>
                  <CardDescription>
                    Recibe sugerencias priorizadas por impacto para mejorar significativamente tu posicionamiento
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          /* Results Section */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Header with Score */}
            <Card className="shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-success" />
                      Análisis Completado
                    </CardTitle>
                    <CardDescription>
                      Análisis realizado el {new Date(results.metadata.timestamp).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(results.seoScore.overall)}`}>
                      {results.seoScore.overall}
                    </div>
                    <div className="text-sm text-muted-foreground">Puntuación SEO</div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Desglose de Puntuación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Object.entries(results.seoScore.breakdown).map(([key, score]) => (
                    <div key={key} className={`p-4 rounded-lg ${getScoreBgColor(score)}`}>
                      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                        {score}
                      </div>
                      <div className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Tabs defaultValue="recommendations" className="w-full">
              <TabsList className={`grid w-full ${results.competitorInsights ? 'grid-cols-6' : 'grid-cols-4'}`}>
                <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
                <TabsTrigger value="keywords">Palabras Clave</TabsTrigger>
                <TabsTrigger value="structure">Estructura</TabsTrigger>
                <TabsTrigger value="readability">Legibilidad</TabsTrigger>
                {results.competitorInsights && (
                  <>
                    <TabsTrigger value="competitor" className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Competencia
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Avanzado
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recomendaciones Priorizadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.recommendations.map((rec, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              rec.type === 'critical' ? 'bg-red-100 text-red-600' :
                              rec.type === 'important' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {rec.type === 'critical' ? <AlertTriangle className="h-4 w-4" /> :
                               rec.type === 'important' ? <Target className="h-4 w-4" /> :
                               <Lightbulb className="h-4 w-4" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{rec.title}</h4>
                                <Badge variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'default' : 'secondary'}>
                                  {rec.impact} impact
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{rec.description}</p>
                              <Badge variant="outline" className="mt-2">
                                {rec.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="keywords" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Densidad de Palabras Clave</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(results.keywordAnalysis.density).map(([keyword, density]) => (
                          <div key={keyword} className="flex items-center justify-between">
                            <span className="font-medium">{keyword}</span>
                            <Badge>{density}%</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Sugerencias de Palabras Clave</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {results.keywordAnalysis.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="structure" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Estructura de Encabezados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>H1</span>
                          <Badge>{results.structureAnalysis.headings.h1Count}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>H2</span>
                          <Badge>{results.structureAnalysis.headings.h2Count}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>H3</span>
                          <Badge>{results.structureAnalysis.headings.h3Count}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Análisis de Párrafos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Total de párrafos</span>
                          <Badge>{results.structureAnalysis.paragraphs.count}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Longitud promedio</span>
                          <Badge>{results.structureAnalysis.paragraphs.averageLength} palabras</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="readability" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Análisis de Legibilidad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Puntuación de legibilidad</span>
                        <div className={`text-2xl font-bold ${getScoreColor(results.readabilityAnalysis.score)}`}>
                          {results.readabilityAnalysis.score}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Nivel</span>
                        <Badge>{results.readabilityAnalysis.level}</Badge>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Sugerencias:</h4>
                        {results.readabilityAnalysis.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                            <span className="text-sm">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Premium Competitor Analysis Tab */}
              {results.competitorInsights && (
                <TabsContent value="competitor" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Crown className="h-5 w-5 text-yellow-500" />
                          Palabras Clave Sugeridas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {results.competitorInsights.suggestedKeywords.map((keyword, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">{keyword}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Oportunidades de Contenido</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {results.competitorInsights.contentGaps.map((gap, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                              <span className="text-sm">{gap}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Estrategias de Competencia</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {results.competitorInsights.competitorStrategies.map((strategy, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">{strategy}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Oportunidades de Diferenciación</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {results.competitorInsights.differentiationOpportunities.map((opportunity, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Zap className="h-4 w-4 text-purple-500 mt-0.5" />
                              <span className="text-sm">{opportunity}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )}

              {/* Premium Advanced Recommendations Tab */}
              {results.advancedRecommendations && (
                <TabsContent value="advanced" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-purple-500" />
                        Recomendaciones Avanzadas (Premium)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {results.advancedRecommendations.map((rec, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${
                                rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {rec.priority === 'high' ? <AlertTriangle className="h-4 w-4" /> :
                                 rec.priority === 'medium' ? <Target className="h-4 w-4" /> :
                                 <Lightbulb className="h-4 w-4" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{rec.title}</h4>
                                  <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                                    {rec.priority} priority
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                                <div className="bg-muted p-3 rounded-md">
                                  <h5 className="font-medium text-sm mb-1">Implementación:</h5>
                                  <p className="text-sm">{rec.implementation}</p>
                                </div>
                                <Badge variant="outline" className="mt-2">
                                  {rec.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>

            {/* Premium Content */}
            {results.optimizedContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Contenido Optimizado (Premium)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={results.optimizedContent}
                    readOnly
                    className="min-h-[300px] font-mono text-sm"
                  />
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <Button onClick={resetForm} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Analizar Otro
              </Button>
              
              <Button onClick={() => handleExport('json')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </Button>
              
              <Button onClick={() => handleExport('pdf')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
