'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Legend
} from 'recharts';
import { 
  Layers, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  EyeOff,
  Shuffle,
  Target,
  TrendingUp,
  Users,
  Lightbulb,
  Grid3X3,
  List,
  BarChart3
} from 'lucide-react';

interface KeywordCluster {
  id: string;
  name: string;
  keywords: string[];
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  avgVolume: number;
  avgDifficulty: number;
  avgCpc: number;
  color: string;
  size: number;
  topKeywords: Array<{
    keyword: string;
    volume: number;
    difficulty: number;
    cpc: number;
  }>;
}

interface ClusteringVisualizationProps {
  clusters: KeywordCluster[];
  totalKeywords: number;
  method?: 'semantic' | 'intent' | 'metrics';
  onClusterSelect?: (clusterId: string) => void;
  onKeywordSelect?: (keyword: string) => void;
  className?: string;
}

const ClusteringVisualization: React.FC<ClusteringVisualizationProps> = ({
  clusters,
  totalKeywords,
  method = 'semantic',
  onClusterSelect,
  onKeywordSelect,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'scatter' | 'pie' | 'bar' | 'grid'>('scatter');
  const [selectedClusters, setSelectedClusters] = useState<string[]>(clusters.map(c => c.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'size' | 'volume' | 'difficulty' | 'cpc'>('size');

  // Colores predefinidos para clusters
  const clusterColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
  ];

  // Filtrar clusters visibles
  const visibleClusters = useMemo(() => {
    return clusters
      .filter(cluster => selectedClusters.includes(cluster.id))
      .filter(cluster => 
        cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cluster.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'size':
            return b.size - a.size;
          case 'volume':
            return b.avgVolume - a.avgVolume;
          case 'difficulty':
            return a.avgDifficulty - b.avgDifficulty;
          case 'cpc':
            return b.avgCpc - a.avgCpc;
          default:
            return 0;
        }
      });
  }, [clusters, selectedClusters, searchTerm, sortBy]);

  // Datos para el gráfico de dispersión
  const scatterData = visibleClusters.map(cluster => ({
    x: cluster.avgVolume,
    y: cluster.avgDifficulty,
    z: cluster.size,
    name: cluster.name,
    color: cluster.color,
    intent: cluster.intent,
    cpc: cluster.avgCpc
  }));

  // Datos para el gráfico de pastel
  const pieData = visibleClusters.map(cluster => ({
    name: cluster.name,
    value: cluster.size,
    color: cluster.color,
    percentage: ((cluster.size / totalKeywords) * 100).toFixed(1)
  }));

  // Datos para el gráfico de barras
  const barData = visibleClusters.map(cluster => ({
    name: cluster.name.length > 15 ? cluster.name.substring(0, 15) + '...' : cluster.name,
    keywords: cluster.size,
    volume: cluster.avgVolume,
    difficulty: cluster.avgDifficulty,
    cpc: cluster.avgCpc,
    color: cluster.color
  }));

  // Estadísticas por intención
  const intentStats = useMemo(() => {
    const stats = clusters.reduce((acc, cluster) => {
      if (!acc[cluster.intent]) {
        acc[cluster.intent] = { count: 0, keywords: 0, avgVolume: 0, avgDifficulty: 0 };
      }
      acc[cluster.intent].count++;
      acc[cluster.intent].keywords += cluster.size;
      acc[cluster.intent].avgVolume += cluster.avgVolume;
      acc[cluster.intent].avgDifficulty += cluster.avgDifficulty;
      return acc;
    }, {} as Record<string, any>);

    Object.keys(stats).forEach(intent => {
      stats[intent].avgVolume = Math.round(stats[intent].avgVolume / stats[intent].count);
      stats[intent].avgDifficulty = Math.round(stats[intent].avgDifficulty / stats[intent].count);
    });

    return stats;
  }, [clusters]);

  const toggleCluster = (clusterId: string) => {
    setSelectedClusters(prev => 
      prev.includes(clusterId) 
        ? prev.filter(id => id !== clusterId)
        : [...prev, clusterId]
    );
  };

  const selectAllClusters = () => {
    setSelectedClusters(clusters.map(c => c.id));
  };

  const deselectAllClusters = () => {
    setSelectedClusters([]);
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'informational': return <Lightbulb className="h-4 w-4" />;
      case 'commercial': return <TrendingUp className="h-4 w-4" />;
      case 'transactional': return <Target className="h-4 w-4" />;
      case 'navigational': return <Users className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'informational': return 'bg-blue-100 text-blue-800';
      case 'commercial': return 'bg-green-100 text-green-800';
      case 'transactional': return 'bg-purple-100 text-purple-800';
      case 'navigational': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportClusters = () => {
    const csvContent = [
      ['Cluster', 'Keywords Count', 'Intent', 'Avg Volume', 'Avg Difficulty', 'Avg CPC', 'Keywords'].join(','),
      ...visibleClusters.map(cluster => [
        cluster.name,
        cluster.size,
        cluster.intent,
        cluster.avgVolume,
        cluster.avgDifficulty,
        cluster.avgCpc,
        cluster.keywords.join(';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyword-clusters-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          dataKey="x" 
          name="Volumen" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          name="Dificultad" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'x') return [value.toLocaleString(), 'Volumen'];
            if (name === 'y') return [`${value}%`, 'Dificultad'];
            return [value, name];
          }}
          labelFormatter={(label, payload) => {
            if (payload && payload[0]) {
              const data = payload[0].payload;
              return `${data.name} (${data.z} keywords)`;
            }
            return label;
          }}
        />
        {visibleClusters.map((cluster, index) => (
          <Scatter
            key={cluster.id}
            name={cluster.name}
            data={[scatterData[index]]}
            fill={cluster.color}
            onClick={() => onClusterSelect?.(cluster.id)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${percentage}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          onClick={(data) => {
            const cluster = clusters.find(c => c.name === data.name);
            if (cluster) onClusterSelect?.(cluster.id);
          }}
          style={{ cursor: 'pointer' }}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} keywords`, 'Cantidad']} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="keywords" fill="#3b82f6" name="Keywords" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {visibleClusters.map((cluster) => (
        <Card 
          key={cluster.id} 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onClusterSelect?.(cluster.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: cluster.color }}
                />
                {cluster.name}
              </CardTitle>
              <Badge variant="secondary">{cluster.size}</Badge>
            </div>
            <Badge className={getIntentColor(cluster.intent)}>
              {getIntentIcon(cluster.intent)}
              <span className="ml-1 capitalize">{cluster.intent}</span>
            </Badge>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{cluster.avgVolume.toLocaleString()}</div>
                  <div className="text-gray-500">Vol. Prom.</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600">{cluster.avgDifficulty}%</div>
                  <div className="text-gray-500">Dificultad</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">${cluster.avgCpc.toFixed(2)}</div>
                  <div className="text-gray-500">CPC Prom.</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-2">Top Keywords:</div>
                <div className="space-y-1">
                  {cluster.topKeywords.slice(0, 3).map((kw, idx) => (
                    <div 
                      key={idx} 
                      className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onKeywordSelect?.(kw.keyword);
                      }}
                    >
                      • {kw.keyword} ({kw.volume.toLocaleString()})
                    </div>
                  ))}
                  {cluster.keywords.length > 3 && (
                    <div className="text-sm text-gray-400">
                      +{cluster.keywords.length - 3} más...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Estadísticas por intención */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(intentStats).map(([intent, stats]) => (
          <Card key={intent}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 capitalize">{intent}</p>
                  <p className="text-2xl font-bold">{stats.count}</p>
                  <p className="text-xs text-gray-500">{stats.keywords} keywords</p>
                </div>
                <div className={`p-2 rounded-lg ${getIntentColor(intent)}`}>
                  {getIntentIcon(intent)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Visualización de Clusters
              <Badge variant="secondary">{visibleClusters.length} de {clusters.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportClusters}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={selectAllClusters}>
                <Eye className="h-4 w-4 mr-2" />
                Mostrar Todos
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllClusters}>
                <EyeOff className="h-4 w-4 mr-2" />
                Ocultar Todos
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar clusters o keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={sortBy} onValueChange={(value: 'size' | 'volume' | 'difficulty' | 'cpc') => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="size">Ordenar por Tamaño</SelectItem>
                  <SelectItem value="volume">Ordenar por Volumen</SelectItem>
                  <SelectItem value="difficulty">Ordenar por Dificultad</SelectItem>
                  <SelectItem value="cpc">Ordenar por CPC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selector de clusters */}
            <div className="flex flex-wrap gap-2">
              {clusters.map((cluster) => (
                <Button
                  key={cluster.id}
                  variant={selectedClusters.includes(cluster.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCluster(cluster.id)}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: cluster.color }}
                  />
                  {cluster.name}
                  <Badge variant="secondary" className="ml-1">
                    {cluster.size}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualización */}
      <Card>
        <CardHeader>
          <Tabs value={viewMode} onValueChange={(value: 'scatter' | 'pie' | 'bar' | 'grid') => setViewMode(value)}>
            <TabsList>
              <TabsTrigger value="scatter" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dispersión
              </TabsTrigger>
              <TabsTrigger value="pie" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Pastel
              </TabsTrigger>
              <TabsTrigger value="bar" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Barras
              </TabsTrigger>
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Cuadrícula
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          {viewMode === 'scatter' && renderScatterChart()}
          {viewMode === 'pie' && renderPieChart()}
          {viewMode === 'bar' && renderBarChart()}
          {viewMode === 'grid' && renderGridView()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClusteringVisualization;