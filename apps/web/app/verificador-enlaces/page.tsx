'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';
import {
  Link2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  ExternalLink,
  Download,
  Filter,
  Search,
  Clock,
  BarChart3,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye,
  FileText,
  Lightbulb
} from 'lucide-react';
import { ExportDropdown } from '@/components/export';
import { useAuth } from '@/contexts/AuthContext';
import { ToolPageSkeleton, CardSkeleton } from '@/components/loading/SkeletonLoaders';

interface BrokenLink {
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  errorType: string;
  linkType: 'internal' | 'external';
}

interface AnalysisStatus {
  analysisId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  pagesAnalyzed: number;
  linksFound: number;
  brokenLinks: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

interface AnalysisResults {
  summary: {
    totalPages: number;
    totalLinks: number;
    brokenLinks: number;
    healthScore: number;
    analysisTime: number;
  };
  brokenLinks: BrokenLink[];
  recommendations: string[];
}

export default function VerificadorEnlacesPage() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState(1);
  const [includeExternal, setIncludeExternal] = useState(true);
  const [excludePaths, setExcludePaths] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisStatus | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'broken' | 'internal' | 'external'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Polling para obtener el estado del análisis
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentAnalysis && currentAnalysis.status === 'running') {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/broken-links/analyze/${currentAnalysis.analysisId}`, {
            headers: {
              'x-user-id': user?.id || 'demo-user',
              'x-user-plan': user?.plan || 'free'
            }
          });
          
          if (response.ok) {
            const status = await response.json();
            setCurrentAnalysis(status.data);
            
            if (status.data.status === 'completed') {
              await loadResults(currentAnalysis.analysisId);
              setIsAnalyzing(false);
            } else if (status.data.status === 'failed') {
              setIsAnalyzing(false);
            }
          }
        } catch (error) {
          console.error('Error al obtener estado:', error);
        }
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentAnalysis, user]);

  const loadResults = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/broken-links/results/${analysisId}`, {
        headers: {
          'x-user-id': user?.id || 'demo-user',
          'x-user-plan': user?.plan || 'free'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.data);
      }
    } catch (error) {
      console.error('Error al cargar resultados:', error);
    }
  };

  const startAnalysis = async () => {
    if (!url) return;
    
    setIsAnalyzing(true);
    setResults(null);
    setCurrentAnalysis(null);
    
    try {
      const response = await fetch('/api/broken-links/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user',
          'x-user-plan': user?.plan || 'free'
        },
        body: JSON.stringify({
          url,
          depth,
          includeExternal,
          excludePaths: excludePaths.split('\n').filter(path => path.trim()),
          timeout: 10000
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentAnalysis({
          analysisId: data.data.analysisId,
          status: 'running',
          progress: 0,
          pagesAnalyzed: 0,
          linksFound: 0,
          brokenLinks: 0,
          startedAt: new Date().toISOString()
        });
      } else {
        const error = await response.json();
        console.error('Error al iniciar análisis:', error);
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('Error al iniciar análisis:', error);
      setIsAnalyzing(false);
    }
  };

  const cancelAnalysis = async () => {
    if (!currentAnalysis) return;
    
    try {
      await fetch(`/api/broken-links/analyze/${currentAnalysis.analysisId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id || 'demo-user',
          'x-user-plan': user?.plan || 'free'
        }
      });
      
      setIsAnalyzing(false);
      setCurrentAnalysis(null);
    } catch (error) {
      console.error('Error al cancelar análisis:', error);
    }
  };

  const exportResults = async (format: 'csv' | 'pdf') => {
    if (!currentAnalysis) return;
    
    try {
      const response = await fetch(`/api/broken-links/export/${currentAnalysis.analysisId}?format=${format}`, {
        headers: {
          'x-user-id': user?.id || 'demo-user',
          'x-user-plan': user?.plan || 'free'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enlaces-rotos-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  const filteredBrokenLinks = results?.brokenLinks.filter(link => {
    const matchesFilter = filterType === 'all' || 
      (filterType === 'broken' && link.statusCode >= 400) ||
      (filterType === 'internal' && link.linkType === 'internal') ||
      (filterType === 'external' && link.linkType === 'external');
    
    const matchesSearch = !searchTerm || 
      link.targetUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.sourceUrl.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }) || [];

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600';
    if (statusCode >= 300 && statusCode < 400) return 'text-yellow-600';
    if (statusCode >= 400 && statusCode < 500) return 'text-red-600';
    if (statusCode >= 500) return 'text-red-800';
    return 'text-gray-600';
  };

  const getStatusIcon = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (statusCode >= 300 && statusCode < 400) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (isLoading) {
    return <ToolPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-rose-600 rounded-xl text-white">
              <Link2 className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent mb-4">
            Verificador de Enlaces Rotos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analiza tu sitio web y encuentra enlaces que no funcionan. Mejora la experiencia de usuario y tu SEO.
          </p>
        </motion.div>

        {/* Configuración del análisis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración del Análisis
              </CardTitle>
              <CardDescription>
                Configura los parámetros para el análisis de enlaces rotos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="url">URL del sitio web</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://ejemplo.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isAnalyzing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="depth">Profundidad de análisis</Label>
                  <Select value={depth.toString()} onValueChange={(value) => setDepth(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(d => (
                        <SelectItem key={d} value={d.toString()}>
                          {d} nivel{d > 1 ? 'es' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeExternal"
                  checked={includeExternal}
                  onCheckedChange={(checked) => setIncludeExternal(checked as boolean)}
                  disabled={isAnalyzing}
                />
                <Label htmlFor="includeExternal">Incluir enlaces externos</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excludePaths">Rutas a excluir (una por línea)</Label>
                <textarea
                  id="excludePaths"
                  className="w-full p-2 border rounded-md resize-none"
                  rows={3}
                  placeholder="/admin&#10;/private&#10;/test"
                  value={excludePaths}
                  onChange={(e) => setExcludePaths(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={startAnalysis}
                  disabled={!url || isAnalyzing}
                  className="bg-gradient-to-r from-purple-500 to-rose-600 hover:from-purple-600 hover:to-rose-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Análisis
                    </>
                  )}
                </Button>
                
                {isAnalyzing && (
                  <Button
                    onClick={cancelAnalysis}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progreso del análisis */}
        {currentAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Progreso del Análisis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={currentAnalysis.progress} className="w-full" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {currentAnalysis.pagesAnalyzed}
                      </div>
                      <div className="text-sm text-gray-600">Páginas analizadas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {currentAnalysis.linksFound}
                      </div>
                      <div className="text-sm text-gray-600">Enlaces encontrados</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {currentAnalysis.brokenLinks}
                      </div>
                      <div className="text-sm text-gray-600">Enlaces rotos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(currentAnalysis.progress)}%
                      </div>
                      <div className="text-sm text-gray-600">Completado</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Resultados */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="broken-links">Enlaces Rotos</TabsTrigger>
                <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Páginas Analizadas</p>
                          <p className="text-2xl font-bold text-purple-600">{results.summary.totalPages}</p>
                        </div>
                        <Globe className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Enlaces Totales</p>
                          <p className="text-2xl font-bold text-blue-600">{results.summary.totalLinks}</p>
                        </div>
                        <Link2 className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Enlaces Rotos</p>
                          <p className="text-2xl font-bold text-red-600">{results.summary.brokenLinks}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Puntuación de Salud</p>
                          <p className="text-2xl font-bold text-green-600">{results.summary.healthScore}%</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="broken-links">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Enlaces Rotos Encontrados</CardTitle>
                      <div className="flex gap-2">
                        <ExportDropdown
                          onExport={(format) => exportResults(format as 'csv' | 'pdf')}
                          formats={user?.plan === 'free' ? ['csv'] : ['csv', 'pdf']}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Filtros */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Buscar enlaces..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                        <SelectTrigger className="w-full md:w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los enlaces</SelectItem>
                          <SelectItem value="broken">Solo rotos</SelectItem>
                          <SelectItem value="internal">Internos</SelectItem>
                          <SelectItem value="external">Externos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Lista de enlaces */}
                    <div className="space-y-4">
                      {filteredBrokenLinks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No se encontraron enlaces con los filtros aplicados
                        </div>
                      ) : (
                        filteredBrokenLinks.map((link, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(link.statusCode)}
                                  <span className={`font-medium ${getStatusColor(link.statusCode)}`}>
                                    {link.statusCode} - {link.errorType}
                                  </span>
                                  <Badge variant={link.linkType === 'internal' ? 'default' : 'secondary'}>
                                    {link.linkType === 'internal' ? 'Interno' : 'Externo'}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <strong>Enlace roto:</strong> {link.targetUrl}
                                </div>
                                <div className="text-sm text-gray-500">
                                  <strong>Encontrado en:</strong> {link.sourceUrl}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(link.targetUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Recomendaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.recommendations?.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-800">{recommendation}</p>
                        </div>
                      )) || (
                        <p className="text-gray-500">No hay recomendaciones disponibles.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        <HomeFloatingButton />
      </div>
    </div>
  );
}