'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Globe, 
  BarChart3, 
  AlertCircle, 
  Plus,
  Eye,
  Download,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface CompetitorData {
  id: string;
  domain: string;
  name: string;
  status: 'active' | 'pending' | 'error';
  lastAnalyzed: string;
  domainRating: number;
  organicKeywords: number;
  organicTraffic: number;
  backlinks: number;
}

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

const CompetitorAnalysisDashboard = () => {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [loading, setLoading] = useState(true);

  // Datos simulados para el dashboard
  const mockCompetitors: CompetitorData[] = [
    {
      id: '1',
      domain: 'competitor1.com',
      name: 'Competitor 1',
      status: 'active',
      lastAnalyzed: '2024-01-15',
      domainRating: 85,
      organicKeywords: 15420,
      organicTraffic: 245000,
      backlinks: 8950
    },
    {
      id: '2',
      domain: 'competitor2.com',
      name: 'Competitor 2',
      status: 'active',
      lastAnalyzed: '2024-01-14',
      domainRating: 78,
      organicKeywords: 12350,
      organicTraffic: 189000,
      backlinks: 6720
    },
    {
      id: '3',
      domain: 'competitor3.com',
      name: 'Competitor 3',
      status: 'pending',
      lastAnalyzed: '2024-01-10',
      domainRating: 72,
      organicKeywords: 9800,
      organicTraffic: 156000,
      backlinks: 5430
    }
  ];

  const metrics: MetricCard[] = [
    {
      title: 'Competidores Monitoreados',
      value: '3',
      change: '+1 este mes',
      trend: 'up',
      icon: <Users className="h-4 w-4" />
    },
    {
      title: 'Keywords Analizadas',
      value: '37.5K',
      change: '+12% vs mes anterior',
      trend: 'up',
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      title: 'Oportunidades Detectadas',
      value: '156',
      change: '+23 nuevas',
      trend: 'up',
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: 'Alertas Activas',
      value: '8',
      change: '2 críticas',
      trend: 'neutral',
      icon: <AlertCircle className="h-4 w-4" />
    }
  ];

  const trafficData = [
    { month: 'Ene', competitor1: 245000, competitor2: 189000, competitor3: 156000 },
    { month: 'Feb', competitor1: 252000, competitor2: 195000, competitor3: 162000 },
    { month: 'Mar', competitor1: 248000, competitor2: 201000, competitor3: 158000 },
    { month: 'Abr', competitor1: 265000, competitor2: 198000, competitor3: 165000 },
    { month: 'May', competitor1: 271000, competitor2: 205000, competitor3: 171000 },
    { month: 'Jun', competitor1: 268000, competitor2: 212000, competitor3: 168000 }
  ];

  const keywordDistribution = [
    { name: 'Keywords Compartidas', value: 2450, color: '#2563eb' },
    { name: 'Keywords Únicas', value: 8920, color: '#10b981' },
    { name: 'Oportunidades', value: 1560, color: '#f59e0b' }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setCompetitors(mockCompetitors);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análisis de Competidores</h1>
          <p className="text-gray-600 mt-2">
            Monitorea y analiza a tus competidores para identificar oportunidades SEO
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/competitor-analysis/analyze">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Análisis
            </Button>
          </Link>
          <Link href="/competitor-analysis/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
          </Link>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <div className="text-blue-600">{metric.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <p className={`text-xs mt-1 ${
                metric.trend === 'up' ? 'text-green-600' : 
                metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de tráfico orgánico */}
        <Card>
          <CardHeader>
            <CardTitle>Tráfico Orgánico - Comparación</CardTitle>
            <CardDescription>
              Evolución del tráfico orgánico de competidores monitoreados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Visitas']} />
                <Line 
                  type="monotone" 
                  dataKey="competitor1" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  name="Competitor 1"
                />
                <Line 
                  type="monotone" 
                  dataKey="competitor2" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Competitor 2"
                />
                <Line 
                  type="monotone" 
                  dataKey="competitor3" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Competitor 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de keywords */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Keywords</CardTitle>
            <CardDescription>
              Análisis de keywords compartidas vs oportunidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={keywordDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {keywordDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Keywords']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista de competidores */}
      <Card>
        <CardHeader>
          <CardTitle>Competidores Monitoreados</CardTitle>
          <CardDescription>
            Lista de competidores actualmente bajo análisis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitors.map((competitor) => (
              <div key={competitor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{competitor.name}</h3>
                    <p className="text-sm text-gray-600">{competitor.domain}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{competitor.domainRating}</p>
                    <p className="text-xs text-gray-600">DR</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{competitor.organicKeywords.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Keywords</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{competitor.organicTraffic.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Tráfico</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{competitor.backlinks.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Backlinks</p>
                  </div>
                  
                  {getStatusBadge(competitor.status)}
                  
                  <div className="flex space-x-2">
                    <Link href={`/competitor-analysis/results/${competitor.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enlaces rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/competitor-analysis/keywords">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold">Análisis de Keywords</h3>
              <p className="text-sm text-gray-600">Comparar keywords y encontrar oportunidades</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/competitor-analysis/backlinks">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold">Análisis de Backlinks</h3>
              <p className="text-sm text-gray-600">Descubrir oportunidades de link building</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/competitor-analysis/content">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-semibold">Análisis de Contenido</h3>
              <p className="text-sm text-gray-600">Identificar gaps de contenido</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/competitor-analysis/reports">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Download className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold">Reportes</h3>
              <p className="text-sm text-gray-600">Generar y descargar reportes</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default CompetitorAnalysisDashboard;