'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Globe, 
  MapPin, 
  Eye, 
  Star,
  TrendingUp,
  BarChart3,
  ExternalLink,
  Download,
  Filter,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Award,
  Target
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface SerpResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  type: 'organic' | 'featured_snippet' | 'people_also_ask' | 'local_pack' | 'shopping' | 'news' | 'video' | 'image';
  metrics: {
    domainAuthority: number;
    pageAuthority: number;
    backlinks: number;
    referringDomains: number;
    organicTraffic: number;
    socialShares: number;
  };
  features: SerpFeature[];
  contentAnalysis: {
    wordCount: number;
    readabilityScore: number;
    headingStructure: HeadingStructure;
    keywordDensity: number;
    imageCount: number;
    videoCount: number;
  };
}

interface SerpFeature {
  type: 'featured_snippet' | 'people_also_ask' | 'local_pack' | 'shopping' | 'news' | 'video' | 'image' | 'knowledge_panel' | 'site_links';
  position: number;
  content?: string;
  count?: number;
}

interface HeadingStructure {
  h1: number;
  h2: number;
  h3: number;
  h4: number;
}

interface SerpAnalysis {
  keyword: string;
  location: string;
  device: string;
  totalResults: number;
  results: SerpResult[];
  features: SerpFeature[];
  competitorAnalysis: CompetitorAnalysis;
  opportunities: Opportunity[];
  insights: SerpInsight[];
}

interface CompetitorAnalysis {
  topDomains: DomainMetrics[];
  avgMetrics: {
    domainAuthority: number;
    pageAuthority: number;
    wordCount: number;
    backlinks: number;
  };
  contentGaps: ContentGap[];
}

interface DomainMetrics {
  domain: string;
  positions: number[];
  avgPosition: number;
  visibility: number;
  authority: number;
}

interface ContentGap {
  topic: string;
  coverage: number;
  opportunity: 'high' | 'medium' | 'low';
  description: string;
}

interface Opportunity {
  type: 'featured_snippet' | 'paa_optimization' | 'content_gap' | 'technical_seo' | 'authority_building';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface SerpInsight {
  type: 'serp_feature' | 'competitor_weakness' | 'content_opportunity' | 'technical_issue';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
}

const SerpAnalysis = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('United States');
  const [device, setDevice] = useState('desktop');
  const [language, setLanguage] = useState('en');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SerpAnalysis | null>(null);
  const [selectedResult, setSelectedResult] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'competitors'>('overview');

