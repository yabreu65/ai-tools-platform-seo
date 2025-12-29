'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Network, 
  Layers, 
  Target, 
  Brain, 
  Zap,
  Download,
  Filter,
  Plus,
  X,
  Eye,
  BarChart3,
  TrendingUp,
  Search,
  FileText,
  Settings,
  Shuffle
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  TreeMap
} from 'recharts';

interface KeywordCluster {
  id: string;
  name: string;
  keywords: ClusterKeyword[];
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  totalVolume: number;
  avgDifficulty: number;
  avgCpc: number;
  opportunities: number;
  color: string;
  centroid: {
    x: number;
    y: number;
  };
}

interface ClusterKeyword {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  position: {
    x: number;
    y: number;
  };
  similarity: number;
  intent: string;
}

interface ClusteringResult {
  clusters: KeywordCluster[];
  totalKeywords: number;
  clusteringScore: number;
  method: string;
  parameters: {
    minClusterSize: number;
    maxClusters: number;
    similarityThreshold: number;
  };
  suggestions: ClusterSuggestion[];
}

interface ClusterSuggestion {
  type: 'merge' | 'split' | 'rename' | 'optimize';
  title: string;
  description: string;
  clusters: string[];
  impact: 'high' | 'medium' | 'low';
}

const KeywordClustering = () => {
  const [keywordInput, setKeywordInput] = useState('');
  const [clusteringMethod, setClusteringMethod] = useState('semantic');
  const [minClusterSize, setMinClusterSize] = useState(3);
  const [maxClusters, setMaxClusters] = useState(10);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ClusteringResult | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [viewMode, setViewMode] = useState<'scatter' | 'tree' | 'list'>('scatter');

  // Mock data
  const mockClusteringResult: ClusteringResult = {
    clusters: [
      {
        id: 'cluster-1',
        name: 'SEO Tools - General',
        intent: 'informational',
        totalVolume: 125000,
        avgDifficulty: 65,
        avgCpc: 12.45,
        opportunities: 8,
        color: '#3b82f6',
        centroid: { x: 50, y: 65 },
        keywords: [
          { keyword: 'seo tools', volume: 49500, difficulty: 67, cpc: 12.30, position: { x: 48, y: 67 }, similarity: 1.0, intent: 'informational' },
          { keyword: 'best seo tools', volume: 33100, difficulty: 72, cpc: 15.20, position: { x: 52, y: 72 }, similarity: 0.89, intent: 'commercial' },
          { keyword: 'free seo tools', volume: 27300, difficulty: 58, cpc: 8.90, position: { x: 45, y: 58 }, similarity: 0.85, intent: 'commercial' },
          { keyword: 'seo analysis tools', volume: 15100, difficulty: 61, cpc: 11.80, position: { x: 53, y: 61 }, similarity: 0.82, intent: 'informational' }
        ]
      },
      {
        id: 'cluster-2',
        name: 'Keyword Research',
        intent: 'commercial',
        totalVolume: 89500,
        avgDifficulty: 58,
        avgCpc: 18.75,
        opportunities: 12,
        color: '#10b981',
        centroid: { x: 75, y: 58 },
        keywords: [
          { keyword: 'keyword research', volume: 40500, difficulty: 62, cpc: 16.50, position: { x: 73, y: 62 }, similarity: 1.0, intent: 'informational' },
          { keyword: 'keyword research tool', volume: 22100, difficulty: 65, cpc: 22.30, position: { x: 77, y: 65 }, similarity: 0.91, intent: 'commercial' },
          { keyword: 'free keyword research', volume: 18200, difficulty: 48, cpc: 14.20, position: { x: 71, y: 48 }, similarity: 0.87, intent: 'commercial' },
          { keyword: 'keyword planner', volume: 8700, difficulty: 57, cpc: 21.90, position: { x: 79, y: 57 }, similarity: 0.76, intent: 'navigational' }
        ]
      },
      {
        id: 'cluster-3',
        name: 'Backlink Analysis',
        intent: 'commercial',
        totalVolume: 67800,
        avgDifficulty: 71,
        avgCpc: 25.60,
        opportunities: 6,
        color: '#f59e0b',
        centroid: { x: 25, y: 71 },
        keywords: [
          { keyword: 'backlink checker', volume: 33500, difficulty: 74, cpc: 28.90, position: { x: 23, y: 74 }, similarity: 1.0, intent: 'commercial' },
          { keyword: 'free backlink checker', volume: 19800, difficulty: 68, cpc: 22.30, position: { x: 27, y: 68 }, similarity: 0.88, intent: 'commercial' },
          { keyword: 'backlink analysis', volume: 14500, difficulty: 71, cpc: 25.60, position: { x: 25, y: 71 }, similarity: 0.84, intent: 'informational' }
        ]
      },
      {
        id: 'cluster-4',
        name: 'Rank Tracking',
        intent: 'transactional',
        totalVolume: 45200,
        avgDifficulty: 63,
        avgCpc: 31.20,
        opportunities: 4,
        color: '#ef4444',
        centroid: { x: 85, y: 63 },
        keywords: [
          { keyword: 'rank tracker', volume: 22100, difficulty: 65, cpc: 33.50, position: { x: 83, y: 65 }, similarity: 1.0, intent: 'commercial' },
          { keyword: 'google rank tracker', volume: 12800, difficulty: 68, cpc: 29.80, position: { x: 87, y: 68 }, similarity: 0.86, intent: 'commercial' },
          { keyword: 'serp tracker', volume: 10300, difficulty: 56, cpc: 30.30, position: { x: 85, y: 56 }, similarity: 0.79, intent: 'commercial' }
        ]
      },
      {
        id: 'cluster-5',
        name: 'Competitor Analysis',
        intent: 'informational',
        totalVolume: 38900,
        avgDifficulty: 69,
        avgCpc: 19.40,
        opportunities: 7,
        color: '#8b5cf6',
        centroid: { x: 15, y: 45 },
        keywords: [
          { keyword: 'competitor analysis', volume: 18500, difficulty: 72, cpc: 21.20, position: { x: 13, y: 47 }, similarity: 1.0, intent: 'informational' },
          { keyword: 'seo competitor analysis', volume: 12200, difficulty: 68, cpc: 18.90, position: { x: 17, y: 43 }, similarity: 0.83, intent: 'informational' },
          { keyword: 'competitor research', volume: 8200, difficulty: 67, cpc: 18.10, position: { x: 15, y: 45 }, similarity: 0.81, intent: 'informational' }
        ]
      }
    ],
    totalKeywords: 20,
    clusteringScore: 0.87,
    method: 'Semantic Clustering (NLP)',
    parameters: {
      minClusterSize: 3,
      maxClusters: 10,
      similarityThreshold: 0.7
    },
    suggestions: [
      {
        type: 'merge',
        title: 'Fusionar clusters similares',
        description: 'Los clusters "SEO Tools - General" y "Competitor Analysis" tienen alta similitud semántica',
        clusters: ['cluster-1', 'cluster-5'],
        impact: 'medium'
      },
      {
        type: 'split',
        title: 'Dividir cluster grande',
        description: 'El cluster "SEO Tools - General" podría dividirse por intención comercial vs informacional',
        clusters: ['cluster-1'],
        impact: 'high'
      },
      {
        type: 'optimize',
        title: 'Optimizar threshold',
        description: 'Reducir el threshold a 0.65 podría crear clusters más específicos',
        clusters: [],
        impact: 'low'
      }
    ]
  };

  const handleClustering = async () => {
    setIsProcessing(true);
    
    try {
      // Filtrar keywords válidas
      const keywords = keywordInput
        .split(/[,\n]/)
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (keywords.length === 0) {
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/keyword-research/clustering/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords,
          method: clusteringMethod,
          minClusterSize,
          maxClusters,
          similarityThreshold,
          includeMetrics: true,
          includeOpportunities: true
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la API de clustering');
      }

      const data = await response.json();
      
      // Transformar datos de la API al formato esperado
      const transformedResult = {
        clusters: data.clusters.map((cluster: any) => ({
          ...cluster,
          keywords: cluster.keywords.map((keyword: any) => ({
            ...keyword,
            position: keyword.position || { x: Math.random() * 100, y: Math.random() * 100 }
          }))
        })),
        totalKeywords: data.totalKeywords,
        totalClusters: data.totalClusters,
        avgClusterSize: data.avgClusterSize,
        silhouetteScore: data.silhouetteScore,
        suggestions: data.suggestions || []
      };

      setResults(transformedResult);
      if (transformedResult.clusters.length > 0) {
        setSelectedCluster(transformedResult.clusters[0].id);
      }
    } catch (error) {
      console.error('Error al procesar clustering:', error);
      // Fallback a datos mock en caso de error
      setResults(mockClusteringResult);
      setSelectedCluster(mockClusteringResult.clusters[0].id);
    } finally {
      setIsProcessing(false);
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'informational': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'commercial': return 'text-green-600 bg-green-50 border-green-200';
      case 'transactional': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'navigational': return 'text-orange-600 bg-orange-50 border-orange-200';
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

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'merge': return <Layers className="h-4 w-4" />;
      case 'split': return <Shuffle className="h-4 w-4" />;
      case 'rename': return <FileText className="h-4 w-4" />;
      case 'optimize': return <Settings className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  // Datos para scatter plot
  const scatterData = results?.clusters.flatMap(cluster => 
    cluster.keywords.map(keyword => ({
      x: keyword.position.x,
      y: keyword.position.y,
      volume: keyword.volume,
      difficulty: keyword.difficulty,
      keyword: keyword.keyword,
      cluster: cluster.name,
      color: cluster.color
    }))
  ) || [];

  // Datos para pie chart de intenciones
  const intentData = results?.clusters.reduce((acc, cluster) => {
    const existing = acc.find(item => item.name === cluster.intent);
    if (existing) {
      existing.value += cluster.totalVolume;
      existing.count += 1;
    } else {
      acc.push({
        name: cluster.intent,
        value: cluster.totalVolume,
        count: 1,
        color: cluster.color
      });
    }
    return acc;
  }, [] as any[]) || [];

  const selectedClusterData = results?.clusters.find(c => c.id === selectedCluster);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clustering de Keywords</h1>
            <p className="text-gray-600 mt-1">Agrupa keywords por similitud semántica e intención de búsqueda</p>
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
                    <SelectItem value="scatter">Vista Scatter</SelectItem>
                    <SelectItem value="tree">Vista Árbol</SelectItem>
                    <SelectItem value="list">Vista Lista</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Clusters
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Formulario de clustering */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Configurar Clustering
            </CardTitle>
            <CardDescription>
              Ingresa keywords y configura los parámetros para generar clusters automáticos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Keywords a Agrupar</Label>
              <Textarea
                placeholder="Ingresa keywords separadas por comas o una por línea&#10;Ej: seo tools, keyword research, backlink checker, rank tracker..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Puedes ingresar hasta 1000 keywords. Se analizarán automáticamente volumen, dificultad y CPC.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Método de Clustering</Label>
                <Select value={clusteringMethod} onValueChange={setClusteringMethod}>
                  <SelectTrigger>
                    <Brain className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semantic">Semántico (NLP)</SelectItem>
                    <SelectItem value="intent">Por Intención</SelectItem>
                    <SelectItem value="metrics">Por Métricas</SelectItem>
                    <SelectItem value="hybrid">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Tamaño Mínimo de Cluster</Label>
                <Input
                  type="number"
                  min="2"
                  max="20"
                  value={minClusterSize}
                  onChange={(e) => setMinClusterSize(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Máximo de Clusters</Label>
                <Input
                  type="number"
                  min="3"
                  max="50"
                  value={maxClusters}
                  onChange={(e) => setMaxClusters(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Threshold de Similitud</Label>
                <Input
                  type="number"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <Button 
              onClick={handleClustering} 
              disabled={isProcessing || !keywordInput.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando clustering...
                </>
              ) : (
                <>
                  <Network className="h-4 w-4 mr-2" />
                  Generar Clusters
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados del clustering */}
        {results && (
          <div className="space-y-6">
            {/* Métricas generales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Keywords</CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.totalKeywords}</div>
                  <p className="text-xs text-muted-foreground">
                    keywords analizadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clusters Generados</CardTitle>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.clusters.length}</div>
                  <p className="text-xs text-muted-foreground">
                    grupos identificados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Score de Clustering</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(results.clusteringScore * 100)}%</div>
                  <p className="text-xs text-muted-foreground">
                    calidad de agrupación
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Método Usado</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold">{results.method}</div>
                  <p className="text-xs text-muted-foreground">
                    algoritmo aplicado
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Visualización principal */}
            {viewMode === 'scatter' && (
              <Card>
                <CardHeader>
                  <CardTitle>Mapa de Clusters - Volumen vs Dificultad</CardTitle>
                  <CardDescription>Distribución espacial de keywords agrupadas por similitud</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={500}>
                    <ScatterChart data={scatterData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="x" 
                        name="Posición X" 
                        domain={[0, 100]}
                        label={{ value: 'Espacio Semántico X', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis 
                        dataKey="y" 
                        name="Posición Y" 
                        domain={[0, 100]}
                        label={{ value: 'Espacio Semántico Y', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          name === 'volume' ? `${value.toLocaleString()} búsquedas` :
                          name === 'difficulty' ? `${value}% dificultad` : value,
                          props.payload.keyword
                        ]}
                        labelFormatter={() => ''}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg">
                                <p className="font-medium">{data.keyword}</p>
                                <p className="text-sm text-gray-600">Cluster: {data.cluster}</p>
                                <p className="text-sm">Volumen: {data.volume.toLocaleString()}</p>
                                <p className="text-sm">Dificultad: {data.difficulty}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {results.clusters.map((cluster) => (
                        <Scatter
                          key={cluster.id}
                          name={cluster.name}
                          data={cluster.keywords.map(k => ({
                            x: k.position.x,
                            y: k.position.y,
                            volume: k.volume,
                            difficulty: k.difficulty,
                            keyword: k.keyword,
                            cluster: cluster.name
                          }))}
                          fill={cluster.color}
                        />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Lista de clusters y análisis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Clusters Identificados</CardTitle>
                    <CardDescription>Grupos de keywords con características similares</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.clusters.map((cluster) => (
                        <div 
                          key={cluster.id} 
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedCluster === cluster.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedCluster(cluster.id)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: cluster.color }}
                              ></div>
                              <h3 className="font-medium">{cluster.name}</h3>
                              <Badge variant="outline" className={getIntentColor(cluster.intent)}>
                                {cluster.intent}
                              </Badge>
                            </div>
                            <Badge variant="outline">
                              {cluster.keywords.length} keywords
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {cluster.totalVolume.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-600">Volumen Total</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-orange-600">
                                {Math.round(cluster.avgDifficulty)}%
                              </div>
                              <div className="text-xs text-gray-600">Dificultad Promedio</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">
                                ${cluster.avgCpc.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-600">CPC Promedio</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {cluster.keywords.slice(0, 4).map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {keyword.keyword}
                              </Badge>
                            ))}
                            {cluster.keywords.length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{cluster.keywords.length - 4} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Distribución por intención */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución por Intención</CardTitle>
                    <CardDescription>Volumen de búsqueda por tipo de intención</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={intentData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {intentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value.toLocaleString(), 'Volumen']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Sugerencias de optimización */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sugerencias de Optimización</CardTitle>
                    <CardDescription>Recomendaciones para mejorar el clustering</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.suggestions.map((suggestion, index) => (
                        <div key={index} className={`border rounded-lg p-3 ${getImpactColor(suggestion.impact)}`}>
                          <div className="flex items-start gap-2">
                            {getSuggestionIcon(suggestion.type)}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">{suggestion.title}</h4>
                              <p className="text-xs mb-2">{suggestion.description}</p>
                              <Badge variant="outline" className={getImpactColor(suggestion.impact)}>
                                Impacto {suggestion.impact}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Detalle del cluster seleccionado */}
            {selectedClusterData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: selectedClusterData.color }}
                    ></div>
                    Detalle: {selectedClusterData.name}
                  </CardTitle>
                  <CardDescription>
                    Keywords del cluster con métricas detalladas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Keyword</th>
                          <th className="text-right py-2">Volumen</th>
                          <th className="text-right py-2">Dificultad</th>
                          <th className="text-right py-2">CPC</th>
                          <th className="text-right py-2">Similitud</th>
                          <th className="text-center py-2">Intención</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClusterData.keywords.map((keyword, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 font-medium">{keyword.keyword}</td>
                            <td className="text-right py-3">{keyword.volume.toLocaleString()}</td>
                            <td className="text-right py-3">
                              <Badge variant="outline" className={
                                keyword.difficulty > 70 ? 'text-red-600 bg-red-50' :
                                keyword.difficulty > 50 ? 'text-yellow-600 bg-yellow-50' :
                                'text-green-600 bg-green-50'
                              }>
                                {keyword.difficulty}%
                              </Badge>
                            </td>
                            <td className="text-right py-3">${keyword.cpc.toFixed(2)}</td>
                            <td className="text-right py-3">
                              <Badge variant="outline">
                                {Math.round(keyword.similarity * 100)}%
                              </Badge>
                            </td>
                            <td className="text-center py-3">
                              <Badge variant="outline" className={getIntentColor(keyword.intent)}>
                                {keyword.intent}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default KeywordClustering;