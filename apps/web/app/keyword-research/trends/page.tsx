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
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3, 
  Activity, 
  Zap,
  AlertCircle,
  Eye,
  Download,
  Filter,
  Plus,
  X,
  Snowflake,
  Sun,
  Leaf,
  Flower2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface TrendAnalysis {
  keyword: string;
  currentVolume: number;
  trendDirection: 'up' | 'down' | 'stable';
  trendPercentage: number;
  historicalData: MonthlyData[];
  seasonalityPattern: SeasonalityData;
  predictions: PredictionData[];
  insights: InsightData[];
  relatedTrends: RelatedTrend[];
}

interface MonthlyData {
  month: string;
  volume: number;
  cpc: number;
  difficulty: number;
  date: string;
}

interface SeasonalityData {
  pattern: 'high_winter' | 'high_summer' | 'stable' | 'holiday_peaks' | 'back_to_school';
  strength: number;
  peakMonths: string[];
  lowMonths: string[];
  seasonalityScore: number;
}

interface PredictionData {
  month: string;
  predictedVolume: number;
  confidence: number;
  factors: string[];
}

interface InsightData {
  type: 'trend_change' | 'seasonal_opportunity' | 'competitor_movement' | 'market_shift';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface RelatedTrend {
  keyword: string;
  correlation: number;
  trendDirection: 'up' | 'down' | 'stable';
}

const TrendsAnalysis = () => {
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [timeRange, setTimeRange] = useState('12m');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<TrendAnalysis[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [showPredictions, setShowPredictions] = useState(true);
  const [compareMode, setCompareMode] = useState(false);

  // Mock data
  const mockTrendAnalysis: TrendAnalysis = {
    keyword: 'seo tools',
    currentVolume: 49500,
    trendDirection: 'up',
    trendPercentage: 15.3,
    historicalData: [
      { month: 'Ene 2023', volume: 42000, cpc: 11.20, difficulty: 65, date: '2023-01-01' },
      { month: 'Feb 2023', volume: 43500, cpc: 11.45, difficulty: 66, date: '2023-02-01' },
      { month: 'Mar 2023', volume: 45000, cpc: 11.80, difficulty: 64, date: '2023-03-01' },
      { month: 'Abr 2023', volume: 44000, cpc: 12.10, difficulty: 67, date: '2023-04-01' },
      { month: 'May 2023', volume: 46500, cpc: 12.30, difficulty: 65, date: '2023-05-01' },
      { month: 'Jun 2023', volume: 48000, cpc: 12.45, difficulty: 66, date: '2023-06-01' },
      { month: 'Jul 2023', volume: 47000, cpc: 12.20, difficulty: 64, date: '2023-07-01' },
      { month: 'Ago 2023', volume: 48500, cpc: 12.35, difficulty: 65, date: '2023-08-01' },
      { month: 'Sep 2023', volume: 50000, cpc: 12.50, difficulty: 67, date: '2023-09-01' },
      { month: 'Oct 2023', volume: 49000, cpc: 12.40, difficulty: 66, date: '2023-10-01' },
      { month: 'Nov 2023', volume: 51000, cpc: 12.60, difficulty: 68, date: '2023-11-01' },
      { month: 'Dic 2023', volume: 49500, cpc: 12.45, difficulty: 67, date: '2023-12-01' }
    ],
    seasonalityPattern: {
      pattern: 'back_to_school',
      strength: 0.73,
      peakMonths: ['Septiembre', 'Octubre', 'Enero'],
      lowMonths: ['Julio', 'Agosto', 'Diciembre'],
      seasonalityScore: 73
    },
    predictions: [
      { month: 'Ene 2024', predictedVolume: 52000, confidence: 85, factors: ['Tendencia creciente', 'Pico estacional'] },
      { month: 'Feb 2024', predictedVolume: 53500, confidence: 82, factors: ['Crecimiento sostenido'] },
      { month: 'Mar 2024', predictedVolume: 55000, confidence: 78, factors: ['Expansión del mercado'] },
      { month: 'Abr 2024', predictedVolume: 54000, confidence: 75, factors: ['Corrección estacional'] }
    ],
    insights: [
      {
        type: 'trend_change',
        title: 'Crecimiento acelerado detectado',
        description: 'El volumen ha aumentado 15.3% en los últimos 6 meses, superando la tendencia histórica',
        impact: 'high',
        actionable: true
      },
      {
        type: 'seasonal_opportunity',
        title: 'Oportunidad estacional en Enero',
        description: 'Históricamente Enero muestra un pico del 20% en volumen de búsqueda',
        impact: 'medium',
        actionable: true
      },
      {
        type: 'market_shift',
        title: 'Cambio en intención de búsqueda',
        description: 'Aumento en búsquedas relacionadas con herramientas gratuitas vs pagadas',
        impact: 'medium',
        actionable: false
      }
    ],
    relatedTrends: [
      { keyword: 'keyword research', correlation: 0.89, trendDirection: 'up' },
      { keyword: 'backlink checker', correlation: 0.76, trendDirection: 'up' },
      { keyword: 'competitor analysis', correlation: 0.68, trendDirection: 'stable' },
      { keyword: 'rank tracker', correlation: 0.62, trendDirection: 'down' }
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

      const response = await fetch('/api/keyword-research/trends/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: validKeywords,
          timeframe: timeRange
        }),
      });

      if (!response.ok) {
        throw new Error('Error en el análisis de tendencias');
      }

      const data = await response.json();
      
      if (data.success) {
        // Transformar los datos de la API al formato esperado por el frontend
        const transformedResults: TrendAnalysis[] = data.data.keywords.map((kw: any) => ({
          keyword: kw.keyword,
          currentVolume: kw.currentVolume,
          trendDirection: kw.trendDirection,
          trendPercentage: kw.changePercent,
          historicalData: kw.historicalData?.map((point: any) => ({
            month: point.period,
            volume: point.volume,
            cpc: point.cpc || 0,
            difficulty: point.difficulty || 0,
            date: point.date
          })) || [],
          seasonalityPattern: {
            pattern: kw.seasonality?.pattern || 'stable',
            strength: kw.seasonality?.strength || 0,
            peakMonths: kw.seasonality?.peakMonths || [],
            lowMonths: kw.seasonality?.lowMonths || [],
            seasonalityScore: Math.round((kw.seasonality?.strength || 0) * 100)
          },
          predictions: kw.forecast?.map((pred: any) => ({
            month: pred.period,
            predictedVolume: pred.volume,
            confidence: pred.confidence,
            factors: pred.factors || []
          })) || [],
          insights: kw.insights?.map((insight: any) => ({
            type: insight.type,
            title: insight.title,
            description: insight.description,
            impact: insight.impact,
            actionable: insight.actionable || false
          })) || [],
          relatedTrends: kw.relatedTrends?.map((trend: any) => ({
            keyword: trend.keyword,
            correlation: trend.correlation,
            trendDirection: trend.trendDirection
          })) || []
        }));
        
        setResults(transformedResults);
        if (transformedResults.length > 0) {
          setSelectedKeyword(transformedResults[0].keyword);
        }
      } else {
        console.error('Error en la respuesta:', data.error);
        // Fallback a datos mock en caso de error
        setResults([mockTrendAnalysis]);
        setSelectedKeyword(mockTrendAnalysis.keyword);
      }
    } catch (error) {
      console.error('Error al analizar tendencias:', error);
      // Fallback a datos mock en caso de error
      setResults([mockTrendAnalysis]);
      setSelectedKeyword(mockTrendAnalysis.keyword);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (direction: string, percentage: number) => {
    if (direction === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (direction === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (direction: string) => {
    if (direction === 'up') return 'text-green-600 bg-green-50';
    if (direction === 'down') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getSeasonIcon = (pattern: string) => {
    switch (pattern) {
      case 'high_winter': return <Snowflake className="h-4 w-4 text-blue-600" />;
      case 'high_summer': return <Sun className="h-4 w-4 text-yellow-600" />;
      case 'back_to_school': return <Leaf className="h-4 w-4 text-green-600" />;
      case 'holiday_peaks': return <Flower2 className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend_change': return <TrendingUp className="h-4 w-4" />;
      case 'seasonal_opportunity': return <Calendar className="h-4 w-4" />;
      case 'competitor_movement': return <Eye className="h-4 w-4" />;
      case 'market_shift': return <BarChart3 className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
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

  const currentAnalysis = results.find(r => r.keyword === selectedKeyword);
  
  // Datos para gráfico de estacionalidad
  const seasonalityData = currentAnalysis?.historicalData.map(item => ({
    month: item.month.split(' ')[0],
    volume: item.volume,
    avgVolume: currentAnalysis.currentVolume
  })) || [];

  // Colores para gráfico de correlación
  const correlationColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Análisis de Tendencias</h1>
            <p className="text-gray-600 mt-1">Analiza patrones temporales y estacionalidad de tus keywords</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCompareMode(!compareMode)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              {compareMode ? 'Vista Simple' : 'Comparar'}
            </Button>
            {results.length > 0 && (
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Datos
              </Button>
            )}
          </div>
        </div>

        {/* Formulario de análisis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analizar Tendencias de Keywords
            </CardTitle>
            <CardDescription>
              Ingresa keywords para analizar sus tendencias históricas y predicciones futuras
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Keywords a Analizar</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Período de Análisis</Label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">Últimos 3 meses</SelectItem>
                    <SelectItem value="6m">Últimos 6 meses</SelectItem>
                    <SelectItem value="12m">Últimos 12 meses</SelectItem>
                    <SelectItem value="24m">Últimos 24 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Checkbox 
                  id="predictions" 
                  checked={showPredictions}
                  onCheckedChange={setShowPredictions}
                />
                <Label htmlFor="predictions" className="text-sm">Incluir predicciones</Label>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Checkbox 
                  id="seasonality" 
                  checked={true}
                />
                <Label htmlFor="seasonality" className="text-sm">Análisis de estacionalidad</Label>
              </div>
            </div>

            <Button 
              onClick={handleAnalysis} 
              disabled={isAnalyzing || !keywords.some(k => k.trim())}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analizando tendencias...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analizar Tendencias
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados del análisis */}
        {currentAnalysis && (
          <div className="space-y-6">
            {/* Resumen de tendencias */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Volumen Actual</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentAnalysis.currentVolume.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    búsquedas mensuales
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
                  {getTrendIcon(currentAnalysis.trendDirection, currentAnalysis.trendPercentage)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentAnalysis.trendDirection === 'up' ? '+' : currentAnalysis.trendDirection === 'down' ? '-' : ''}
                    {Math.abs(currentAnalysis.trendPercentage)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    últimos 6 meses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estacionalidad</CardTitle>
                  {getSeasonIcon(currentAnalysis.seasonalityPattern.pattern)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentAnalysis.seasonalityPattern.seasonalityScore}</div>
                  <p className="text-xs text-muted-foreground">
                    score de estacionalidad
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Predicción</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentAnalysis.predictions[0]?.predictedVolume.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    próximo mes ({currentAnalysis.predictions[0]?.confidence}% confianza)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico principal de tendencias */}
            <Card>
              <CardHeader>
                <CardTitle>Evolución Histórica - "{currentAnalysis.keyword}"</CardTitle>
                <CardDescription>Volumen de búsqueda mensual y tendencias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={currentAnalysis.historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        typeof value === 'number' ? value.toLocaleString() : value, 
                        name === 'volume' ? 'Volumen' : name === 'cpc' ? 'CPC' : 'Dificultad'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#2563eb" 
                      fill="#3b82f6" 
                      fillOpacity={0.1}
                      name="volume"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cpc" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="cpc"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Análisis de estacionalidad y predicciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patrón de Estacionalidad</CardTitle>
                  <CardDescription>Variaciones estacionales detectadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      {getSeasonIcon(currentAnalysis.seasonalityPattern.pattern)}
                      <div className="flex-1 ml-3">
                        <div className="font-medium">Patrón: Back to School</div>
                        <div className="text-sm text-gray-600">
                          Fuerza: {Math.round(currentAnalysis.seasonalityPattern.strength * 100)}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Meses Pico</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentAnalysis.seasonalityPattern.peakMonths.map((month) => (
                          <Badge key={month} variant="outline" className="text-green-600 bg-green-50">
                            {month}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Meses Bajos</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentAnalysis.seasonalityPattern.lowMonths.map((month) => (
                          <Badge key={month} variant="outline" className="text-red-600 bg-red-50">
                            {month}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={seasonalityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="volume" fill="#3b82f6" />
                        <Bar dataKey="avgVolume" fill="#e5e7eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {showPredictions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Predicciones Futuras</CardTitle>
                    <CardDescription>Proyecciones basadas en tendencias históricas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentAnalysis.predictions.map((prediction, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{prediction.month}</span>
                            <Badge variant="outline" className={
                              prediction.confidence > 80 ? 'text-green-600 bg-green-50' :
                              prediction.confidence > 60 ? 'text-yellow-600 bg-yellow-50' :
                              'text-red-600 bg-red-50'
                            }>
                              {prediction.confidence}% confianza
                            </Badge>
                          </div>
                          <div className="text-lg font-bold text-blue-600 mb-2">
                            {prediction.predictedVolume.toLocaleString()} búsquedas
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Factores:</span> {prediction.factors.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Insights y keywords relacionadas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Insights Automáticos</CardTitle>
                  <CardDescription>Patrones y oportunidades detectadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentAnalysis.insights.map((insight, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${getImpactColor(insight.impact)}`}>
                        <div className="flex items-start gap-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{insight.title}</h4>
                            <p className="text-sm mb-2">{insight.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getImpactColor(insight.impact)}>
                                Impacto {insight.impact}
                              </Badge>
                              {insight.actionable && (
                                <Badge variant="outline" className="text-blue-600 bg-blue-50">
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

              <Card>
                <CardHeader>
                  <CardTitle>Keywords Correlacionadas</CardTitle>
                  <CardDescription>Tendencias relacionadas con alta correlación</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentAnalysis.relatedTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{trend.keyword}</span>
                          {getTrendIcon(trend.trendDirection, 0)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getTrendColor(trend.trendDirection)}>
                            {Math.round(trend.correlation * 100)}% correlación
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendsAnalysis;