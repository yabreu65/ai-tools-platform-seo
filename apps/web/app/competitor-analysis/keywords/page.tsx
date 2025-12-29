'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Download, 
  Eye, 
  AlertCircle, 
  Lightbulb,
  Brain,
  Zap,
  Globe,
  Users,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  Sparkles,
  Database,
  Flame
} from 'lucide-react';
import { toast } from 'sonner';

// Interfaces
interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  competitorData: CompetitorKeywordData[];
  opportunity: 'high' | 'medium' | 'low';
  intent: 'commercial' | 'informational' | 'navigational' | 'transactional';
  seasonality: number;
  aiScore: number;
  relatedKeywords: string[];
  contentGap: boolean;
  quickWin: boolean;
}

interface CompetitorKeywordData {
  domain: string;
  position: number;
  traffic: number;
  hasKeyword: boolean;
  url?: string;
  title?: string;
}

interface KeywordGap {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  competitorCount: number;
  opportunity: 'high' | 'medium' | 'low';
  aiRecommendation: string;
  contentType: string;
  estimatedTraffic: number;
}

interface AIInsight {
  type: 'opportunity' | 'threat' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  keywords: string[];
}

const KeywordAnalysisAdvanced = () => {
  // Estados principales
  const [domains, setDomains] = useState(['', '']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    minSearchVolume: 100,
    maxDifficulty: 80,
    intent: 'all',
    opportunity: 'all',
    quickWinsOnly: false,
    contentGapsOnly: false,
    includeShared: true,
    includeUnique: true
  });

  // Mock data avanzado
  const mockAnalysisData = {
    summary: {
      totalKeywords: 15847,
      sharedKeywords: 3421,
      uniqueKeywords: 8926,
      keywordGaps: 1247,
      highOpportunities: 892,
      quickWins: 234,
      aiScore: 87,
      marketShare: 23.4,
      avgSearchVolume: 2847
    },
    sharedKeywords: [
      {
        keyword: 'marketing digital',
        searchVolume: 45000,
        difficulty: 72,
        cpc: 3.45,
        trend: 'up' as const,
        trendPercentage: 15,
        opportunity: 'high' as const,
        intent: 'commercial' as const,
        aiScore: 92,
        quickWin: true,
        contentGap: false,
        seasonality: 85,
        relatedKeywords: ['marketing online', 'publicidad digital', 'estrategia digital'],
        competitorData: [
          { domain: 'competitor1.com', position: 3, traffic: 12500, hasKeyword: true, title: 'Guía Completa de Marketing Digital 2024' },
          { domain: 'competitor2.com', position: 7, traffic: 8200, hasKeyword: true, title: 'Marketing Digital: Estrategias Efectivas' }
        ]
      },
      {
        keyword: 'seo optimization',
        searchVolume: 28000,
        difficulty: 65,
        cpc: 4.20,
        trend: 'stable' as const,
        trendPercentage: 3,
        opportunity: 'medium' as const,
        intent: 'informational' as const,
        aiScore: 78,
        quickWin: false,
        contentGap: true,
        seasonality: 92,
        relatedKeywords: ['optimización seo', 'posicionamiento web', 'seo técnico'],
        competitorData: [
          { domain: 'competitor1.com', position: 5, traffic: 9800, hasKeyword: true },
          { domain: 'competitor2.com', position: 12, traffic: 4200, hasKeyword: true }
        ]
      }
    ],
    uniqueOpportunities: [
      {
        keyword: 'ia marketing automation',
        searchVolume: 12000,
        difficulty: 45,
        cpc: 5.80,
        trend: 'up' as const,
        trendPercentage: 35,
        opportunity: 'high' as const,
        intent: 'commercial' as const,
        aiScore: 95,
        quickWin: true,
        contentGap: false,
        seasonality: 78,
        relatedKeywords: ['automatización marketing', 'ai marketing tools', 'marketing inteligente']
      },
      {
        keyword: 'voice search optimization',
        searchVolume: 8500,
        difficulty: 38,
        cpc: 3.90,
        trend: 'up' as const,
        trendPercentage: 28,
        opportunity: 'high' as const,
        intent: 'informational' as const,
        aiScore: 88,
        quickWin: true,
        contentGap: true,
        seasonality: 65,
        relatedKeywords: ['búsqueda por voz', 'seo vocal', 'optimización asistentes']
      }
    ],
    keywordGaps: [
      {
        keyword: 'content marketing roi',
        searchVolume: 15000,
        difficulty: 55,
        competitorCount: 3,
        opportunity: 'high' as const,
        contentType: 'Blog Post',
        estimatedTraffic: 4200,
        aiRecommendation: 'Crear contenido detallado sobre ROI en content marketing con casos de estudio y métricas específicas.'
      },
      {
        keyword: 'social media analytics',
        searchVolume: 22000,
        difficulty: 62,
        competitorCount: 4,
        opportunity: 'medium' as const,
        contentType: 'Guía',
        estimatedTraffic: 6800,
        aiRecommendation: 'Desarrollar una guía completa de analytics para redes sociales con herramientas y KPIs.'
      }
    ],
    aiInsights: [
      {
        type: 'opportunity' as const,
        title: 'Tendencia Emergente: IA en Marketing',
        description: 'Se detecta un crecimiento del 45% en búsquedas relacionadas con IA aplicada al marketing. Oportunidad para posicionarse como líder.',
        impact: 'high' as const,
        actionable: true,
        keywords: ['ia marketing', 'artificial intelligence marketing', 'marketing automation ai']
      },
      {
        type: 'threat' as const,
        title: 'Competidor Ganando Terreno',
        description: 'Competitor1.com ha mejorado posiciones en 15% de keywords compartidas en los últimos 3 meses.',
        impact: 'medium' as const,
        actionable: true,
        keywords: ['marketing digital', 'seo services', 'content strategy']
      },
      {
        type: 'recommendation' as const,
        title: 'Optimizar para Búsquedas Locales',
        description: 'El 23% de las keywords tienen intención local. Recomienda crear contenido geo-específico.',
        impact: 'medium' as const,
        actionable: true,
        keywords: ['marketing local', 'seo local', 'publicidad geolocalizada']
      }
    ],
    competitorAnalysis: {
      'competitor1.com': {
        totalKeywords: 8945,
        avgPosition: 12.3,
        estimatedTraffic: 245000,
        strengths: ['Contenido técnico profundo', 'Autoridad en SEO', 'Backlinks de calidad'],
        weaknesses: ['Contenido desactualizado', 'Poca presencia en redes', 'UX mejorable'],
        topKeywords: ['seo audit', 'technical seo', 'link building', 'keyword research']
      },
      'competitor2.com': {
        totalKeywords: 6234,
        avgPosition: 15.7,
        estimatedTraffic: 189000,
        strengths: ['Contenido actualizado', 'Buena UX', 'Estrategia de contenidos'],
        weaknesses: ['Autoridad limitada', 'Pocos backlinks', 'Contenido superficial'],
        topKeywords: ['digital marketing', 'social media', 'content marketing', 'email marketing']
      }
    }
  };

  // Funciones principales
  const handleAnalyzeKeywords = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simular progreso
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setAnalysisComplete(true);
          toast.success('Análisis completado con IA');
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      toast.error('Error en el análisis');
      setIsAnalyzing(false);
      clearInterval(interval);
    }
  };

  const addDomain = () => {
    if (domains.length < 5) {
      setDomains([...domains, '']);
    }
  };

  const removeDomain = (index: number) => {
    if (domains.length > 2) {
      setDomains(domains.filter((_, i) => i !== index));
    }
  };

  const updateDomain = (index: number, value: string) => {
    const newDomains = [...domains];
    newDomains[index] = value;
    setDomains(newDomains);
  };

  const toggleKeywordSelection = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  // Funciones helper
  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string, percentage: number) => {
    if (trend === 'up') return <ArrowUp className="h-3 w-3 text-green-600" />;
    if (trend === 'down') return <ArrowDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-gray-600" />;
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'commercial': return 'bg-blue-100 text-blue-800';
      case 'informational': return 'bg-purple-100 text-purple-800';
      case 'navigational': return 'bg-orange-100 text-orange-800';
      case 'transactional': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Datos para gráficos
  const keywordDistributionData = [
    { name: 'Compartidas', value: mockAnalysisData.summary.sharedKeywords, color: '#10B981' },
    { name: 'Únicas', value: mockAnalysisData.summary.uniqueKeywords, color: '#3B82F6' },
    { name: 'Oportunidades', value: mockAnalysisData.summary.keywordGaps, color: '#F59E0B' }
  ];

  const opportunityData = [
    { opportunity: 'Alta', count: mockAnalysisData.summary.highOpportunities },
    { opportunity: 'Media', count: 1456 },
    { opportunity: 'Baja', count: 892 }
  ];

  const difficultyVolumeData = [
    ...mockAnalysisData.sharedKeywords.map(k => ({
      keyword: k.keyword,
      difficulty: k.difficulty,
      volume: k.searchVolume,
      opportunity: k.opportunity
    })),
    ...mockAnalysisData.uniqueOpportunities.map(k => ({
      keyword: k.keyword,
      difficulty: k.difficulty,
      volume: k.searchVolume,
      opportunity: k.opportunity
    }))
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análisis de Keywords Avanzado con IA</h1>
          <p className="text-gray-600 mt-2">Descubre oportunidades de keywords con inteligencia artificial</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurar IA
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Datos
          </Button>
        </div>
      </div>

      {/* Configuración de Análisis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Configuración del Análisis
          </CardTitle>
          <CardDescription>
            Configura los dominios a analizar y las opciones de IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dominios */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Dominios a Comparar</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addDomain}
                disabled={domains.length >= 5}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Dominio
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {domains.map((domain, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Dominio ${index + 1} (ej: competitor.com)`}
                    value={domain}
                    onChange={(e) => updateDomain(index, e.target.value)}
                  />
                  {domains.length > 2 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeDomain(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Opciones de IA */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Opciones de Inteligencia Artificial</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                 <Switch
                   checked={aiAnalysisEnabled}
                   onCheckedChange={setAiAnalysisEnabled}
                 />
                 <Label className="flex items-center gap-2">
                   <Brain className="h-4 w-4" />
                   Análisis con IA habilitado
                 </Label>
               </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="content-gaps" defaultChecked />
                <Label htmlFor="content-gaps">Detectar gaps de contenido</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="quick-wins" defaultChecked />
                <Label htmlFor="quick-wins">Identificar quick wins</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="seasonal-trends" defaultChecked />
                <Label htmlFor="seasonal-trends">Analizar tendencias estacionales</Label>
              </div>
            </div>
          </div>

          {/* Filtros Avanzados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Filtros de Análisis</Label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? 'Ocultar' : 'Mostrar'} Filtros Avanzados
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Volumen Mínimo</Label>
                <Input
                  type="number"
                  value={filters.minSearchVolume}
                  onChange={(e) => setFilters({...filters, minSearchVolume: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Dificultad Máxima</Label>
                <Input
                  type="number"
                  value={filters.maxDifficulty}
                  onChange={(e) => setFilters({...filters, maxDifficulty: parseInt(e.target.value) || 100})}
                />
              </div>
              <div className="space-y-2">
                <Label>Intención de Búsqueda</Label>
                <Select value={filters.intent} onValueChange={(value) => setFilters({...filters, intent: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="commercial">Comercial</SelectItem>
                    <SelectItem value="informational">Informacional</SelectItem>
                    <SelectItem value="navigational">Navegacional</SelectItem>
                    <SelectItem value="transactional">Transaccional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Oportunidad</Label>
                <Select value={filters.opportunity} onValueChange={(value) => setFilters({...filters, opportunity: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="quick-wins-filter"
                    checked={filters.quickWinsOnly}
                    onCheckedChange={(checked) => setFilters({...filters, quickWinsOnly: !!checked})}
                  />
                  <Label htmlFor="quick-wins-filter">Solo Quick Wins</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="content-gaps-filter"
                    checked={filters.contentGapsOnly}
                    onCheckedChange={(checked) => setFilters({...filters, contentGapsOnly: !!checked})}
                  />
                  <Label htmlFor="content-gaps-filter">Solo Gaps de Contenido</Label>
                </div>
              </div>
            )}
          </div>

          {/* Botón de Análisis */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleAnalyzeKeywords}
              disabled={isAnalyzing || domains.filter(d => d.trim()).length < 2}
              className="px-8 py-3 text-lg"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Analizando con IA...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Analizar Keywords con IA
                </>
              )}
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-3">
              <div className="text-center text-sm text-gray-600">
                Analizando {domains.filter(d => d.trim()).length} dominios con IA...
              </div>
              <Progress value={analysisProgress} className="w-full" />
              <div className="text-center text-xs text-gray-500">
                {analysisProgress}% completado
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados del Análisis */}
      {(analysisComplete || true) && ( // Mostrar siempre para demo
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="shared">Compartidas ({mockAnalysisData.summary.sharedKeywords})</TabsTrigger>
            <TabsTrigger value="opportunities">Oportunidades ({mockAnalysisData.uniqueOpportunities.length})</TabsTrigger>
            <TabsTrigger value="gaps">Gaps ({mockAnalysisData.summary.keywordGaps})</TabsTrigger>
            <TabsTrigger value="ai-insights">IA Insights ({mockAnalysisData.aiInsights.length})</TabsTrigger>
            <TabsTrigger value="competitors">Competidores</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Keywords</p>
                      <p className="text-2xl font-bold">{mockAnalysisData.summary.totalKeywords.toLocaleString()}</p>
                    </div>
                    <Database className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+12% vs competidores</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Oportunidades</p>
                      <p className="text-2xl font-bold">{mockAnalysisData.summary.highOpportunities}</p>
                    </div>
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <Flame className="h-4 w-4 text-orange-600 mr-1" />
                    <span className="text-orange-600">{mockAnalysisData.summary.quickWins} Quick Wins</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Score IA</p>
                      <p className="text-2xl font-bold">{mockAnalysisData.summary.aiScore}/100</p>
                    </div>
                    <Brain className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">Excelente potencial</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Market Share</p>
                      <p className="text-2xl font-bold">{mockAnalysisData.summary.marketShare}%</p>
                    </div>
                    <PieChartIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-blue-600">Posición competitiva</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos de Resumen */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={keywordDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {keywordDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Oportunidades por Nivel</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={opportunityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="opportunity" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Análisis de Dificultad vs Volumen */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Dificultad vs Volumen de Búsqueda</CardTitle>
                <CardDescription>Identifica las mejores oportunidades basadas en dificultad y volumen</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={difficultyVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="difficulty" name="Dificultad" />
                    <YAxis dataKey="volume" name="Volumen" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded shadow">
                              <p className="font-medium">{data.keyword}</p>
                              <p>Volumen: {data.volume.toLocaleString()}</p>
                              <p>Dificultad: {data.difficulty}</p>
                              <Badge className={getOpportunityColor(data.opportunity)}>
                                {data.opportunity}
                              </Badge>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter dataKey="volume" fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shared" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Keywords Compartidas con Competidores</CardTitle>
                <CardDescription>Keywords donde compites directamente con tus competidores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalysisData.sharedKeywords.map((keyword, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedKeywords.includes(keyword.keyword)}
                            onCheckedChange={() => toggleKeywordSelection(keyword.keyword)}
                          />
                          <div>
                            <h4 className="font-medium text-lg">{keyword.keyword}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Vol: {keyword.searchVolume.toLocaleString()}</span>
                              <span>Dif: {keyword.difficulty}</span>
                              <span>CPC: ${keyword.cpc}</span>
                              <div className="flex items-center gap-1">
                                {getTrendIcon(keyword.trend, keyword.trendPercentage)}
                                <span>{keyword.trendPercentage}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getOpportunityColor(keyword.opportunity)}>
                            {keyword.opportunity}
                          </Badge>
                          <Badge className={getIntentColor(keyword.intent)}>
                            {keyword.intent}
                          </Badge>
                          {keyword.quickWin && (
                            <Badge className="bg-orange-100 text-orange-800">
                              <Zap className="h-3 w-3 mr-1" />
                              Quick Win
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-sm">
                            <Brain className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">{keyword.aiScore}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        {keyword.competitorData.map((comp, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{comp.domain}</span>
                              {'title' in comp && comp.title && <p className="text-xs text-gray-600 truncate">{comp.title}</p>}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">Pos #{comp.position}</div>
                              <div className="text-xs text-gray-600">{comp.traffic.toLocaleString()} tráfico</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {keyword.relatedKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-sm text-gray-600 mr-2">Relacionadas:</span>
                          {keyword.relatedKeywords.slice(0, 3).map((related, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {related}
                            </Badge>
                          ))}
                          {keyword.relatedKeywords.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{keyword.relatedKeywords.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Oportunidades Únicas Identificadas por IA</CardTitle>
                <CardDescription>Keywords donde no tienes competencia directa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalysisData.uniqueOpportunities.map((keyword, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow bg-gradient-to-r from-green-50 to-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedKeywords.includes(keyword.keyword)}
                            onCheckedChange={() => toggleKeywordSelection(keyword.keyword)}
                          />
                          <div>
                            <h4 className="font-medium text-lg">{keyword.keyword}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Vol: {keyword.searchVolume.toLocaleString()}</span>
                              <span>Dif: {keyword.difficulty}</span>
                              <span>CPC: ${keyword.cpc}</span>
                              <div className="flex items-center gap-1">
                                {getTrendIcon(keyword.trend, keyword.trendPercentage)}
                                <span className="text-green-600 font-medium">+{keyword.trendPercentage}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            <Star className="h-3 w-3 mr-1" />
                            Oportunidad Única
                          </Badge>
                          <Badge className={getIntentColor(keyword.intent)}>
                            {keyword.intent}
                          </Badge>
                          {keyword.quickWin && (
                            <Badge className="bg-orange-100 text-orange-800">
                              <Zap className="h-3 w-3 mr-1" />
                              Quick Win
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-sm">
                            <Brain className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-purple-600">{keyword.aiScore}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border-l-4 border-green-500 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-sm">Recomendación IA</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          Esta keyword tiene alto potencial debido a su tendencia creciente (+{keyword.trendPercentage}%) 
                          y baja competencia. Ideal para crear contenido {keyword.intent} enfocado en esta temática.
                        </p>
                      </div>

                      {keyword.relatedKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-sm text-gray-600 mr-2">Keywords relacionadas:</span>
                          {keyword.relatedKeywords.map((related, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {related}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gaps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gaps de Keywords Identificados</CardTitle>
                <CardDescription>Oportunidades donde los competidores están presentes pero tú no</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalysisData.keywordGaps.map((gap, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow bg-gradient-to-r from-yellow-50 to-orange-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-lg">{gap.keyword}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Vol: {gap.searchVolume.toLocaleString()}</span>
                            <span>Dif: {gap.difficulty}</span>
                            <span>Competidores: {gap.competitorCount}</span>
                            <span>Tráfico Est: {gap.estimatedTraffic.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getOpportunityColor(gap.opportunity)}>
                            {gap.opportunity}
                          </Badge>
                          <Badge variant="outline">
                            {gap.contentType}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-sm">Recomendación IA</span>
                        </div>
                        <p className="text-sm text-gray-700">{gap.aiRecommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Insights Generados por IA
                </CardTitle>
                <CardDescription>Análisis inteligente y recomendaciones estratégicas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalysisData.aiInsights.map((insight, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            insight.type === 'opportunity' ? 'bg-green-100' :
                            insight.type === 'threat' ? 'bg-red-100' :
                            'bg-purple-100'
                          }`}>
                            {insight.type === 'opportunity' && <Target className="h-4 w-4 text-green-600" />}
                             {insight.type === 'threat' && <AlertCircle className="h-4 w-4 text-red-600" />}
                             {insight.type === 'recommendation' && <Lightbulb className="h-4 w-4 text-purple-600" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-lg">{insight.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            Impacto {insight.impact}
                          </Badge>
                          {insight.actionable && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Accionable
                            </Badge>
                          )}
                        </div>
                      </div>

                      {insight.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          <span className="text-sm text-gray-600 mr-2">Keywords relacionadas:</span>
                          {insight.keywords.map((keyword, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análisis Detallado de Competidores</CardTitle>
                <CardDescription>Fortalezas y debilidades de cada competidor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(mockAnalysisData.competitorAnalysis).map(([domain, data]) => (
                    <div key={domain} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">{domain}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Keywords: {data.totalKeywords.toLocaleString()}</span>
                          <span>Pos. Promedio: {data.avgPosition}</span>
                          <span>Tráfico: {data.estimatedTraffic.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-green-700 mb-2">Fortalezas</h4>
                          <ul className="space-y-1">
                            {data.strengths.map((strength, i) => (
                              <li key={i} className="text-sm flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-red-700 mb-2">Debilidades</h4>
                          <ul className="space-y-1">
                            {data.weaknesses.map((weakness, i) => (
                              <li key={i} className="text-sm flex items-center gap-2">
                                <XCircle className="h-3 w-3 text-red-600" />
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Top Keywords</h4>
                        <div className="flex flex-wrap gap-1">
                          {data.topKeywords.map((keyword, i) => (
                            <Badge key={i} variant="outline">
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
        </Tabs>
      )}
    </div>
  );
};

export default KeywordAnalysisAdvanced;