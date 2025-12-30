'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Trash2,
  Play,
  Settings,
  BarChart3,
  History,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  FileText,
  Key,
  TrendingUp,
  Lightbulb,
  Target,
  Crown,
  X,
  Users,
  RotateCcw
} from 'lucide-react';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';
import { ExportDropdown } from '@/components/export/export-button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
interface KeywordAnalysisConfig {
  urls: string[];
  maxDepth: number;
  includeMetaTags: boolean;
  includeHeadings: boolean;
  includeContent: boolean;
  includeLinks: boolean;
  keywordFilters: string[];
  categories: string[];
}

interface ExtractedKeyword {
  keyword: string;
  frequency: number;
  density: number;
  category: 'primary' | 'secondary' | 'long-tail' | 'brand';
  relevanceScore: number;
  positions: Array<{
    element: string;
    position: number;
  }>;
}

interface CompetitorData {
  url: string;
  title: string;
  metaDescription: string;
  keywordCount: number;
  topKeywords: ExtractedKeyword[];
}

interface Opportunity {
  type: 'gap' | 'improvement' | 'new-target';
  keyword: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
}

interface AnalysisResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  config: KeywordAnalysisConfig;
  keywords: ExtractedKeyword[];
  competitors: CompetitorData[];
  opportunities: Opportunity[];
  metrics: {
    totalKeywords: number;
    avgDensity: number;
    topCategories: string[];
    competitorCount: number;
  };
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface PlanLimits {
  maxUrls: number;
  maxAnalysesPerMonth: number;
  maxKeywordsPerResult: number;
  canExportPdf: boolean;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxUrls: 5,
    maxAnalysesPerMonth: 10,
    maxKeywordsPerResult: 50,
    canExportPdf: false
  },
  pro: {
    maxUrls: 50,
    maxAnalysesPerMonth: 100,
    maxKeywordsPerResult: 500,
    canExportPdf: true
  },
  enterprise: {
    maxUrls: 1000,
    maxAnalysesPerMonth: -1,
    maxKeywordsPerResult: -1,
    canExportPdf: true
  }
};

