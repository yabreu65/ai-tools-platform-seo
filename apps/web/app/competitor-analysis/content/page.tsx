'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { FileText, TrendingUp, Target, Download, Filter, Eye, AlertCircle, Lightbulb, ExternalLink, Calendar, Clock, Users, Search } from 'lucide-react';
import { toast } from 'sonner';

const ContentAnalysis = () => {
  const [domains, setDomains] = useState(['']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [filters, setFilters] = useState({
    contentType: 'all',
    minWordCount: 500,
    dateRange: '6months',
    includeImages: true,
    includeVideos: true
  });

  // Mock data para análisis de contenido
  const mockContentData = {
    summary: {
      totalPages: 1847,
      avgWordCount: 1250,
      topPerformingPages: 234,
      contentGaps: 45,
      duplicateContent: 12,
      lowQualityPages: 89,
      highEngagementPages: 156,
      organicTraffic: 125000,
      avgTimeOnPage: 185,
      bounceRate: 42
    },
    contentTypes: [
      { type: 'Blog Posts', count: 456, avgTraffic: 2500, avgEngagement: 3.2 },
      { type: 'Product Pages', count: 234, avgTraffic: 1800, avgEngagement: 2.8 },
      { type: 'Landing Pages', count: 123, avgTraffic: 3200, avgEngagement: 4.1 },
      { type: 'Guides', count: 89, avgTraffic: 4500, avgEngagement: 5.2 },
      { type: 'Case Studies', count: 67, avgTraffic: 3800, avgEngagement: 4.8 }
    ],
    topPages: [
      {
        url: '/ultimate-seo-guide',
        title: 'The Ultimate SEO Guide for 2024',
        wordCount: 3500,
        organicTraffic: 15000,
        backlinks: 234,
        socialShares: 1200,
        publishDate: '2024-01-15',
        lastUpdated: '2024-01-20',
        contentScore: 92,
        readabilityScore: 85,
        keywords: ['seo guide', 'seo tips', 'search optimization']
      },
      {
        url: '/keyword-research-tools',
        title: 'Best Keyword Research Tools Comparison',
        wordCount: 2800,
        organicTraffic: 12000,
        backlinks: 189,
        socialShares: 890,
        publishDate: '2024-01-10',
        lastUpdated: '2024-01-18',
        contentScore: 88,
        readabilityScore: 82,
        keywords: ['keyword research', 'seo tools', 'keyword analysis']
      },
      {
        url: '/content-marketing-strategy',
        title: 'Content Marketing Strategy That Works',
        wordCount: 2200,
        organicTraffic: 9500,
        backlinks: 156,
        socialShares: 650,
        publishDate: '2024-01-05',
        lastUpdated: '2024-01-15',
        contentScore: 85,
        readabilityScore: 88,
        keywords: ['content marketing', 'marketing strategy', 'content creation']
      }
    ],
    contentGaps: [
      {
        topic: 'Local SEO Optimization',
        searchVolume: 8900,
        difficulty: 45,
        competitorCoverage: ['competitor1.com', 'competitor2.com'],
        suggestedKeywords: ['local seo', 'google my business', 'local search'],
        opportunity: 'high',
        estimatedTraffic: 3500
      },
      {
        topic: 'Voice Search Optimization',
        searchVolume: 5600,
        difficulty: 38,
        competitorCoverage: ['competitor1.com'],
        suggestedKeywords: ['voice search seo', 'voice optimization', 'alexa seo'],
        opportunity: 'medium',
        estimatedTraffic: 2200
      },
      {
        topic: 'E-commerce SEO',
        searchVolume: 12000,
        difficulty: 62,
        competitorCoverage: ['competitor2.com', 'competitor3.com'],
        suggestedKeywords: ['ecommerce seo', 'product page seo', 'online store optimization'],
        opportunity: 'high',
        estimatedTraffic: 4800
      }
    ],
    competitorContent: [
      {
        domain: 'competitor1.com',
        totalPages: 2100,
        avgWordCount: 1450,
        topTopics: ['SEO Tools', 'Content Marketing', 'Digital Marketing'],
        contentFrequency: 12, // posts per month
        avgSocialShares: 450,
        contentScore: 78
      },
      {
        domain: 'competitor2.com',
        totalPages: 1800,
        avgWordCount: 1200,
        topTopics: ['Keyword Research', 'Link Building', 'Technical SEO'],
        contentFrequency: 8,
        avgSocialShares: 320,
        contentScore: 72
      }
    ]
  };

  const contentQualityDistribution = [
    { range: 'Excelente (90-100)', count: 156, color: '#10b981' },
    { range: 'Bueno (70-89)', count: 456, color: '#84cc16' },
    { range: 'Regular (50-69)', count: 234, color: '#f59e0b' },
    { range: 'Bajo (0-49)', count: 89, color: '#ef4444' }
  ];

  const contentPerformanceData = [
    { month: 'Ene', traffic: 95000, engagement: 3.2, newContent: 12 },
    { month: 'Feb', traffic: 102000, engagement: 3.5, newContent: 15 },
    { month: 'Mar', traffic: 108000, engagement: 3.8, newContent: 18 },
    { month: 'Abr', traffic: 115000, engagement: 4.1, newContent: 14 },
    { month: 'May', traffic: 122000, engagement: 4.3, newContent: 16 },
    { month: 'Jun', traffic: 125000, engagement: 4.5, newContent: 20 }
  ];

  const contentTypeDistribution = mockContentData.contentTypes.map(type => ({
    name: type.type,
    value: type.count,
    traffic: type.avgTraffic
  }));

  const radarData = [
    { subject: 'Calidad', A: 85, B: 72, fullMark: 100 },
    { subject: 'Frecuencia', A: 78, B: 65, fullMark: 100 },
    { subject: 'Engagement', A: 82, B: 68, fullMark: 100 },
    { subject: 'SEO Score', A: 88, B: 75, fullMark: 100 },
    { subject: 'Originalidad', A: 90, B: 70, fullMark: 100 },
    { subject: 'Longitud', A: 75, B: 80, fullMark: 100 }
  ];

  const handleAnalyze = async () => {
    const validDomains = domains.filter(d => d.trim());
    if (validDomains.length === 0) {
      toast.error('Debes agregar al menos un dominio');
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/competitor-analysis/content/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domains: validDomains,
          filters: {
            contentType: filters.contentType,
            minWordCount: filters.minWordCount,
            dateRange: filters.dateRange,
            includeImages: filters.includeImages,
            includeVideos: filters.includeVideos
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al analizar el contenido');
      }

      const result = await response.json();
      
      toast.success('Análisis de contenido completado');
      setAnalysisComplete(true);
      
      console.log('Content analysis result:', result);
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al analizar el contenido');
      console.error('Content analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addDomain = () => {
    if (domains.length < 5) {
      setDomains([...domains, '']);
    }
  };

  const removeDomain = (index: number) => {
    if (domains.length > 1) {
      setDomains(domains.filter((_, i) => i !== index));
    }
  };

  const updateDomain = (index: number, value: string) => {
    const newDomains = [...domains];
    newDomains[index] = value;
    setDomains(newDomains);
  };

  const getOpportunityBadge = (opportunity: string) => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[opportunity as keyof typeof colors]}>
        {opportunity === 'high' ? 'Alta' : opportunity === 'medium' ? 'Media' : 'Baja'}
      </Badge>
    );
  };

  const getContentScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
    if (score >= 70) return <Badge className="bg-blue-100 text-blue-800">Bueno</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-100 text-yellow-800">Regular</Badge>;
    return <Badge className="bg-red-100 text-red-800">Bajo</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análisis de Contenido</h1>
          <p className="text-gray-600 mt-2">Analiza el contenido y encuentra gaps de oportunidad</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Análisis
        </Button>
      </div>

      {!analysisComplete ? (
        /* Formulario de Configuración */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Configurar Análisis de Contenido
            </CardTitle>
            <CardDescription>
              Configura los dominios y filtros para el análisis de contenido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dominios */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Dominios a Analizar</Label>
              {domains.map((domain, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Dominio ${index + 1} (ej: example.com)`}
                    value={domain}
                    onChange={(e) => updateDomain(index, e.target.value)}
                    className="flex-1"
                  />
                  {domains.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDomain(index)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              ))}
              {domains.length < 5 && (
                <Button variant="outline" onClick={addDomain}>
                  + Agregar Dominio
                </Button>
              )}
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Contenido</Label>
                <Select value={filters.contentType} onValueChange={(value) => setFilters({...filters, contentType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="blog">Blog Posts</SelectItem>
                    <SelectItem value="product">Páginas de Producto</SelectItem>
                    <SelectItem value="landing">Landing Pages</SelectItem>
                    <SelectItem value="guides">Guías</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Palabras Mínimas</Label>
                <Input
                  type="number"
                  value={filters.minWordCount}
                  onChange={(e) => setFilters({...filters, minWordCount: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label>Rango de Fechas</Label>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters({...filters, dateRange: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">Último mes</SelectItem>
                    <SelectItem value="3months">Últimos 3 meses</SelectItem>
                    <SelectItem value="6months">Últimos 6 meses</SelectItem>
                    <SelectItem value="1year">Último año</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="images"
                  checked={filters.includeImages}
                  onCheckedChange={(checked) => setFilters({...filters, includeImages: !!checked})}
                />
                <Label htmlFor="images">Incluir análisis de imágenes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="videos"
                  checked={filters.includeVideos}
                  onCheckedChange={(checked) => setFilters({...filters, includeVideos: !!checked})}
                />
                <Label htmlFor="videos">Incluir análisis de videos</Label>
              </div>
            </div>

            {/* Botón de Análisis */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || domains.filter(d => d.trim()).length === 0}
                className="px-8 py-3 text-lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analizando Contenido...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Iniciar Análisis
                  </>
                )}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-3">
                <div className="text-center text-sm text-gray-600">
                  Analizando contenido y detectando gaps...
                </div>
                <Progress value={65} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Resultados del Análisis */
        <div className="space-y-6">
          {/* Métricas de Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Páginas</p>
                    <p className="text-2xl font-bold text-gray-900">{mockContentData.summary.totalPages.toLocaleString()}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gaps de Contenido</p>
                    <p className="text-2xl font-bold text-orange-600">{mockContentData.summary.contentGaps}</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tráfico Orgánico</p>
                    <p className="text-2xl font-bold text-green-600">{mockContentData.summary.organicTraffic.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Promedio Palabras</p>
                    <p className="text-2xl font-bold text-purple-600">{mockContentData.summary.avgWordCount}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de Análisis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo de Contenido</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contentTypeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}`}
                    >
                      {contentTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calidad del Contenido</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={contentQualityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Rendimiento del Contenido */}
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento del Contenido</CardTitle>
              <CardDescription>Tráfico, engagement y contenido nuevo por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={contentPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="traffic" stroke="#3b82f6" strokeWidth={2} name="Tráfico" />
                  <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} name="Engagement" />
                  <Bar yAxisId="right" dataKey="newContent" fill="#f59e0b" name="Contenido Nuevo" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comparación con Competidores */}
          <Card>
            <CardHeader>
              <CardTitle>Comparación de Contenido</CardTitle>
              <CardDescription>Tu sitio vs competidores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Tu Sitio" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Competidores" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabs de Resultados */}
          <Tabs defaultValue="top-pages" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="top-pages">Top Páginas ({mockContentData.topPages.length})</TabsTrigger>
              <TabsTrigger value="content-gaps">Gaps de Contenido ({mockContentData.contentGaps.length})</TabsTrigger>
              <TabsTrigger value="competitor-content">Contenido Competidores</TabsTrigger>
            </TabsList>

            <TabsContent value="top-pages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Páginas con Mejor Rendimiento</CardTitle>
                  <CardDescription>Contenido que genera más tráfico y engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockContentData.topPages.map((page, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-lg mb-1">{page.title}</h4>
                            <p className="text-sm text-gray-600">{page.url}</p>
                          </div>
                          <div className="flex gap-2">
                            {getContentScoreBadge(page.contentScore)}
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Tráfico:</span>
                            <span className="ml-2 font-medium">{page.organicTraffic.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Palabras:</span>
                            <span className="ml-2 font-medium">{page.wordCount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Backlinks:</span>
                            <span className="ml-2 font-medium">{page.backlinks}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Shares:</span>
                            <span className="ml-2 font-medium">{page.socialShares}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex gap-4">
                            <span className="text-gray-600">
                              <Calendar className="h-4 w-4 inline mr-1" />
                              {new Date(page.publishDate).toLocaleDateString()}
                            </span>
                            <span className="text-gray-600">
                              <Clock className="h-4 w-4 inline mr-1" />
                              Actualizado: {new Date(page.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {page.keywords.slice(0, 2).map((keyword, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content-gaps" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Oportunidades de Contenido</CardTitle>
                  <CardDescription>Temas que tus competidores cubren pero tú no</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockContentData.contentGaps.map((gap, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium text-lg">{gap.topic}</h4>
                            {getOpportunityBadge(gap.opportunity)}
                          </div>
                          <Button variant="outline" size="sm">
                            <Lightbulb className="h-4 w-4 mr-1" />
                            Crear Contenido
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Volumen:</span>
                            <span className="ml-2 font-medium">{gap.searchVolume.toLocaleString()}/mes</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Dificultad:</span>
                            <span className="ml-2 font-medium">{gap.difficulty}/100</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Competidores:</span>
                            <span className="ml-2 font-medium">{gap.competitorCoverage.length}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tráfico Est.:</span>
                            <span className="ml-2 font-medium">{gap.estimatedTraffic.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="text-gray-600">Keywords sugeridas:</span>
                          <div className="flex gap-2 mt-1">
                            {gap.suggestedKeywords.map((keyword, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 text-sm">
                          <span className="text-gray-600">Competidores que lo cubren:</span>
                          <div className="flex gap-2 mt-1">
                            {gap.competitorCoverage.map((competitor, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {competitor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competitor-content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Contenido de Competidores</CardTitle>
                  <CardDescription>Estrategias de contenido de la competencia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockContentData.competitorContent.map((competitor, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-lg">{competitor.domain}</h4>
                          <div className="flex gap-2">
                            {getContentScoreBadge(competitor.contentScore)}
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Analizar
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Total Páginas:</span>
                            <span className="ml-2 font-medium">{competitor.totalPages.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Promedio Palabras:</span>
                            <span className="ml-2 font-medium">{competitor.avgWordCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Frecuencia:</span>
                            <span className="ml-2 font-medium">{competitor.contentFrequency}/mes</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Shares Promedio:</span>
                            <span className="ml-2 font-medium">{competitor.avgSocialShares}</span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="text-gray-600">Temas principales:</span>
                          <div className="flex gap-2 mt-1">
                            {competitor.topTopics.map((topic, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ContentAnalysis;