  // Mock data
  const mockSerpAnalysis: SerpAnalysis = {
    keyword: 'best seo tools',
    location: 'United States',
    device: 'desktop',
    totalResults: 847000000,
    results: [
      {
        position: 1,
        title: 'Best SEO Tools in 2024: Complete Guide & Reviews',
        url: 'https://example.com/best-seo-tools-2024',
        domain: 'example.com',
        snippet: 'Discover the top SEO tools for 2024. Our comprehensive guide covers free and paid options, features, pricing, and expert reviews to help you choose the right tools.',
        type: 'organic',
        metrics: {
          domainAuthority: 78,
          pageAuthority: 65,
          backlinks: 1250,
          referringDomains: 340,
          organicTraffic: 45000,
          socialShares: 890
        },
        features: [],
        contentAnalysis: {
          wordCount: 3500,
          readabilityScore: 72,
          headingStructure: { h1: 1, h2: 8, h3: 15, h4: 3 },
          keywordDensity: 2.1,
          imageCount: 12,
          videoCount: 2
        }
      },
      {
        position: 2,
        title: '25 Best SEO Tools (Free & Paid) - Updated 2024',
        url: 'https://competitor.com/seo-tools-list',
        domain: 'competitor.com',
        snippet: 'Complete list of the best SEO tools including Ahrefs, SEMrush, Moz, and free alternatives. Compare features, pricing, and find the perfect tool for your needs.',
        type: 'organic',
        metrics: {
          domainAuthority: 82,
          pageAuthority: 71,
          backlinks: 2100,
          referringDomains: 520,
          organicTraffic: 67000,
          socialShares: 1450
        },
        features: [],
        contentAnalysis: {
          wordCount: 4200,
          readabilityScore: 68,
          headingStructure: { h1: 1, h2: 12, h3: 25, h4: 8 },
          keywordDensity: 1.8,
          imageCount: 18,
          videoCount: 1
        }
      },
      {
        position: 3,
        title: 'Top 15 SEO Tools Every Marketer Should Use',
        url: 'https://marketing-blog.com/top-seo-tools',
        domain: 'marketing-blog.com',
        snippet: 'Essential SEO tools for keyword research, technical SEO, link building, and rank tracking. Includes both free and premium options with detailed comparisons.',
        type: 'organic',
        metrics: {
          domainAuthority: 71,
          pageAuthority: 58,
          backlinks: 890,
          referringDomains: 280,
          organicTraffic: 28000,
          socialShares: 650
        },
        features: [],
        contentAnalysis: {
          wordCount: 2800,
          readabilityScore: 75,
          headingStructure: { h1: 1, h2: 6, h3: 15, h4: 2 },
          keywordDensity: 2.4,
          imageCount: 8,
          videoCount: 0
        }
      }
    ],
    features: [
      { type: 'featured_snippet', position: 0, content: 'The best SEO tools include Ahrefs, SEMrush, Moz Pro, and Google Search Console. These tools help with keyword research, backlink analysis, technical SEO audits, and rank tracking.' },
      { type: 'people_also_ask', position: 2, count: 4 },
      { type: 'video', position: 5, count: 3 },
      { type: 'shopping', position: 8, count: 6 }
    ],
    competitorAnalysis: {
      topDomains: [
        { domain: 'competitor.com', positions: [2, 7, 12], avgPosition: 7.0, visibility: 85, authority: 82 },
        { domain: 'example.com', positions: [1, 9, 15], avgPosition: 8.3, visibility: 78, authority: 78 },
        { domain: 'marketing-blog.com', positions: [3, 11, 18], avgPosition: 10.7, visibility: 65, authority: 71 },
        { domain: 'seo-guru.com', positions: [4, 13, 20], avgPosition: 12.3, visibility: 58, authority: 69 }
      ],
      avgMetrics: {
        domainAuthority: 75,
        pageAuthority: 65,
        wordCount: 3500,
        backlinks: 1400
      },
      contentGaps: [
        { topic: 'Free SEO Tools Comparison', coverage: 45, opportunity: 'high', description: 'Detailed comparison of free vs paid tools is missing in top results' },
        { topic: 'Tool Integration Guides', coverage: 30, opportunity: 'medium', description: 'How to integrate multiple SEO tools for workflow optimization' },
        { topic: 'ROI Calculation Methods', coverage: 25, opportunity: 'high', description: 'Methods to calculate ROI from SEO tool investments' }
      ]
    },
    opportunities: [
      {
        type: 'featured_snippet',
        title: 'Optimize for Featured Snippet',
        description: 'Current featured snippet is weak. Create a concise, well-structured answer about best SEO tools.',
        difficulty: 'medium',
        impact: 'high',
        actionable: true
      },
      {
        type: 'content_gap',
        title: 'Cover Free Tools Comparison',
        description: 'Top results lack comprehensive free tools comparison. This is a content gap opportunity.',
        difficulty: 'easy',
        impact: 'medium',
        actionable: true
      },
      {
        type: 'technical_seo',
        title: 'Improve Page Speed',
        description: 'Top competitors have faster loading times. Optimize page speed for better rankings.',
        difficulty: 'medium',
        impact: 'medium',
        actionable: true
      }
    ],
    insights: [
      {
        type: 'serp_feature',
        title: 'Featured Snippet Opportunity',
        description: 'Current featured snippet has low quality content and can be easily outranked',
        impact: 'high',
        confidence: 87
      },
      {
        type: 'competitor_weakness',
        title: 'Content Freshness Gap',
        description: 'Top 3 results haven\'t been updated in 6+ months, opportunity for fresh content',
        impact: 'medium',
        confidence: 92
      },
      {
        type: 'content_opportunity',
        title: 'Video Content Missing',
        description: 'No comprehensive video reviews in top 10, video content could rank well',
        impact: 'medium',
        confidence: 78
      }
    ]
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      if (!keyword.trim()) {
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch('/api/keyword-research/serp/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: [keyword.trim()],
          location,
          device,
          language,
          includeFeatures: true,
          includeCompetitors: true,
          includeOpportunities: true
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la API de análisis SERP');
      }

      const data = await response.json();
      
      // Usar el primer resultado si hay múltiples keywords
      const serpResult = data.results && data.results.length > 0 ? data.results[0] : null;
      
      if (serpResult) {
        setResults(serpResult);
      } else {
        throw new Error('No se recibieron resultados válidos');
      }
    } catch (error) {
      console.error('Error al analizar SERP:', error);
      // Fallback a datos mock en caso de error
      setResults(mockSerpAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'featured_snippet': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'people_also_ask': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'local_pack': return 'text-green-600 bg-green-50 border-green-200';
      case 'shopping': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'video': return 'text-red-600 bg-red-50 border-red-200';
      case 'news': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case 'featured_snippet': return <Star className="h-4 w-4" />;
      case 'paa_optimization': return <Search className="h-4 w-4" />;
      case 'content_gap': return <Target className="h-4 w-4" />;
      case 'technical_seo': return <Zap className="h-4 w-4" />;
      case 'authority_building': return <Award className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Datos para gráficos
  const authorityData = results?.results.slice(0, 10).map((result, index) => ({
    position: result.position,
    domainAuthority: result.metrics.domainAuthority,
    pageAuthority: result.metrics.pageAuthority,
    backlinks: result.metrics.backlinks,
    domain: result.domain
  })) || [];

  const contentData = results?.results.slice(0, 5).map(result => ({
    domain: result.domain.split('.')[0],
    wordCount: result.contentAnalysis.wordCount,
    readability: result.contentAnalysis.readabilityScore,
    images: result.contentAnalysis.imageCount,
    headings: result.contentAnalysis.headingStructure.h2 + result.contentAnalysis.headingStructure.h3
  })) || [];

  const featureDistribution = results?.features.map(feature => ({
    name: feature.type.replace('_', ' '),
    value: feature.count || 1,
    position: feature.position
  })) || [];

  const selectedResultData = results?.results[selectedResult];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Análisis SERP</h1>
            <p className="text-gray-600 mt-1">Analiza resultados de búsqueda y encuentra oportunidades de ranking</p>
          </div>
          <div className="flex gap-3">
            {results && (
              <>
                <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                  <SelectTrigger className="w-40">
                    <Eye className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Vista General</SelectItem>
                    <SelectItem value="detailed">Análisis Detallado</SelectItem>
                    <SelectItem value="competitors">Competidores</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Análisis
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Formulario de análisis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Analizar SERP
            </CardTitle>
            <CardDescription>
              Ingresa una keyword para analizar los resultados de búsqueda y competidores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Keyword a Analizar</Label>
                <Input
                  placeholder="Ej: best seo tools, keyword research..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Ubicación</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">Estados Unidos</SelectItem>
                    <SelectItem value="United Kingdom">Reino Unido</SelectItem>
                    <SelectItem value="Canada">Canadá</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Spain">España</SelectItem>
                    <SelectItem value="Mexico">México</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Dispositivo</Label>
                <Select value={device} onValueChange={setDevice}>
                  <SelectTrigger>
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Idioma</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">Inglés</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Francés</SelectItem>
                    <SelectItem value="de">Alemán</SelectItem>
                    <SelectItem value="pt">Portugués</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleAnalysis} 
              disabled={isAnalyzing || !keyword.trim()}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analizando SERP...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analizar Resultados
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados del análisis */}
        {results && (
          <div className="space-y-6">
            {/* Métricas generales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Resultados</CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.totalResults.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    páginas indexadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">SERP Features</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.features.length}</div>
                  <p className="text-xs text-muted-foreground">
                    características especiales
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Autoridad Promedio</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.competitorAnalysis.avgMetrics.domainAuthority}</div>
                  <p className="text-xs text-muted-foreground">
                    DA de competidores
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.opportunities.length}</div>
                  <p className="text-xs text-muted-foreground">
                    oportunidades detectadas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* SERP Features */}
            <Card>
              <CardHeader>
                <CardTitle>SERP Features Detectadas</CardTitle>
                <CardDescription>Características especiales en los resultados de búsqueda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.features.map((feature, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${getResultTypeColor(feature.type)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={getResultTypeColor(feature.type)}>
                          {feature.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm font-medium">Pos. {feature.position}</span>
                      </div>
                      {feature.content && (
                        <p className="text-sm mt-2 line-clamp-3">{feature.content}</p>
                      )}
                      {feature.count && (
                        <p className="text-sm mt-2">{feature.count} elementos</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Análisis de autoridad vs posición */}
            <Card>
              <CardHeader>
                <CardTitle>Autoridad vs Posición</CardTitle>
                <CardDescription>Relación entre autoridad de dominio y posición en SERP</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={authorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="position" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        value, 
                        name === 'domainAuthority' ? 'Domain Authority' : 
                        name === 'pageAuthority' ? 'Page Authority' : 'Backlinks'
                      ]}
                    />
                    <Bar dataKey="domainAuthority" fill="#3b82f6" name="domainAuthority" />
                    <Bar dataKey="pageAuthority" fill="#10b981" name="pageAuthority" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resultados orgánicos y oportunidades */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Resultados Orgánicos</CardTitle>
                  <CardDescription>Análisis de los principales competidores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.results.slice(0, 10).map((result, index) => (
                      <div 
                        key={index} 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedResult === index ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedResult(index)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-blue-600 bg-blue-50">
                              #{result.position}
                            </Badge>
                            <span className="font-medium text-sm">{result.domain}</span>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className={
                              result.metrics.domainAuthority > 70 ? 'text-green-600 bg-green-50' :
                              result.metrics.domainAuthority > 50 ? 'text-yellow-600 bg-yellow-50' :
                              'text-red-600 bg-red-50'
                            }>
                              DA {result.metrics.domainAuthority}
                            </Badge>
                          </div>
                        </div>
                        
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{result.title}</h3>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{result.snippet}</p>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-medium">{result.metrics.backlinks.toLocaleString()}</div>
                            <div className="text-gray-500">Backlinks</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{result.contentAnalysis.wordCount.toLocaleString()}</div>
                            <div className="text-gray-500">Palabras</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{result.metrics.organicTraffic.toLocaleString()}</div>
                            <div className="text-gray-500">Tráfico</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Oportunidades Identificadas</CardTitle>
                  <CardDescription>Recomendaciones para mejorar el ranking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.opportunities.map((opportunity, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${getImpactColor(opportunity.impact)}`}>
                        <div className="flex items-start gap-3">
                          {getOpportunityIcon(opportunity.type)}
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{opportunity.title}</h4>
                            <p className="text-sm mb-3">{opportunity.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getDifficultyColor(opportunity.difficulty)}>
                                {opportunity.difficulty}
                              </Badge>
                              <Badge variant="outline" className={getImpactColor(opportunity.impact)}>
                                Impacto {opportunity.impact}
                              </Badge>
                              {opportunity.actionable && (
                                <Badge variant="outline" className="text-green-600 bg-green-50">
                                  Accionable
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Análisis de contenido */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Contenido - Top 5</CardTitle>
                <CardDescription>Comparación de métricas de contenido de los principales competidores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={contentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="domain" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="wordCount" fill="#3b82f6" name="Palabras" />
                    <Bar dataKey="readability" fill="#10b981" name="Legibilidad" />
                    <Bar dataKey="images" fill="#f59e0b" name="Imágenes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Insights automáticos */}
            <Card>
              <CardHeader>
                <CardTitle>Insights Automáticos</CardTitle>
                <CardDescription>Patrones y oportunidades detectadas por IA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.insights.map((insight, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${getImpactColor(insight.impact)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={getImpactColor(insight.impact)}>
                          {insight.type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {insight.confidence}% confianza
                        </Badge>
                      </div>
                      <h4 className="font-medium mb-2">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detalle del resultado seleccionado */}
            {selectedResultData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-600 bg-blue-50">
                      #{selectedResultData.position}
                    </Badge>
                    Análisis Detallado: {selectedResultData.domain}
                  </CardTitle>
                  <CardDescription>
                    Métricas completas del resultado seleccionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Información General</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Título:</span>
                            <span className="font-medium">{selectedResultData.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>URL:</span>
                            <a href={selectedResultData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                              Ver página <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <div className="flex justify-between">
                            <span>Tipo:</span>
                            <Badge variant="outline" className={getResultTypeColor(selectedResultData.type)}>
                              {selectedResultData.type}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Métricas SEO</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">{selectedResultData.metrics.domainAuthority}</div>
                            <div className="text-xs text-gray-600">Domain Authority</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-600">{selectedResultData.metrics.pageAuthority}</div>
                            <div className="text-xs text-gray-600">Page Authority</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-600">{selectedResultData.metrics.backlinks.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">Backlinks</div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-lg font-bold text-orange-600">{selectedResultData.metrics.organicTraffic.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">Tráfico Orgánico</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Análisis de Contenido</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Palabras:</span>
                            <span className="font-medium">{selectedResultData.contentAnalysis.wordCount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Legibilidad:</span>
                            <Badge variant="outline" className={
                              selectedResultData.contentAnalysis.readabilityScore > 70 ? 'text-green-600 bg-green-50' :
                              selectedResultData.contentAnalysis.readabilityScore > 50 ? 'text-yellow-600 bg-yellow-50' :
                              'text-red-600 bg-red-50'
                            }>
                              {selectedResultData.contentAnalysis.readabilityScore}/100
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Densidad de Keyword:</span>
                            <span className="font-medium">{selectedResultData.contentAnalysis.keywordDensity}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Imágenes:</span>
                            <span className="font-medium">{selectedResultData.contentAnalysis.imageCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Videos:</span>
                            <span className="font-medium">{selectedResultData.contentAnalysis.videoCount}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Estructura de Encabezados</h4>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-bold">{selectedResultData.contentAnalysis.headingStructure.h1}</div>
                            <div className="text-xs">H1</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-bold">{selectedResultData.contentAnalysis.headingStructure.h2}</div>
                            <div className="text-xs">H2</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-bold">{selectedResultData.contentAnalysis.headingStructure.h3}</div>
                            <div className="text-xs">H3</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-bold">{selectedResultData.contentAnalysis.headingStructure.h4}</div>
                            <div className="text-xs">H4</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SerpAnalysis;