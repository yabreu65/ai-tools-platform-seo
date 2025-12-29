'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Users, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calendar,
  Filter,
  Plus,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import Link from 'next/link';
import { KeywordMetrics, TrendChart, KeywordTable } from '@/components/keyword-research';
import type { KeywordData, TrendDataPoint } from '@/components/keyword-research/types';

interface AlertData {
  id: string;
  type: 'volume_change' | 'position_change' | 'new_opportunity';
  keyword: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
}

const KeywordResearchDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - en producción vendría de la API
  const [dashboardData, setDashboardData] = useState({
    totalKeywords: 1247,
    avgVolume: 24580,
    avgDifficulty: 64,
    avgCpc: 12.45,
    totalTraffic: 2847392,
    opportunities: 89
  });

  const [topKeywords, setTopKeywords] = useState<KeywordData[]>([
    {
      keyword: 'seo tools',
      position: 8,
      positionChange: 3,
      searchVolume: 49500,
      difficulty: 67,
      cpc: 12.45,
      trafficPotential: 15840,
      serpFeatures: ['featured_snippet', 'people_also_ask'],
      intent: 'commercial',
      competition: 'high',
      trend: 'up'
    },
    {
      keyword: 'keyword research',
      position: 15,
      positionChange: -2,
      searchVolume: 33100,
      difficulty: 72,
      cpc: 8.92,
      trafficPotential: 9930,
      serpFeatures: ['people_also_ask', 'video_results'],
      intent: 'informational',
      competition: 'high',
      trend: 'down'
    },
    {
      keyword: 'backlink checker',
      position: 6,
      positionChange: 1,
      searchVolume: 27100,
      difficulty: 58,
      cpc: 15.67,
      trafficPotential: 18970,
      serpFeatures: ['featured_snippet', 'local_pack'],
      intent: 'commercial',
      competition: 'medium',
      trend: 'up'
    },
    {
      keyword: 'competitor analysis',
      position: 11,
      positionChange: 0,
      searchVolume: 18100,
      difficulty: 64,
      cpc: 11.23,
      trafficPotential: 7240,
      serpFeatures: ['people_also_ask'],
      intent: 'informational',
      competition: 'medium',
      trend: 'stable'
    },
    {
      keyword: 'seo audit tool',
      position: 4,
      positionChange: 2,
      searchVolume: 22400,
      difficulty: 55,
      cpc: 18.90,
      trafficPotential: 20160,
      serpFeatures: ['featured_snippet', 'shopping_results'],
      intent: 'commercial',
      competition: 'medium',
      trend: 'up'
    }
  ]);

  const [trendData, setTrendData] = useState<TrendDataPoint[]>([
    { date: '2024-01-01', volume: 2100000, difficulty: 65, cpc: 11.2, competition: 68, interest: 75 },
    { date: '2024-01-08', volume: 2250000, difficulty: 66, cpc: 11.8, competition: 69, interest: 78 },
    { date: '2024-01-15', volume: 2400000, difficulty: 64, cpc: 12.1, competition: 67, interest: 82 },
    { date: '2024-01-22', volume: 2650000, difficulty: 67, cpc: 12.3, competition: 70, interest: 85 },
    { date: '2024-01-29', volume: 2800000, difficulty: 65, cpc: 12.4, competition: 68, interest: 88 },
    { date: '2024-02-05', volume: 2847392, difficulty: 63, cpc: 12.45, competition: 66, interest: 92 }
  ]);

  const [recentAlerts, setRecentAlerts] = useState<AlertData[]>([
    {
      id: '1',
      type: 'volume_change',
      keyword: 'seo tools',
      message: 'Volumen aumentó 25% en los últimos 7 días',
      severity: 'high',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'new_opportunity',
      keyword: 'keyword planner',
      message: 'Nueva oportunidad detectada - Dificultad baja',
      severity: 'medium',
      timestamp: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      type: 'position_change',
      keyword: 'backlink analysis',
      message: 'Posición mejoró del puesto 15 al 8',
      severity: 'high',
      timestamp: '2024-01-15T08:45:00Z'
    },
    {
      id: '4',
      type: 'volume_change',
      keyword: 'content optimization',
      message: 'Volumen disminuyó 12% esta semana',
      severity: 'medium',
      timestamp: '2024-01-15T07:20:00Z'
    }
  ]);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular actualización de datos
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'volume_change': return <TrendingUp className="h-4 w-4" />;
      case 'position_change': return <Target className="h-4 w-4" />;
      case 'new_opportunity': return <Eye className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    return `Hace ${Math.floor(diffInHours / 24)} días`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Investigación de Keywords</h1>
            <p className="text-gray-600 mt-1">Dashboard principal con métricas y análisis de rendimiento</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Link href="/keyword-research/discover">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Descubrir Keywords
              </Button>
            </Link>
          </div>
        </div>

        {/* Métricas principales */}
        <KeywordMetrics
          totalKeywords={dashboardData.totalKeywords}
          avgVolume={dashboardData.avgVolume}
          avgDifficulty={dashboardData.avgDifficulty}
          avgCpc={dashboardData.avgCpc}
          totalTraffic={dashboardData.totalTraffic}
        />

        {/* Gráfico de tendencias y alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de tendencias */}
          <div className="lg:col-span-2">
            <TrendChart
              data={trendData}
              title="Tendencias de Keywords"
              height={400}
              showVolume={true}
              showDifficulty={true}
              showCpc={true}
            />
          </div>

          {/* Alertas recientes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Alertas Recientes
              </CardTitle>
              <CardDescription>
                Cambios importantes en tus keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {alert.keyword}
                        </p>
                        <p className="text-xs mt-1 opacity-90">
                          {alert.message}
                        </p>
                        <p className="text-xs mt-1 opacity-75">
                          {formatTimestamp(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/keyword-research/alerts">
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Ver todas las alertas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Keywords */}
        <KeywordTable
          data={topKeywords}
          title="Top Keywords"
          showSelection={false}
          showFilters={false}
          showExport={true}
          onKeywordClick={(keyword) => {
            // Navegar a análisis detallado
            window.open(`/keyword-research/difficulty?keyword=${encodeURIComponent(keyword)}`, '_blank');
          }}
        />

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/keyword-research/discover">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Search className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-2">Descubrir Keywords</h3>
                <p className="text-sm text-gray-600">Encuentra nuevas oportunidades de keywords</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/keyword-research/difficulty">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 mx-auto mb-3 text-red-600" />
                <h3 className="font-semibold mb-2">Análisis de Dificultad</h3>
                <p className="text-sm text-gray-600">Evalúa la competencia de keywords</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/keyword-research/trends">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold mb-2">Análisis de Tendencias</h3>
                <p className="text-sm text-gray-600">Estudia patrones estacionales</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/keyword-research/clustering">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold mb-2">Clustering</h3>
                <p className="text-sm text-gray-600">Agrupa keywords por temática</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default KeywordResearchDashboard;