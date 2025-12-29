'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  BarChart3, 
  Link as LinkIcon, 
  FileText,
  Download,
  Share2,
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Target,
  Eye,
  Search,
  Zap,
  Award,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Interfaces
interface CompetitorResult {
  domain: string;
  name?: string;
  domainRating: number;
  organicKeywords: number;
  organicTraffic: number;
  backlinks: number;
  referringDomains: number;
  technicalScore: number;
  topKeywords: KeywordData[];
  topPages: PageData[];
  backlinksProfile: BacklinkData[];
  contentGaps: ContentGap[];
}

interface KeywordData {
  keyword: string;
  position: number;
  searchVolume: number;
  difficulty: number;
  traffic: number;
  url: string;
}

interface PageData {
  url: string;
  title: string;
  traffic: number;
  keywords: number;
  backlinks: number;
}

interface BacklinkData {
  domain: string;
  domainRating: number;
  backlinks: number;
  linkType: 'dofollow' | 'nofollow';
  anchorText: string;
}

interface ContentGap {
  topic: string;
  keywords: number;
  difficulty: number;
  opportunity: 'high' | 'medium' | 'low';
}

interface AnalysisResult {
  id: string;
  createdAt: string;
  status: 'completed' | 'processing' | 'failed';
  competitors: CompetitorResult[];
  summary: {
    totalKeywords: number;
    sharedKeywords: number;
    uniqueOpportunities: number;
    avgDomainRating: number;
  };
}

