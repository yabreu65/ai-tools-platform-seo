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
  TrendingUp, 
  TrendingDown, 
  Target, 
  Eye, 
  Calendar,
  MapPin,
  Globe,
  Plus,
  X,
  Download,
  Filter,
  Bell,
  Settings,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
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
  ComposedChart,
  ReferenceLine
} from 'recharts';

interface RankingProject {
  id: string;
  name: string;
  domain: string;
  keywords: TrackedKeyword[];
  settings: ProjectSettings;
  created: string;
  lastUpdate: string;
}

interface TrackedKeyword {
  id: string;
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  bestPosition: number;
  worstPosition: number;
  url: string;
  searchVolume: number;
  difficulty: number;
  history: RankingHistory[];
  alerts: KeywordAlert[];
  tags: string[];
}

interface RankingHistory {
  date: string;
  position: number;
  url: string;
  serp_features: string[];
  visibility: number;
}

interface ProjectSettings {
  location: string;
  language: string;
  device: 'desktop' | 'mobile' | 'tablet';
  searchEngine: 'google' | 'bing' | 'yahoo';
  frequency: 'daily' | 'weekly' | 'monthly';
  competitors: string[];
}

interface KeywordAlert {
  type: 'position_change' | 'serp_feature' | 'competitor_movement' | 'visibility_drop';
  threshold: number;
  enabled: boolean;
  lastTriggered?: string;
}

interface CompetitorData {
  domain: string;
  keywords: CompetitorKeyword[];
  avgPosition: number;
  visibility: number;
  trend: 'up' | 'down' | 'stable';
}

interface CompetitorKeyword {
  keyword: string;
  position: number;
  previousPosition: number;
  url: string;
}

const RankTracking = () => {
  const [projects, setProjects] = useState<RankingProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDomain, setNewProjectDomain] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'keywords' | 'competitors'>('overview');

  // Mock data
  const mockProject: RankingProject = {
    id: 'project-1',
    name: 'Mi Sitio Web SEO',
    domain: 'misitio.com',
    created: '2024-01-15',
    lastUpdate: '2024-01-20',
    settings: {
      location: 'United States',
      language: 'en',
      device: 'desktop',
      searchEngine: 'google',
      frequency: 'daily',
      competitors: ['competitor1.com', 'competitor2.com', 'competitor3.com']
    },
    keywords: [
      {
        id: 'kw-1',
        keyword: 'seo tools',
        currentPosition: 8,
        previousPosition: 12,
        bestPosition: 5,
        worstPosition: 25,
        url: '/seo-tools',
        searchVolume: 49500,
        difficulty: 67,
        tags: ['herramientas', 'seo'],
        alerts: [
          { type: 'position_change', threshold: 5, enabled: true },
          { type: 'visibility_drop', threshold: 20, enabled: true }
        ],
        history: [
          { date: '2024-01-01', position: 15, url: '/seo-tools', serp_features: [], visibility: 45 },
          { date: '2024-01-02', position: 14, url: '/seo-tools', serp_features: [], visibility: 47 },
          { date: '2024-01-03', position: 13, url: '/seo-tools', serp_features: [], visibility: 49 },
          { date: '2024-01-04', position: 12, url: '/seo-tools', serp_features: [], visibility: 52 },
          { date: '2024-01-05', position: 11, url: '/seo-tools', serp_features: [], visibility: 55 },
          { date: '2024-01-06', position: 10, url: '/seo-tools', serp_features: [], visibility: 58 },
          { date: '2024-01-07', position: 9, url: '/seo-tools', serp_features: [], visibility: 62 },
          { date: '2024-01-08', position: 8, url: '/seo-tools', serp_features: [], visibility: 65 }
        ]
      },
      {
        id: 'kw-2',
        keyword: 'keyword research',
        currentPosition: 15,
        previousPosition: 18,
        bestPosition: 12,
        worstPosition: 35,
        url: '/keyword-research',
        searchVolume: 40500,
        difficulty: 62,
        tags: ['keywords', 'investigacion'],
        alerts: [
          { type: 'position_change', threshold: 10, enabled: true }
        ],
        history: [
          { date: '2024-01-01', position: 25, url: '/keyword-research', serp_features: [], visibility: 28 },
          { date: '2024-01-02', position: 23, url: '/keyword-research', serp_features: [], visibility: 30 },
          { date: '2024-01-03', position: 21, url: '/keyword-research', serp_features: [], visibility: 32 },
          { date: '2024-01-04', position: 20, url: '/keyword-research', serp_features: [], visibility: 34 },
          { date: '2024-01-05', position: 19, url: '/keyword-research', serp_features: [], visibility: 36 },
          { date: '2024-01-06', position: 18, url: '/keyword-research', serp_features: [], visibility: 38 },
          { date: '2024-01-07', position: 16, url: '/keyword-research', serp_features: [], visibility: 40 },
          { date: '2024-01-08', position: 15, url: '/keyword-research', serp_features: [], visibility: 42 }
        ]
      },
      {
        id: 'kw-3',
        keyword: 'backlink checker',
        currentPosition: 22,
        previousPosition: 19,
        bestPosition: 18,
        worstPosition: 45,
        url: '/backlink-checker',
        searchVolume: 33500,
        difficulty: 74,
        tags: ['backlinks', 'analisis'],
        alerts: [
          { type: 'position_change', threshold: 5, enabled: true, lastTriggered: '2024-01-07' }
        ],
        history: [
          { date: '2024-01-01', position: 28, url: '/backlink-checker', serp_features: [], visibility: 22 },
          { date: '2024-01-02', position: 26, url: '/backlink-checker', serp_features: [], visibility: 24 },
          { date: '2024-01-03', position: 24, url: '/backlink-checker', serp_features: [], visibility: 26 },
          { date: '2024-01-04', position: 22, url: '/backlink-checker', serp_features: [], visibility: 28 },
          { date: '2024-01-05', position: 20, url: '/backlink-checker', serp_features: [], visibility: 30 },
          { date: '2024-01-06', position: 19, url: '/backlink-checker', serp_features: [], visibility: 32 },
          { date: '2024-01-07', position: 21, url: '/backlink-checker', serp_features: [], visibility: 30 },
          { date: '2024-01-08', position: 22, url: '/backlink-checker', serp_features: [], visibility: 28 }
        ]
      }
    ]
  };

  const mockCompetitors: CompetitorData[] = [
    {
      domain: 'competitor1.com',
      avgPosition: 6.5,
      visibility: 78,
      trend: 'up',
      keywords: [
        { keyword: 'seo tools', position: 3, previousPosition: 5, url: '/tools' },
        { keyword: 'keyword research', position: 7, previousPosition: 8, url: '/keywords' },
        { keyword: 'backlink checker', position: 9, previousPosition: 12, url: '/backlinks' }
      ]
    },
    {
      domain: 'competitor2.com',
      avgPosition: 11.2,
      visibility: 65,
      trend: 'stable',
      keywords: [
        { keyword: 'seo tools', position: 12, previousPosition: 11, url: '/seo-suite' },
        { keyword: 'keyword research', position: 9, previousPosition: 9, url: '/research' },
        { keyword: 'backlink checker', position: 13, previousPosition: 14, url: '/links' }
      ]
    },
    {
      domain: 'competitor3.com',
      avgPosition: 18.7,
      visibility: 42,
      trend: 'down',
      keywords: [
        { keyword: 'seo tools', position: 18, previousPosition: 15, url: '/tools-suite' },
        { keyword: 'keyword research', position: 21, previousPosition: 19, url: '/keyword-tool' },
        { keyword: 'backlink checker', position: 17, previousPosition: 16, url: '/link-analysis' }
      ]
    }
  ];

  useEffect(() => {
    setProjects([mockProject]);
    setSelectedProject(mockProject.id);
  }, []);

  const currentProject = projects.find(p => p.id === selectedProject);

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !newProjectDomain.trim()) return;

    try {
      // Filtrar keywords válidas
      const keywords = newKeywords
        .split(/[,\n]/)
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const response = await fetch('/api/keyword-research/tracking/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: newProjectName,
          domain: newProjectDomain,
          keywords,
          settings: {
            location: 'United States',
            language: 'en',
            device: 'desktop',
            searchEngine: 'google',
            frequency: 'daily',
            competitors: []
          },
          alerts: {
            positionChange: { enabled: true, threshold: 5 },
            visibilityDrop: { enabled: true, threshold: 20 },
            serpFeatures: { enabled: true },
            competitorMovement: { enabled: false, threshold: 3 }
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear el proyecto de tracking');
      }

      const data = await response.json();
      
      // Transformar datos de la API al formato esperado
      const newProject: RankingProject = {
        id: data.project.id,
        name: data.project.name,
        domain: data.project.domain,
        created: data.project.created,
        lastUpdate: data.project.lastUpdate,
        settings: data.project.settings,
        keywords: data.project.keywords.map((kw: any) => ({
          id: kw.id,
          keyword: kw.keyword,
          currentPosition: kw.currentPosition,
          previousPosition: kw.previousPosition || kw.currentPosition,
          bestPosition: kw.bestPosition,
          worstPosition: kw.worstPosition,
          url: kw.url,
          searchVolume: kw.searchVolume,
          difficulty: kw.difficulty,
          tags: kw.tags || [],
          alerts: kw.alerts || [],
          history: kw.history || []
        }))
      };

      setProjects([...projects, newProject]);
      setSelectedProject(newProject.id);
      setShowNewProject(false);
      setNewProjectName('');
      setNewProjectDomain('');
      setNewKeywords('');
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      // Fallback a creación local en caso de error
      const newProject: RankingProject = {
        id: `project-${Date.now()}`,
        name: newProjectName,
        domain: newProjectDomain,
        created: new Date().toISOString().split('T')[0],
        lastUpdate: new Date().toISOString().split('T')[0],
        settings: {
          location: 'United States',
          language: 'en',
          device: 'desktop',
          searchEngine: 'google',
          frequency: 'daily',
          competitors: []
        },
        keywords: []
      };

      setProjects([...projects, newProject]);
      setSelectedProject(newProject.id);
      setShowNewProject(false);
      setNewProjectName('');
      setNewProjectDomain('');
      setNewKeywords('');
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current < previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current > previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current < previous) return 'text-green-600 bg-green-50';
    if (current > previous) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'text-green-600 bg-green-50 border-green-200';
    if (position <= 10) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (position <= 20) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getCompetitorTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  // Datos para gráficos
  const overviewData = currentProject?.keywords.map(keyword => {
    const latestHistory = keyword.history[keyword.history.length - 1];
    return {
      keyword: keyword.keyword.length > 15 ? keyword.keyword.substring(0, 15) + '...' : keyword.keyword,
      position: keyword.currentPosition,
      previousPosition: keyword.previousPosition,
      visibility: latestHistory?.visibility || 0,
      volume: keyword.searchVolume
    };
  }) || [];

  const timeSeriesData = currentProject?.keywords[0]?.history.map(h => ({
    date: h.date,
    position: h.position,
    visibility: h.visibility
  })) || [];

  const competitorComparison = mockCompetitors.map(comp => ({
    domain: comp.domain.replace('.com', ''),
    avgPosition: comp.avgPosition,
    visibility: comp.visibility
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seguimiento de Rankings</h1>
            <p className="text-gray-600 mt-1">Monitorea las posiciones de tus keywords en tiempo real</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowNewProject(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proyecto
            </Button>
            {currentProject && (
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Datos
              </Button>
            )}
          </div>
        </div>

        {/* Selector de proyecto */}
        {projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Proyectos de Seguimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Seleccionar proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} ({project.domain})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Últimos 7 días</SelectItem>
                    <SelectItem value="30d">Últimos 30 días</SelectItem>
                    <SelectItem value="90d">Últimos 90 días</SelectItem>
                    <SelectItem value="1y">Último año</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                  <SelectTrigger className="w-40">
                    <Eye className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Vista General</SelectItem>
                    <SelectItem value="keywords">Keywords</SelectItem>
                    <SelectItem value="competitors">Competidores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulario nuevo proyecto */}
        {showNewProject && (
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Proyecto de Seguimiento</CardTitle>
              <CardDescription>Configura un nuevo proyecto para monitorear tus keywords</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Proyecto</Label>
                  <Input
                    placeholder="Ej: Mi Sitio Web"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dominio</Label>
                  <Input
                    placeholder="Ej: misitio.com"
                    value={newProjectDomain}
                    onChange={(e) => setNewProjectDomain(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Keywords a Monitorear</Label>
                <Textarea
                  placeholder="Ingresa keywords separadas por comas o una por línea&#10;Ej: seo tools, keyword research, backlink checker..."
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleCreateProject} disabled={!newProjectName.trim() || !newProjectDomain.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Proyecto
                </Button>
                <Button variant="outline" onClick={() => setShowNewProject(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard principal */}
        {currentProject && (
          <div className="space-y-6">
            {/* Métricas generales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Keywords Monitoreadas</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentProject.keywords.length}</div>
                  <p className="text-xs text-muted-foreground">
                    keywords activas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Posición Promedio</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(currentProject.keywords.reduce((acc, kw) => acc + kw.currentPosition, 0) / currentProject.keywords.length)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    posición media
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top 10</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentProject.keywords.filter(kw => kw.currentPosition <= 10).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    keywords en top 10
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentProject.keywords.reduce((acc, kw) => acc + kw.alerts.filter(a => a.enabled).length, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    alertas configuradas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de evolución */}
            <Card>
              <CardHeader>
                <CardTitle>Evolución de Rankings</CardTitle>
                <CardDescription>Tendencia de posiciones en el tiempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis 
                      domain={[1, 50]} 
                      reversed={true}
                      label={{ value: 'Posición', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        `Posición ${value}`, 
                        name === 'position' ? 'Ranking' : 'Visibilidad'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="position" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                    <ReferenceLine y={10} stroke="#10b981" strokeDasharray="5 5" label="Top 10" />
                    <ReferenceLine y={3} stroke="#f59e0b" strokeDasharray="5 5" label="Top 3" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Vista de keywords o competidores */}
            {viewMode === 'keywords' && (
              <Card>
                <CardHeader>
                  <CardTitle>Keywords Monitoreadas</CardTitle>
                  <CardDescription>Estado actual y tendencias de todas las keywords</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3">Keyword</th>
                          <th className="text-center py-3">Posición Actual</th>
                          <th className="text-center py-3">Cambio</th>
                          <th className="text-right py-3">Volumen</th>
                          <th className="text-right py-3">Dificultad</th>
                          <th className="text-center py-3">Mejor Posición</th>
                          <th className="text-center py-3">URL</th>
                          <th className="text-center py-3">Alertas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProject.keywords.map((keyword) => (
                          <tr key={keyword.id} className="border-b hover:bg-gray-50">
                            <td className="py-4">
                              <div>
                                <div className="font-medium">{keyword.keyword}</div>
                                <div className="flex gap-1 mt-1">
                                  {keyword.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="text-center py-4">
                              <Badge variant="outline" className={getPositionColor(keyword.currentPosition)}>
                                #{keyword.currentPosition}
                              </Badge>
                            </td>
                            <td className="text-center py-4">
                              <div className="flex items-center justify-center gap-1">
                                {getTrendIcon(keyword.currentPosition, keyword.previousPosition)}
                                <span className={`text-sm ${getTrendColor(keyword.currentPosition, keyword.previousPosition)}`}>
                                  {Math.abs(keyword.currentPosition - keyword.previousPosition)}
                                </span>
                              </div>
                            </td>
                            <td className="text-right py-4">{keyword.searchVolume.toLocaleString()}</td>
                            <td className="text-right py-4">
                              <Badge variant="outline" className={
                                keyword.difficulty > 70 ? 'text-red-600 bg-red-50' :
                                keyword.difficulty > 50 ? 'text-yellow-600 bg-yellow-50' :
                                'text-green-600 bg-green-50'
                              }>
                                {keyword.difficulty}%
                              </Badge>
                            </td>
                            <td className="text-center py-4">
                              <Badge variant="outline" className="text-green-600 bg-green-50">
                                #{keyword.bestPosition}
                              </Badge>
                            </td>
                            <td className="text-center py-4">
                              <a href={keyword.url} className="text-blue-600 hover:underline text-sm">
                                {keyword.url}
                              </a>
                            </td>
                            <td className="text-center py-4">
                              <div className="flex items-center justify-center gap-1">
                                <Bell className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{keyword.alerts.filter(a => a.enabled).length}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {viewMode === 'competitors' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Análisis de Competidores</CardTitle>
                    <CardDescription>Comparación de posiciones con competidores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockCompetitors.map((competitor, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{competitor.domain}</span>
                              {getCompetitorTrendIcon(competitor.trend)}
                            </div>
                            <Badge variant="outline" className={
                              competitor.visibility > 70 ? 'text-green-600 bg-green-50' :
                              competitor.visibility > 50 ? 'text-yellow-600 bg-yellow-50' :
                              'text-red-600 bg-red-50'
                            }>
                              {competitor.visibility}% visibilidad
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {competitor.avgPosition.toFixed(1)}
                              </div>
                              <div className="text-xs text-gray-600">Posición Promedio</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">
                                {competitor.keywords.length}
                              </div>
                              <div className="text-xs text-gray-600">Keywords Compartidas</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {competitor.keywords.map((kw, kwIndex) => (
                              <div key={kwIndex} className="flex items-center justify-between text-sm">
                                <span>{kw.keyword}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={getPositionColor(kw.position)}>
                                    #{kw.position}
                                  </Badge>
                                  {getTrendIcon(kw.position, kw.previousPosition)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Comparación de Visibilidad</CardTitle>
                    <CardDescription>Visibilidad promedio por competidor</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={competitorComparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="domain" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="visibility" fill="#3b82f6" name="Visibilidad %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {viewMode === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Posiciones</CardTitle>
                    <CardDescription>Posiciones actuales vs volumen de búsqueda</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={overviewData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="keyword" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="position" fill="#3b82f6" name="Posición Actual" />
                        <Bar dataKey="previousPosition" fill="#e5e7eb" name="Posición Anterior" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Alertas Recientes</CardTitle>
                    <CardDescription>Cambios importantes detectados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Mejora significativa</div>
                          <div className="text-xs text-gray-600">"seo tools" subió 4 posiciones (12 → 8)</div>
                        </div>
                        <Badge variant="outline" className="text-green-600 bg-green-50">
                          Hoy
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-yellow-600" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Mejora moderada</div>
                          <div className="text-xs text-gray-600">"keyword research" subió 3 posiciones (18 → 15)</div>
                        </div>
                        <Badge variant="outline" className="text-yellow-600 bg-yellow-50">
                          Ayer
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Caída detectada</div>
                          <div className="text-xs text-gray-600">"backlink checker" bajó 3 posiciones (19 → 22)</div>
                        </div>
                        <Badge variant="outline" className="text-red-600 bg-red-50">
                          2 días
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RankTracking;