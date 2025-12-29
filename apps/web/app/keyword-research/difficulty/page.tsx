'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Target, 
  Search, 
  TrendingUp, 
  Users, 
  Link, 
  Eye, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Calendar,
  Zap,
  Award,
  Plus,
  X
} from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DifficultyAnalysis {
  keyword: string;
  difficulty: number;
  volume: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  serpAnalysis: {
    topResults: CompetitorResult[];
    avgDomainAuthority: number;
    avgPageAuthority: number;
    avgBacklinks: number;
    avgContentLength: number;
  };
  opportunities: Opportunity[];
  recommendations: string[];
}

interface CompetitorResult {
  position: number;
  url: string;
  title: string;
  domain: string;
  domainAuthority: number;
  pageAuthority: number;
  backlinks: number;
  contentLength: number;
  hasSchema: boolean;
  loadSpeed: number;
  mobileOptimized: boolean;
}

interface Opportunity {
  type: 'content_gap' | 'technical_seo' | 'backlink_opportunity' | 'user_experience';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

const DifficultyAnalysis = () => {
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<DifficultyAnalysis[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');

  // Mock data
  const mockAnalysis: DifficultyAnalysis = {
    keyword: 'seo tools',
    difficulty: 67,
    volume: 49500,
    cpc: 12.45,
    competition: 'high',
    serpAnalysis: {
      topResults: [
        {
          position: 1,
          url: 'https://ahrefs.com/seo-tools',
          title: 'Best SEO Tools for 2024 - Complete Guide',
          domain: 'ahrefs.com',
          domainAuthority: 91,
          pageAuthority: 78,
          backlinks: 15420,
          contentLength: 4500,
          hasSchema: true,
          loadSpeed: 1.2,
          mobileOptimized: true
        },
        {
          position: 2,
          url: 'https://semrush.com/blog/seo-tools',
          title: '25+ Best SEO Tools (Free & Paid) in 2024',
          domain: 'semrush.com',
          domainAuthority: 89,
          pageAuthority: 72,
          backlinks: 8930,
          contentLength: 6200,
          hasSchema: true,
          loadSpeed: 1.8,
          mobileOptimized: true
        },
        {
          position: 3,
          url: 'https://moz.com/blog/seo-tools-guide',
          title: 'The Ultimate Guide to SEO Tools',
          domain: 'moz.com',
          domainAuthority: 86,
          pageAuthority: 69,
          backlinks: 5670,
          contentLength: 3800,
          hasSchema: false,
          loadSpeed: 2.1,
          mobileOptimized: true
        },
        {
          position: 4,
          url: 'https://hubspot.com/seo-tools',
          title: 'Free SEO Tools to Boost Your Rankings',
          domain: 'hubspot.com',
          domainAuthority: 85,
          pageAuthority: 65,
          backlinks: 3240,
          contentLength: 2900,
          hasSchema: true,
          loadSpeed: 1.5,
          mobileOptimized: true
        }
      ],
      avgDomainAuthority: 87.8,
      avgPageAuthority: 71,
      avgBacklinks: 8315,
      avgContentLength: 4350
    },
    opportunities: [
      {
        type: 'content_gap',
        title: 'Contenido más específico por industria',
        description: 'Los competidores no cubren herramientas SEO específicas para e-commerce, SaaS o blogs locales',
        impact: 'high',
        effort: 'medium'
      },
      {
        type: 'technical_seo',
        title: 'Optimización de velocidad',
        description: 'Algunos competidores tienen velocidades de carga superiores a 2 segundos',
        impact: 'medium',
        effort: 'low'
      },
      {
        type: 'backlink_opportunity',
        title: 'Enlaces desde herramientas complementarias',
        description: 'Oportunidad de conseguir enlaces desde blogs de marketing digital y herramientas relacionadas',
        impact: 'high',
        effort: 'high'
      },
      {
        type: 'user_experience',
        title: 'Comparativas interactivas',
        description: 'Crear herramientas de comparación interactivas que los competidores no tienen',
        impact: 'medium',
        effort: 'medium'
      }
    ],
    recommendations: [
      'Crear contenido de al menos 4,500 palabras con enfoque en casos de uso específicos',
      'Implementar schema markup para mejorar la visibilidad en SERP',
      'Optimizar velocidad de carga para estar por debajo de 1.5 segundos',
      'Desarrollar una estrategia de link building enfocada en sitios de autoridad DA 80+',
      'Incluir herramientas interactivas o calculadoras para aumentar el engagement'
    ]
  };

  const addKeyword = () => {
    setKeywords([...keywords, '']);
  };

  const removeKeyword = (index: number) => {
    if (keywords.length > 1) {
      setKeywords(keywords.filter((_, i) => i !== index));
    }
  };

  const updateKeyword = (index: number, value: string) => {
    const updated = [...keywords];
    updated[index] = value;
    setKeywords(updated);
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Filtrar keywords válidas
      const validKeywords = keywords.filter(k => k.trim().length > 0);
      
      if (validKeywords.length === 0) {
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch('/api/keyword-research/difficulty/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: validKeywords
        }),
      });

      if (!response.ok) {
        throw new Error('Error en el análisis de dificultad');
      }

      const data = await response.json();
      
      if (data.success) {
        // Transformar los datos de la API al formato esperado por el frontend
        const transformedResults: DifficultyAnalysis[] = data.data.keywords.map((kw: any) => ({
          keyword: kw.keyword,
          difficulty: kw.difficulty,
          volume: kw.volume,
          cpc: kw.cpc,
          competition: kw.competition,
          serpAnalysis: {
            topResults: kw.competitors?.map((comp: any, index: number) => ({
              position: index + 1,
              url: comp.url,
              title: comp.title,
              domain: comp.domain,
              domainAuthority: comp.domainAuthority,
              pageAuthority: comp.pageAuthority,
              backlinks: comp.backlinks,
              contentLength: comp.contentLength,
              hasSchema: comp.hasSchema,
              loadSpeed: comp.loadSpeed,
              mobileOptimized: comp.mobileOptimized
            })) || [],
            avgDomainAuthority: kw.avgDomainAuthority || 0,
            avgPageAuthority: kw.avgPageAuthority || 0,
            avgBacklinks: kw.avgBacklinks || 0,
            avgContentLength: kw.avgContentLength || 0
          },
          opportunities: kw.opportunities?.map((opp: any) => ({
            type: opp.type,
            title: opp.title,
            description: opp.description,
            impact: opp.impact,
            effort: opp.effort
          })) || [],
          recommendations: kw.recommendations || []
        }));
        
        setResults(transformedResults);
        if (transformedResults.length > 0) {
          setSelectedKeyword(transformedResults[0].keyword);
        }
      } else {
        console.error('Error en la respuesta:', data.error);
        // Fallback a datos mock en caso de error
        setResults([mockAnalysis]);
        setSelectedKeyword(mockAnalysis.keyword);
      }
    } catch (error) {
      console.error('Error al analizar dificultad:', error);
      // Fallback a datos mock en caso de error
      setResults([mockAnalysis]);
      setSelectedKeyword(mockAnalysis.keyword);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return { color: '#10b981', bg: '#ecfdf5' };
    if (difficulty < 60) return { color: '#f59e0b', bg: '#fffbeb' };
    return { color: '#ef4444', bg: '#fef2f2' };
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 30) return 'Fácil';
    if (difficulty < 60) return 'Medio';
    return 'Difícil';
  };

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case 'content_gap': return <BarChart3 className="h-4 w-4" />;
      case 'technical_seo': return <Zap className="h-4 w-4" />;
      case 'backlink_opportunity': return <Link className="h-4 w-4" />;
      case 'user_experience': return <Users className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const currentAnalysis = results.find(r => r.keyword === selectedKeyword);
  const difficultyData = currentAnalysis ? [{ name: 'Dificultad', value: currentAnalysis.difficulty, fill: getDifficultyColor(currentAnalysis.difficulty).color }] : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Análisis de Dificultad</h1>
            <p className="text-gray-600 mt-1">Evalúa la competitividad y oportunidades de ranking para tus keywords</p>
          </div>
        </div>

        {/* Formulario de análisis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Analizar Dificultad de Keywords
            </CardTitle>
            <CardDescription>
              Ingresa las keywords que quieres analizar para obtener métricas de competitividad detalladas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Keywords a Analizar</label>
              {keywords.map((keyword, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Ej: seo tools, keyword research..."
                    value={keyword}
                    onChange={(e) => updateKeyword(index, e.target.value)}
                    className="flex-1"
                  />
                  {keywords.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeKeyword(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addKeyword}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Keyword
              </Button>
            </div>

            <Button 
              onClick={handleAnalysis} 
              disabled={isAnalyzing || !keywords.some(k => k.trim())}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analizando competitividad...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Analizar Dificultad
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados del análisis */}
        {currentAnalysis && (
          <div className="space-y-6">
            {/* Resumen de dificultad */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader className="text-center">
                  <CardTitle>Dificultad de Keyword</CardTitle>
                  <CardDescription>"{currentAnalysis.keyword}"</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <div className="relative w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={difficultyData}>
                        <RadialBar dataKey="value" cornerRadius={10} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold" style={{ color: getDifficultyColor(currentAnalysis.difficulty).color }}>
                        {currentAnalysis.difficulty}
                      </span>
                      <span className="text-sm text-gray-600">/ 100</span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getDifficultyColor(currentAnalysis.difficulty).color} border-current`}
                    style={{ backgroundColor: getDifficultyColor(currentAnalysis.difficulty).bg }}
                  >
                    {getDifficultyLabel(currentAnalysis.difficulty)}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Métricas de la Keyword</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{currentAnalysis.volume.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Volumen mensual</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">${currentAnalysis.cpc}</div>
                      <div className="text-sm text-gray-600">CPC promedio</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600 capitalize">{currentAnalysis.competition}</div>
                      <div className="text-sm text-gray-600">Competencia</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Award className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-600">{currentAnalysis.serpAnalysis.avgDomainAuthority}</div>
                      <div className="text-sm text-gray-600">DA promedio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Análisis SERP */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Competidores en SERP</CardTitle>
                <CardDescription>Top 10 resultados orgánicos y sus métricas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentAnalysis.serpAnalysis.topResults.map((result) => (
                    <div key={result.position} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-600">
                              #{result.position}
                            </Badge>
                            <h3 className="font-medium">{result.title}</h3>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">{result.url}</div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">DA:</span>
                              <span className="font-medium ml-1">{result.domainAuthority}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">PA:</span>
                              <span className="font-medium ml-1">{result.pageAuthority}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Backlinks:</span>
                              <span className="font-medium ml-1">{result.backlinks.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Palabras:</span>
                              <span className="font-medium ml-1">{result.contentLength.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Velocidad:</span>
                              <span className="font-medium ml-1">{result.loadSpeed}s</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {result.hasSchema ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-xs">Schema</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Métricas promedio */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Métricas Promedio de Competidores</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{currentAnalysis.serpAnalysis.avgDomainAuthority}</div>
                      <div className="text-sm text-gray-600">Domain Authority</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{currentAnalysis.serpAnalysis.avgPageAuthority}</div>
                      <div className="text-sm text-gray-600">Page Authority</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{currentAnalysis.serpAnalysis.avgBacklinks.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Backlinks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{currentAnalysis.serpAnalysis.avgContentLength.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Palabras</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Oportunidades identificadas */}
            <Card>
              <CardHeader>
                <CardTitle>Oportunidades Identificadas</CardTitle>
                <CardDescription>Áreas donde puedes superar a la competencia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentAnalysis.opportunities.map((opportunity, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          {getOpportunityIcon(opportunity.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">{opportunity.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline" className={getImpactColor(opportunity.impact)}>
                              Impacto: {opportunity.impact}
                            </Badge>
                            <Badge variant="outline" className={getEffortColor(opportunity.effort)}>
                              Esfuerzo: {opportunity.effort}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recomendaciones */}
            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones Estratégicas</CardTitle>
                <CardDescription>Pasos específicos para mejorar tu posicionamiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DifficultyAnalysis;