export default function KeywordScraperTool() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [urls, setUrls] = useState<string[]>(['']);
  const [config, setConfig] = useState<KeywordAnalysisConfig>({
    depth: 1,
    categories: ['primary', 'secondary'],
    includeMetaTags: true,
    includeHeadings: true,
    includeContent: true,
    minKeywordLength: 2,
    maxKeywordLength: 50
  });
  
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('configurar');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [currentResults, setCurrentResults] = useState<AnalysisResult | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Get current user's plan limits
  const userPlan = user?.plan || 'free';
  const planLimits = PLAN_LIMITS[userPlan];

  // Check if user can perform analysis
  const canPerformAnalysis = () => {
    if (!isAuthenticated) return false;
    
    const validUrls = urls.filter(url => url.trim() !== '');
    if (validUrls.length === 0) {
      toast.error('Debes agregar al menos una URL para analizar');
      return false;
    }
    
    if (validUrls.length > planLimits.maxUrls) {
      toast.error(`Tu plan ${userPlan} permite máximo ${planLimits.maxUrls} URLs por análisis`);
      return false;
    }
    
    return true;
  };

  // Add URL input
  const addUrl = () => {
    if (urls.length >= planLimits.maxUrls) {
      toast.error(`Tu plan ${userPlan} permite máximo ${planLimits.maxUrls} URLs`);
      return;
    }
    setUrls([...urls, '']);
  };

  // Remove URL input
  const removeUrl = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  // Update URL value
  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  // Replace the simulated startAnalysis function with real API call
  const startAnalysis = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para usar esta herramienta');
      return;
    }

    if (!canPerformAnalysis()) {
      toast.error(`Tu plan ${user.plan} permite máximo ${PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS].maxUrls} URLs por análisis`);
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setActiveTab('progreso');

    try {
      // Start analysis
      const response = await fetch('/api/keyword-scraper/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: urls.filter(url => url.trim()),
          depth: config.depth,
          language: config.language,
          includeMetaTags: config.includeMetaTags,
          includeHeadings: config.includeHeadings,
          includeContent: config.includeContent
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al iniciar el análisis');
      }

      const { analysisId, estimatedTime } = await response.json();
      setCurrentAnalysisId(analysisId);

      // Poll for progress
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/keyword-scraper/status/${analysisId}`);
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            
            setProgress(statusData.progress || 0);
            
            if (statusData.status === 'completed') {
              clearInterval(pollInterval);
              
              // Get full results
              const resultsResponse = await fetch(`/api/keyword-scraper/results/${analysisId}`);
              if (resultsResponse.ok) {
                const results = await resultsResponse.json();
                setCurrentResults(results);
                setActiveTab('resultados');
                toast.success('¡Análisis completado exitosamente!');
              }
              
              setIsLoading(false);
              setProgress(100);
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval);
              setIsLoading(false);
              toast.error(statusData.error || 'Error en el análisis');
            }
          }
        } catch (error) {
          console.error('Error polling status:', error);
        }
      }, 2000); // Poll every 2 seconds

      // Cleanup interval after estimated time + buffer
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isLoading) {
          setIsLoading(false);
          toast.error('Tiempo de espera agotado');
        }
      }, (estimatedTime + 30) * 1000);

    } catch (error) {
      setIsLoading(false);
      setProgress(0);
      toast.error(error instanceof Error ? error.message : 'Error al iniciar el análisis');
    }
  };

  // Replace the simulated exportResults function with real API call
  const exportResults = async (format: 'csv' | 'pdf') => {
    if (!currentAnalysisId) {
      toast.error('No hay resultados para exportar');
      return;
    }

    if (format === 'pdf' && !PLAN_LIMITS[user?.plan as keyof typeof PLAN_LIMITS]?.canExportPdf) {
      toast.error('La exportación a PDF requiere un plan Pro o Enterprise');
      return;
    }

    try {
      const response = await fetch(
        `/api/keyword-scraper/export/${currentAnalysisId}?format=${format}&includeMetrics=true&includeOpportunities=true`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al exportar');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `keyword-analysis-${currentAnalysisId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Archivo ${format.toUpperCase()} descargado exitosamente`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al exportar');
    }
  };

  // Replace the simulated loadAnalysisHistory function with real API call
  const loadAnalysisHistory = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/keyword-scraper/history?page=1&limit=10');
      
      if (response.ok) {
        const data = await response.json();
        setAnalysisHistory(data.analyses || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // Replace the simulated loadAnalysis function with real API call
  const loadAnalysis = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/keyword-scraper/results/${analysisId}`);
      
      if (response.ok) {
        const results = await response.json();
        setCurrentResults(results);
        setCurrentAnalysisId(analysisId);
        setActiveTab('resultados');
        toast.success('Análisis cargado exitosamente');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al cargar el análisis');
      }
    } catch (error) {
      toast.error('Error al cargar el análisis');
    }
  };

  // Replace the simulated deleteAnalysis function with real API call
  const deleteAnalysis = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/keyword-scraper/analysis/${analysisId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setAnalysisHistory(prev => prev.filter(analysis => analysis.id !== analysisId));
        toast.success('Análisis eliminado exitosamente');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al eliminar el análisis');
      }
    } catch (error) {
      toast.error('Error al eliminar el análisis');
    }
  };

  // Start polling for analysis results
  const startPolling = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/keyword-scraper/results/${id}`, {
          headers: {
            ...(user && {
              'x-user-id': user.id,
              'x-user-email': user.email,
              'x-user-plan': user.plan || 'free'
            })
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener resultados');
        }

        const results = await response.json();
        
        if (results.status === 'completed') {
          setCurrentAnalysis(results);
          setProgress(100);
          setIsLoading(false);
          setActiveTab('results');
          clearInterval(interval);
          setPollingInterval(null);
          toast.success('¡Análisis completado!');
          
          // Add to history
          setAnalysisHistory(prev => [results, ...prev]);
        } else if (results.status === 'failed') {
          throw new Error(results.error || 'El análisis falló');
        } else {
          // Update progress
          setProgress(results.progress || 0);
        }
        
      } catch (error) {
        console.error('Error polling results:', error);
        toast.error('Error al obtener el progreso del análisis');
        clearInterval(interval);
        setPollingInterval(null);
        setIsLoading(false);
        setActiveTab('configure');
      }
    }, 5000); // Poll every 5 seconds

    setPollingInterval(interval);
  };



  // Load analysis history when user is available
  useEffect(() => {
    if (user) {
      loadAnalysisHistory();
    }
  }, [user]);

  // Reset form
  const resetForm = () => {
    setUrls(['']);
    setCurrentResults(null);
    setProgress(0);
    setActiveTab('configurar');
    setCurrentAnalysisId(null);
    setIsLoading(false);
  };





  // Load history on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadAnalysisHistory();
    }
  }, [isAuthenticated]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Search className="h-6 w-6 text-blue-600" />
                  Scraper de Palabras Clave SEO
                </CardTitle>
                <CardDescription>
                  Inicia sesión para acceder a esta herramienta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">¿Qué puedes hacer?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Extraer palabras clave de sitios web competidores</li>
                    <li>• Analizar densidad y relevancia de keywords</li>
                    <li>• Comparar múltiples URLs simultáneamente</li>
                    <li>• Exportar resultados en CSV y PDF</li>
                    <li>• Detectar oportunidades SEO</li>
                  </ul>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button asChild>
                    <a href="/login">Iniciar Sesión</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/register">Crear Cuenta</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <HomeFloatingButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Search className="h-10 w-10 text-blue-600" />
              Scraper de Palabras Clave SEO
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Extrae y analiza palabras clave de sitios web competidores para optimizar tu estrategia SEO
            </p>
            
            {/* Plan indicator */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <Badge variant={userPlan === 'free' ? 'secondary' : userPlan === 'pro' ? 'default' : 'destructive'} className="flex items-center gap-1">
                {userPlan === 'enterprise' && <Crown className="h-3 w-3" />}
                Plan {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}
              </Badge>
              <span className="text-sm text-gray-500">
                Máximo {planLimits.maxUrls} URLs por análisis
              </span>
            </div>
          </div>

          {/* Description Card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <Target className="h-6 w-6 text-secondary mb-2" />
                  <h3 className="font-semibold mb-1">Análisis Competitivo</h3>
                  <p className="text-sm text-gray-600">Descubre las palabras clave que usan tus competidores</p>
                </div>
                <div className="flex flex-col items-center">
                  <BarChart3 className="h-6 w-6 text-secondary mb-2" />
                  <h3 className="font-semibold mb-1">Métricas Detalladas</h3>
                  <p className="text-sm text-gray-600">Densidad, frecuencia y relevancia de cada keyword</p>
                </div>
                <div className="flex flex-col items-center">
                  <Lightbulb className="h-6 w-6 text-secondary mb-2" />
                  <h3 className="font-semibold mb-1">Oportunidades SEO</h3>
                  <p className="text-sm text-gray-600">Identifica gaps y oportunidades de optimización</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="configure">Configurar</TabsTrigger>
              <TabsTrigger value="progress" disabled={!isLoading && progress === 0}>Progreso</TabsTrigger>
              <TabsTrigger value="results" disabled={!currentAnalysis}>Resultados</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            {/* Configuration Tab */}
            <TabsContent value="configure" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Análisis</CardTitle>
                  <CardDescription>
                    Configura las URLs y parámetros para el análisis de palabras clave
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* URLs Input */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      URLs a Analizar ({urls.filter(url => url.trim()).length}/{planLimits.maxUrls})
                    </label>
                    <div className="space-y-2">
                      {urls.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="https://ejemplo.com"
                            value={url}
                            onChange={(e) => updateUrl(index, e.target.value)}
                            className="flex-1"
                          />
                          {urls.length > 1 && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeUrl(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={addUrl}
                        className="w-full"
                        disabled={urls.length >= planLimits.maxUrls}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar URL {urls.length >= planLimits.maxUrls && `(Límite: ${planLimits.maxUrls})`}
                      </Button>
                    </div>
                  </div>

                  {/* Basic Configuration */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Profundidad de Scraping</label>
                      <Select value={config.depth.toString()} onValueChange={(value) => setConfig({...config, depth: parseInt(value)})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 nivel (solo página principal)</SelectItem>
                          <SelectItem value="2">2 niveles</SelectItem>
                          <SelectItem value="3">3 niveles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Categorías de Keywords</label>
                      <div className="flex flex-wrap gap-2">
                        {['primary', 'secondary', 'long-tail', 'brand'].map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={category}
                              checked={config.categories.includes(category)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setConfig({...config, categories: [...config.categories, category]});
                                } else {
                                  setConfig({...config, categories: config.categories.filter(c => c !== category)});
                                }
                              }}
                            />
                            <label htmlFor={category} className="text-sm capitalize">
                              {category === 'long-tail' ? 'Long-tail' : category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Advanced Configuration */}
                  <div>
                    <Button
                      variant="ghost"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="mb-4"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configuración Avanzada
                    </Button>
                    
                    {showAdvanced && (
                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="metaTags"
                              checked={config.includeMetaTags}
                              onCheckedChange={(checked) => setConfig({...config, includeMetaTags: !!checked})}
                            />
                            <label htmlFor="metaTags" className="text-sm">Incluir Meta Tags</label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="headings"
                              checked={config.includeHeadings}
                              onCheckedChange={(checked) => setConfig({...config, includeHeadings: !!checked})}
                            />
                            <label htmlFor="headings" className="text-sm">Incluir Headings (H1-H6)</label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="content"
                              checked={config.includeContent}
                              onCheckedChange={(checked) => setConfig({...config, includeContent: !!checked})}
                            />
                            <label htmlFor="content" className="text-sm">Incluir Contenido</label>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Longitud Mínima (caracteres)</label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={config.minKeywordLength}
                              onChange={(e) => setConfig({...config, minKeywordLength: parseInt(e.target.value) || 2})}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block">Longitud Máxima (caracteres)</label>
                            <Input
                              type="number"
                              min="10"
                              max="100"
                              value={config.maxKeywordLength}
                              onChange={(e) => setConfig({...config, maxKeywordLength: parseInt(e.target.value) || 50})}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={startAnalysis}
                      disabled={isLoading || urls.filter(url => url.trim()).length === 0}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isLoading ? 'Iniciando Análisis...' : 'Iniciar Análisis'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      disabled={isLoading}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Limpiar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Progreso del Análisis
                  </CardTitle>
                  <CardDescription>
                    El análisis está en progreso. Esto puede tomar varios minutos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progreso</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <Search className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Extrayendo Contenido</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <Key className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Analizando Keywords</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Calculando Métricas</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      El análisis se completará automáticamente. Puedes cerrar esta pestaña y volver más tarde.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (pollingInterval) {
                          clearInterval(pollingInterval);
                          setPollingInterval(null);
                        }
                        setIsLoading(false);
                        setActiveTab('configure');
                      }}
                    >
                      Cancelar Análisis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              {currentAnalysis && (
                <>
                  {/* Summary Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Resumen del Análisis</CardTitle>
                          <CardDescription>
                            Análisis completado el {new Date(currentAnalysis.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportResults('csv')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            CSV
                          </Button>
                          {planLimits.canExportPdf && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportResults('pdf')}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                          )}
                          {!planLimits.canExportPdf && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              title="PDF export requires Pro or Enterprise plan"
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              PDF (Pro)
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <Key className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-blue-900">{currentAnalysis.keywords.length}</p>
                          <p className="text-sm text-blue-700">Keywords Encontradas</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-900">{currentAnalysis.competitors.length}</p>
                          <p className="text-sm text-green-700">Competidores</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <Lightbulb className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-purple-900">{currentAnalysis.opportunities.length}</p>
                          <p className="text-sm text-purple-700">Oportunidades</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-orange-900">{currentAnalysis.metrics.averageDensity.toFixed(1)}%</p>
                          <p className="text-sm text-orange-700">Densidad Promedio</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Keywords by Category */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Keywords por Categoría</CardTitle>
                      <CardDescription>
                        Palabras clave organizadas por tipo y relevancia
                        {planLimits.maxKeywordsPerResult > 0 && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Mostrando {Math.min(currentAnalysis.keywords.length, planLimits.maxKeywordsPerResult)} de {currentAnalysis.keywords.length} keywords
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {['primary', 'secondary', 'long-tail', 'brand'].map((category) => {
                          const categoryKeywords = currentAnalysis.keywords.filter(k => k.category === category);
                          return (
                            <div key={category} className="space-y-2">
                              <h4 className="font-semibold capitalize flex items-center gap-2">
                                <Badge variant="outline">{categoryKeywords.length}</Badge>
                                {category === 'long-tail' ? 'Long-tail' : category}
                              </h4>
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {categoryKeywords.slice(0, 10).map((keyword, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                    <span className="font-medium">{keyword.keyword}</span>
                                    <Badge variant="secondary">{keyword.density.toFixed(1)}%</Badge>
                                  </div>
                                ))}
                                {categoryKeywords.length > 10 && (
                                  <p className="text-xs text-gray-500 text-center">
                                    +{categoryKeywords.length - 10} más
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Competitor Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Análisis de Competidores</CardTitle>
                      <CardDescription>
                        Comparación de keywords entre competidores
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {currentAnalysis.competitors.map((competitor, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold">{competitor.url}</h4>
                                <p className="text-sm text-gray-600">
                                  {competitor.topKeywords.length} keywords principales
                                </p>
                              </div>
                              <Badge variant="outline">
                                Score: {competitor.competitorScore}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {competitor.topKeywords.slice(0, 8).map((keyword, kidx) => (
                                <Badge key={kidx} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                              {competitor.topKeywords.length > 8 && (
                                <Badge variant="outline" className="text-xs">
                                  +{competitor.topKeywords.length - 8}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* SEO Opportunities */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Oportunidades SEO</CardTitle>
                      <CardDescription>
                        Recomendaciones basadas en el análisis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentAnalysis.opportunities.map((opportunity, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className={`p-1 rounded-full ${
                              opportunity.priority === 'high' ? 'bg-red-100' :
                              opportunity.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                            }`}>
                              <Lightbulb className={`h-4 w-4 ${
                                opportunity.priority === 'high' ? 'text-red-600' :
                                opportunity.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium">{opportunity.title}</h4>
                                <Badge variant={
                                  opportunity.priority === 'high' ? 'destructive' :
                                  opportunity.priority === 'medium' ? 'default' : 'secondary'
                                }>
                                  {opportunity.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
                              <p className="text-xs text-gray-500">
                                Impacto estimado: {opportunity.estimatedImpact}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Análisis</CardTitle>
                  <CardDescription>
                    Tus análisis anteriores de palabras clave
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No tienes análisis previos</p>
                      <p className="text-sm text-gray-500">Inicia tu primer análisis para ver el historial aquí</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analysisHistory.map((analysis, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div>
                            <h4 className="font-medium">
                              Análisis de {analysis.keywords.length} keywords
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(analysis.createdAt).toLocaleDateString()} - {analysis.competitors.length} competidores
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadAnalysis(analysis)}
                            >
                              Ver Resultados
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAnalysis(analysis.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Features Section (when no analysis is active) */}
          {!currentAnalysis && activeTab === 'configure' && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Características de la Herramienta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Search className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Scraping Inteligente</h3>
                    <p className="text-sm text-gray-600">
                      Extrae keywords de meta tags, headings y contenido con IA
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Métricas Avanzadas</h3>
                    <p className="text-sm text-gray-600">
                      Densidad, frecuencia y análisis de relevancia semántica
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Análisis Competitivo</h3>
                    <p className="text-sm text-gray-600">
                      Compara múltiples competidores simultáneamente
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-orange-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Lightbulb className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Oportunidades SEO</h3>
                    <p className="text-sm text-gray-600">
                      Detecta gaps y sugiere optimizaciones automáticamente
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-red-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Download className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Exportación Flexible</h3>
                    <p className="text-sm text-gray-600">
                      Exporta en CSV (todos los planes) y PDF (Pro+)
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Progreso en Tiempo Real</h3>
                    <p className="text-sm text-gray-600">
                      Monitorea el progreso del análisis en vivo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
      
      <HomeFloatingButton />
    </div>
  );
}