const CompetitorAnalysisResults = () => {
  const params = useParams();
  const analysisId = params.id as string;
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('');
  const [activeMetric, setActiveMetric] = useState<'traffic' | 'keywords' | 'backlinks' | 'dr'>('traffic');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Mock data
  const mockAnalysisResult: AnalysisResult = {
    id: analysisId,
    createdAt: new Date().toISOString(),
    status: 'completed',
    competitors: [
      {
        domain: 'competitor1.com',
        name: 'Competidor 1',
        domainRating: 85,
        organicKeywords: 125000,
        organicTraffic: 2500000,
        backlinks: 850000,
        referringDomains: 15000,
        technicalScore: 92,
        topKeywords: [
          { keyword: 'marketing digital', position: 1, searchVolume: 50000, difficulty: 65, traffic: 25000, url: '/marketing-digital' },
          { keyword: 'seo optimization', position: 2, searchVolume: 30000, difficulty: 70, traffic: 18000, url: '/seo-guide' },
          { keyword: 'content marketing', position: 3, searchVolume: 25000, difficulty: 60, traffic: 12000, url: '/content-strategy' },
          { keyword: 'social media', position: 1, searchVolume: 40000, difficulty: 55, traffic: 20000, url: '/social-media' },
          { keyword: 'email marketing', position: 4, searchVolume: 20000, difficulty: 50, traffic: 8000, url: '/email-campaigns' }
        ],
        topPages: [
          { url: '/marketing-digital', title: 'Guía Completa de Marketing Digital', traffic: 45000, keywords: 250, backlinks: 120 },
          { url: '/seo-guide', title: 'SEO: Guía Definitiva 2024', traffic: 38000, keywords: 180, backlinks: 95 },
          { url: '/content-strategy', title: 'Estrategia de Contenidos', traffic: 25000, keywords: 150, backlinks: 75 }
        ],
        backlinksProfile: [
          { domain: 'authority-site.com', domainRating: 90, backlinks: 25, linkType: 'dofollow', anchorText: 'marketing digital' },
          { domain: 'industry-blog.com', domainRating: 75, backlinks: 15, linkType: 'dofollow', anchorText: 'guía seo' },
          { domain: 'news-portal.com', domainRating: 80, backlinks: 8, linkType: 'nofollow', anchorText: 'estrategia contenidos' }
        ],
        contentGaps: [
          { topic: 'Marketing Automation', keywords: 45, difficulty: 65, opportunity: 'high' },
          { topic: 'Influencer Marketing', keywords: 32, difficulty: 55, opportunity: 'medium' },
          { topic: 'Video Marketing', keywords: 28, difficulty: 60, opportunity: 'high' }
        ]
      },
      {
        domain: 'competitor2.com',
        name: 'Competidor 2',
        domainRating: 78,
        organicKeywords: 95000,
        organicTraffic: 1800000,
        backlinks: 620000,
        referringDomains: 12000,
        technicalScore: 88,
        topKeywords: [
          { keyword: 'digital strategy', position: 2, searchVolume: 35000, difficulty: 68, traffic: 20000, url: '/strategy' },
          { keyword: 'brand marketing', position: 1, searchVolume: 28000, difficulty: 62, traffic: 15000, url: '/branding' },
          { keyword: 'analytics tools', position: 3, searchVolume: 22000, difficulty: 58, traffic: 10000, url: '/analytics' }
        ],
        topPages: [
          { url: '/strategy', title: 'Estrategia Digital Efectiva', traffic: 35000, keywords: 200, backlinks: 85 },
          { url: '/branding', title: 'Construcción de Marca', traffic: 28000, keywords: 160, backlinks: 70 }
        ],
        backlinksProfile: [
          { domain: 'tech-review.com', domainRating: 85, backlinks: 20, linkType: 'dofollow', anchorText: 'estrategia digital' },
          { domain: 'marketing-hub.com', domainRating: 70, backlinks: 12, linkType: 'dofollow', anchorText: 'branding' }
        ],
        contentGaps: [
          { topic: 'AI Marketing', keywords: 38, difficulty: 70, opportunity: 'high' },
          { topic: 'Mobile Marketing', keywords: 25, difficulty: 50, opportunity: 'medium' }
        ]
      }
    ],
    summary: {
      totalKeywords: 220000,
      sharedKeywords: 15000,
      uniqueOpportunities: 125,
      avgDomainRating: 82
    }
  };

  useEffect(() => {
    const fetchAnalysisResult = async () => {
      try {
        const response = await fetch(`/api/competitor-analysis/results/${analysisId}`);
        if (response.ok) {
          const data = await response.json();
          setAnalysisResult(data.analysis);
          if (data.analysis.competitors.length > 0) {
            setSelectedCompetitor(data.analysis.competitors[0].domain);
          }
        } else {
          setAnalysisResult(mockAnalysisResult);
          setSelectedCompetitor(mockAnalysisResult.competitors[0].domain);
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
        setAnalysisResult(mockAnalysisResult);
        setSelectedCompetitor(mockAnalysisResult.competitors[0].domain);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisResult();
  }, [analysisId]);

  // Chart data preparation functions
  const prepareComparisonData = () => {
    if (!analysisResult) return [];
    
    return analysisResult.competitors.map(comp => ({
      name: comp.name || comp.domain,
      domain: comp.domain,
      'Domain Rating': comp.domainRating,
      'Keywords': comp.organicKeywords / 1000,
      'Traffic': comp.organicTraffic / 1000,
      'Backlinks': comp.backlinks / 1000,
      'Technical Score': comp.technicalScore,
      'Referring Domains': comp.referringDomains
    }));
  };

  const prepareKeywordDifficultyData = () => {
    if (!analysisResult || !selectedCompetitor) return [];
    
    const competitor = analysisResult.competitors.find(c => c.domain === selectedCompetitor);
    if (!competitor) return [];

    const difficultyRanges = {
      'Easy (0-30)': 0,
      'Medium (31-60)': 0,
      'Hard (61-80)': 0,
      'Very Hard (81-100)': 0
    };

    competitor.topKeywords.forEach(keyword => {
      if (keyword.difficulty <= 30) difficultyRanges['Easy (0-30)']++;
      else if (keyword.difficulty <= 60) difficultyRanges['Medium (31-60)']++;
      else if (keyword.difficulty <= 80) difficultyRanges['Hard (61-80)']++;
      else difficultyRanges['Very Hard (81-100)']++;
    });

    return Object.entries(difficultyRanges).map(([range, count]) => ({
      range,
      count,
      percentage: (count / competitor.topKeywords.length) * 100
    }));
  };

  const prepareTrafficDistributionData = () => {
    if (!analysisResult || !selectedCompetitor) return [];
    
    const competitor = analysisResult.competitors.find(c => c.domain === selectedCompetitor);
    if (!competitor) return [];

    return competitor.topPages.map(page => ({
      page: page.title.substring(0, 20) + '...',
      traffic: page.traffic,
      keywords: page.keywords,
      backlinks: page.backlinks
    }));
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando resultados del análisis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Análisis no encontrado</h2>
          <p className="text-gray-600 mb-4">No se pudo cargar el análisis solicitado.</p>
          <Link href="/competitor-analysis/analyze">
            <Button>Crear nuevo análisis</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/competitor-analysis/analyze">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Análisis de Competidores</h1>
            <p className="text-gray-600">
              Análisis completado el {new Date(analysisResult.createdAt).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={viewMode} onValueChange={(value: 'overview' | 'detailed') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Resumen</SelectItem>
              <SelectItem value="detailed">Detallado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Keywords</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysisResult.summary.totalKeywords.toLocaleString()}
                </p>
              </div>
              <Search className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                +{analysisResult.summary.sharedKeywords} compartidas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Oportunidades</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysisResult.summary.uniqueOpportunities}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                Alto potencial
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Domain Rating Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysisResult.summary.avgDomainRating}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Progress value={analysisResult.summary.avgDomainRating} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Competidores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysisResult.competitors.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Analizados
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="competitors">Competidores</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Competitor Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Comparación de Competidores
                </CardTitle>
                <CardDescription>
                  Métricas principales de cada competidor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={activeMetric} onValueChange={(value: any) => setActiveMetric(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traffic">Tráfico Orgánico</SelectItem>
                      <SelectItem value="keywords">Keywords</SelectItem>
                      <SelectItem value="backlinks">Backlinks</SelectItem>
                      <SelectItem value="dr">Domain Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey={
                        activeMetric === 'traffic' ? 'Traffic' :
                        activeMetric === 'keywords' ? 'Keywords' :
                        activeMetric === 'backlinks' ? 'Backlinks' :
                        'Domain Rating'
                      } 
                      fill="#3B82F6" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Análisis Multidimensional
                </CardTitle>
                <CardDescription>
                  Comparación en múltiples métricas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={prepareComparisonData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Domain Rating"
                      dataKey="Domain Rating"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="Technical Score"
                      dataKey="Technical Score"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.1}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                Distribución de Tráfico por Páginas
              </CardTitle>
              <CardDescription>
                Páginas con mayor tráfico del competidor seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {analysisResult.competitors.map(comp => (
                      <SelectItem key={comp.domain} value={comp.domain}>
                        {comp.name || comp.domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={prepareTrafficDistributionData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="page" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="traffic" fill="#3B82F6" />
                  <Line yAxisId="right" type="monotone" dataKey="keywords" stroke="#10B981" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitors Tab */}
        <TabsContent value="competitors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {analysisResult.competitors.map((competitor, index) => (
              <Card key={competitor.domain} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{competitor.name || competitor.domain}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    {competitor.domain}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {competitor.domainRating}
                      </p>
                      <p className="text-xs text-gray-600">Domain Rating</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {(competitor.organicTraffic / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-gray-600">Tráfico Mensual</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Keywords Orgánicas</span>
                      <span className="font-medium">{competitor.organicKeywords.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Backlinks</span>
                      <span className="font-medium">{competitor.backlinks.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dominios de Referencia</span>
                      <span className="font-medium">{competitor.referringDomains.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Puntuación Técnica</span>
                      <span className="font-medium">{competitor.technicalScore}/100</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedCompetitor(competitor.domain)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Keyword Difficulty Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Dificultad</CardTitle>
                <CardDescription>
                  Análisis de dificultad de keywords del competidor seleccionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {analysisResult.competitors.map(comp => (
                        <SelectItem key={comp.domain} value={comp.domain}>
                          {comp.name || comp.domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={prepareKeywordDifficultyData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ range, percentage }) => `${range}: ${percentage.toFixed(1)}%`}
                    >
                      {prepareKeywordDifficultyData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Keywords Table */}
            <Card>
              <CardHeader>
                <CardTitle>Top Keywords</CardTitle>
                <CardDescription>
                  Keywords con mejor rendimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCompetitor && (
                  <div className="space-y-3">
                    {analysisResult.competitors
                      .find(c => c.domain === selectedCompetitor)
                      ?.topKeywords.slice(0, 8)
                      .map((keyword, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{keyword.keyword}</p>
                            <p className="text-xs text-gray-600">
                              Vol: {keyword.searchVolume.toLocaleString()} | 
                              Pos: #{keyword.position} | 
                              Dif: {keyword.difficulty}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              {keyword.traffic.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">tráfico</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Backlinks Tab */}
        <TabsContent value="backlinks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil de Backlinks</CardTitle>
              <CardDescription>
                Análisis de enlaces entrantes por competidor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysisResult.competitors.map((competitor) => (
                  <div key={competitor.domain} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{competitor.name || competitor.domain}</h3>
                      <Badge variant="outline">
                        {competitor.backlinks.toLocaleString()} backlinks
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {competitor.backlinksProfile.slice(0, 3).map((backlink, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{backlink.domain}</p>
                            <Badge 
                              variant={backlink.linkType === 'dofollow' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {backlink.linkType}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            DR: {backlink.domainRating} | Links: {backlink.backlinks}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            "{backlink.anchorText}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysisResult.competitors.map((competitor) => (
              <Card key={competitor.domain}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                    {competitor.name || competitor.domain}
                  </CardTitle>
                  <CardDescription>
                    Oportunidades de contenido identificadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {competitor.contentGaps.map((gap, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{gap.topic}</h4>
                          <Badge 
                            variant={
                              gap.opportunity === 'high' ? 'default' :
                              gap.opportunity === 'medium' ? 'secondary' : 'outline'
                            }
                            className={
                              gap.opportunity === 'high' ? 'bg-green-100 text-green-800' :
                              gap.opportunity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {gap.opportunity === 'high' ? 'Alta' : 
                             gap.opportunity === 'medium' ? 'Media' : 'Baja'}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{gap.keywords} keywords</span>
                          <span>Dificultad: {gap.difficulty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompetitorAnalysisResults;