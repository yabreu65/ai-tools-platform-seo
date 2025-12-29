'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle, 
  ExternalLink, 
  BarChart3, 
  Users, 
  Globe, 
  Clock,
  Bell,
  FileText,
  Eye,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  ArrowRight,
  Plus,
  Filter,
  Calendar,
  Download
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface DashboardStats {
  totalBacklinks: number;
  totalDomains: number;
  domainAuthority: number;
  toxicLinks: number;
  newBacklinks: number;
  lostBacklinks: number;
  opportunities: number;
  activeAlerts: number;
}

interface RecentActivity {
  id: string;
  type: 'new_backlink' | 'lost_backlink' | 'toxic_detected' | 'opportunity_found' | 'alert_triggered';
  domain: string;
  description: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  url?: string;
}

interface TopDomain {
  domain: string;
  backlinks: number;
  authority: number;
  traffic: number;
  change: number;
  status: 'healthy' | 'warning' | 'toxic';
}

interface AlertSummary {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'triggered' | 'paused';
  lastTriggered?: string;
  triggerCount: number;
}

export default function BacklinkCheckerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBacklinks: 0,
    totalDomains: 0,
    domainAuthority: 0,
    toxicLinks: 0,
    newBacklinks: 0,
    lostBacklinks: 0,
    opportunities: 0,
    activeAlerts: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topDomains, setTopDomains] = useState<TopDomain[]>([]);
  const [alertSummary, setAlertSummary] = useState<AlertSummary[]>([]);
  const [backlinkTrends, setBacklinkTrends] = useState<any[]>([]);
  const [authorityTrends, setAuthorityTrends] = useState<any[]>([]);
  const [anchorTextData, setAnchorTextData] = useState<any[]>([]);
  const [qualityDistribution, setQualityDistribution] = useState<any[]>([]);

  const [searchDomain, setSearchDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeframe]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simular carga de datos del dashboard
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Estadísticas principales
      setStats({
        totalBacklinks: 15847,
        totalDomains: 2341,
        domainAuthority: 68,
        toxicLinks: 23,
        newBacklinks: 156,
        lostBacklinks: 42,
        opportunities: 89,
        activeAlerts: 5
      });

      // Actividad reciente
      setRecentActivity([
        {
          id: '1',
          type: 'new_backlink',
          domain: 'techcrunch.com',
          description: 'Nuevo backlink de alta autoridad detectado',
          timestamp: '2024-01-20T10:30:00Z',
          severity: 'low',
          url: 'https://techcrunch.com/article-example'
        },
        {
          id: '2',
          type: 'toxic_detected',
          domain: 'spam-site.com',
          description: 'Enlace tóxico detectado - Requiere revisión',
          timestamp: '2024-01-20T09:15:00Z',
          severity: 'high'
        },
        {
          id: '3',
          type: 'opportunity_found',
          domain: 'industry-blog.com',
          description: 'Nueva oportunidad de link building identificada',
          timestamp: '2024-01-20T08:45:00Z',
          severity: 'medium'
        },
        {
          id: '4',
          type: 'alert_triggered',
          domain: 'ejemplo.com',
          description: 'Alerta: 10 nuevos backlinks en las últimas 24h',
          timestamp: '2024-01-20T07:00:00Z',
          severity: 'low'
        },
        {
          id: '5',
          type: 'lost_backlink',
          domain: 'news-site.com',
          description: 'Backlink perdido de sitio de noticias',
          timestamp: '2024-01-19T18:20:00Z',
          severity: 'medium'
        }
      ]);

      // Top dominios
      setTopDomains([
        {
          domain: 'wikipedia.org',
          backlinks: 1247,
          authority: 95,
          traffic: 850000,
          change: 12,
          status: 'healthy'
        },
        {
          domain: 'github.com',
          backlinks: 892,
          authority: 88,
          traffic: 420000,
          change: 8,
          status: 'healthy'
        },
        {
          domain: 'medium.com',
          backlinks: 634,
          authority: 82,
          traffic: 280000,
          change: -3,
          status: 'warning'
        },
        {
          domain: 'reddit.com',
          backlinks: 521,
          authority: 79,
          traffic: 650000,
          change: 15,
          status: 'healthy'
        },
        {
          domain: 'spam-directory.net',
          backlinks: 156,
          authority: 15,
          traffic: 1200,
          change: 45,
          status: 'toxic'
        }
      ]);

      // Resumen de alertas
      setAlertSummary([
        {
          id: '1',
          name: 'Nuevos Backlinks Importantes',
          domain: 'ejemplo.com',
          status: 'active',
          lastTriggered: '2024-01-20T07:00:00Z',
          triggerCount: 12
        },
        {
          id: '2',
          name: 'Enlaces Tóxicos Detectados',
          domain: 'ejemplo.com',
          status: 'triggered',
          lastTriggered: '2024-01-19T16:45:00Z',
          triggerCount: 3
        },
        {
          id: '3',
          name: 'Cambios de Autoridad',
          domain: 'sitio2.com',
          status: 'active',
          triggerCount: 0
        }
      ]);

      // Tendencias de backlinks
      const backlinkData = [];
      const authorityData = [];
      const days = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90;
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        backlinkData.push({
          date: date.toISOString().split('T')[0],
          total: 15000 + Math.floor(Math.random() * 1000),
          new: Math.floor(Math.random() * 50) + 10,
          lost: Math.floor(Math.random() * 20) + 5
        });

        authorityData.push({
          date: date.toISOString().split('T')[0],
          authority: 65 + Math.floor(Math.random() * 10),
          trustFlow: 45 + Math.floor(Math.random() * 15),
          citationFlow: 55 + Math.floor(Math.random() * 12)
        });
      }

      setBacklinkTrends(backlinkData);
      setAuthorityTrends(authorityData);

      // Distribución de anchor text
      setAnchorTextData([
        { name: 'Marca', value: 35, color: '#8884d8' },
        { name: 'Genérico', value: 25, color: '#82ca9d' },
        { name: 'Exacto', value: 20, color: '#ffc658' },
        { name: 'URL', value: 12, color: '#ff7300' },
        { name: 'Otros', value: 8, color: '#00ff88' }
      ]);

      // Distribución de calidad
      setQualityDistribution([
        { name: 'Excelente', value: 45, color: '#22c55e' },
        { name: 'Buena', value: 30, color: '#84cc16' },
        { name: 'Regular', value: 15, color: '#eab308' },
        { name: 'Mala', value: 7, color: '#f97316' },
        { name: 'Tóxica', value: 3, color: '#ef4444' }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAnalysis = async () => {
    if (!searchDomain.trim()) {
      toast.error('Por favor ingresa un dominio');
      return;
    }

    toast.success(`Iniciando análisis de ${searchDomain}...`);
    // Redirigir a la página de análisis con el dominio
    window.location.href = `/backlink-checker/analyze?domain=${encodeURIComponent(searchDomain)}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_backlink':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'lost_backlink':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'toxic_detected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'opportunity_found':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'alert_triggered':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'new_backlink': return 'Nuevo Backlink';
      case 'lost_backlink': return 'Backlink Perdido';
      case 'toxic_detected': return 'Enlace Tóxico';
      case 'opportunity_found': return 'Oportunidad';
      case 'alert_triggered': return 'Alerta';
      default: return type;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'toxic':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Activa</Badge>;
      case 'triggered':
        return <Badge variant="destructive">Activada</Badge>;
      case 'paused':
        return <Badge variant="secondary">Pausada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backlink Checker Dashboard</h1>
          <p className="text-muted-foreground">Monitorea y analiza tu perfil de backlinks</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
        </div>
      </div>

      {/* Análisis Rápido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Análisis Rápido
          </CardTitle>
          <CardDescription>
            Analiza rápidamente el perfil de backlinks de cualquier dominio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Ingresa un dominio (ej: ejemplo.com)"
                value={searchDomain}
                onChange={(e) => setSearchDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuickAnalysis()}
              />
            </div>
            <Button onClick={handleQuickAnalysis}>
              <Search className="h-4 w-4 mr-2" />
              Analizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ExternalLink className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Backlinks</p>
                <p className="text-2xl font-bold">{stats.totalBacklinks.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">+{stats.newBacklinks} nuevos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dominios Únicos</p>
                <p className="text-2xl font-bold">{stats.totalDomains.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs">
                  <BarChart3 className="h-3 w-3 text-blue-500" />
                  <span className="text-blue-600">DA: {stats.domainAuthority}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enlaces Tóxicos</p>
                <p className="text-2xl font-bold">{stats.toxicLinks}</p>
                <div className="flex items-center gap-1 text-xs">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span className="text-red-600">Requiere atención</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Oportunidades</p>
                <p className="text-2xl font-bold">{stats.opportunities}</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">Link building</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Herramientas Principales</CardTitle>
          <CardDescription>Accede rápidamente a las funcionalidades más utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/backlink-checker/analyze">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Análisis de Dominio</span>
                </div>
                <p className="text-sm text-muted-foreground">Analiza el perfil completo de backlinks</p>
              </div>
            </Link>

            <Link href="/backlink-checker/audit">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Auditoría Tóxica</span>
                </div>
                <p className="text-sm text-muted-foreground">Detecta enlaces tóxicos y spam</p>
              </div>
            </Link>

            <Link href="/backlink-checker/opportunities">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Oportunidades</span>
                </div>
                <p className="text-sm text-muted-foreground">Encuentra nuevas oportunidades de enlaces</p>
              </div>
            </Link>

            <Link href="/backlink-checker/monitoring">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Monitoreo</span>
                </div>
                <p className="text-sm text-muted-foreground">Monitorea cambios en tiempo real</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencias de Backlinks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendencias de Backlinks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={backlinkTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" stackId="1" stroke="#8884d8" fill="#8884d8" name="Total" />
                <Area type="monotone" dataKey="new" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Nuevos" />
                <Area type="monotone" dataKey="lost" stackId="3" stroke="#ffc658" fill="#ffc658" name="Perdidos" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Métricas de Autoridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Métricas de Autoridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={authorityTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="authority" stroke="#8884d8" name="Domain Authority" />
                <Line type="monotone" dataKey="trustFlow" stroke="#82ca9d" name="Trust Flow" />
                <Line type="monotone" dataKey="citationFlow" stroke="#ffc658" name="Citation Flow" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de Anchor Text */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Anchor Text</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={anchorTextData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {anchorTextData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de Calidad */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Calidad</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={qualityDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {qualityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad Reciente
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/backlink-checker/monitoring">
                  Ver todo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {getActivityTypeLabel(activity.type)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        {activity.domain}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      {activity.severity && (
                        <Badge variant="outline" className={`text-xs ${getSeverityColor(activity.severity)}`}>
                          {activity.severity}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {activity.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={activity.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Dominios Referentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Dominios Referentes
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/backlink-checker/analyze">
                  Ver análisis completo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDomains.map((domain, index) => (
                <div key={domain.domain} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      {getStatusIcon(domain.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{domain.domain}</span>
                        <Badge variant="outline" className="text-xs">
                          DA: {domain.authority}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {domain.backlinks.toLocaleString()} backlinks • {domain.traffic.toLocaleString()} tráfico
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 text-sm ${domain.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {domain.change >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>{domain.change >= 0 ? '+' : ''}{domain.change}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas Configuradas ({stats.activeAlerts})
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/backlink-checker/alerts">
                  Configurar alertas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertSummary.length > 0 ? (
            <div className="space-y-3">
              {alertSummary.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{alert.name}</span>
                        {getAlertStatusBadge(alert.status)}
                        <Badge variant="outline" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          {alert.domain}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Activada {alert.triggerCount} veces
                        {alert.lastTriggered && (
                          <span> • Última: {new Date(alert.lastTriggered).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay alertas configuradas
              </h3>
              <p className="text-gray-600 mb-4">
                Configura alertas para monitorear cambios importantes en tus backlinks
              </p>
              <Button asChild>
                <Link href="/backlink-checker/alerts">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera alerta
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Herramientas adicionales para gestionar tus backlinks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link href="/backlink-checker/disavow">
                <FileText className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Generar Disavow</div>
                  <div className="text-xs text-muted-foreground">Crear archivo de desautorización</div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
              <Link href="/backlink-checker/reports">
                <BarChart3 className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Generar Reporte</div>
                  <div className="text-xs text-muted-foreground">Crear reporte detallado</div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Exportar Datos</div>
                <div className="text-xs text-muted-foreground">Descargar en CSV/Excel</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}