'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Monitor, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  Bell, 
  Mail, 
  Smartphone,
  Download,
  Filter,
  Calendar,
  Activity,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface MonitoringSetupRequest {
  domain: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  alertThreshold: number;
  trackTypes: string[];
  notifications: {
    email: boolean;
    webhook: boolean;
    emailAddress?: string;
    webhookUrl?: string;
  };
}

interface MonitoringSetupResponse {
  success: boolean;
  data?: {
    monitoringId: string;
    domain: string;
    status: 'active' | 'paused' | 'error';
    nextCheck: string;
    estimatedCrawlTime: number;
    currentMetrics: {
      totalBacklinks: number;
      referringDomains: number;
      domainAuthority: number;
      trustFlow: number;
    };
  };
  message?: string;
}

interface BacklinkChange {
  id: string;
  type: 'gained' | 'lost';
  domain: string;
  url: string;
  anchorText: string;
  domainAuthority: number;
  pageAuthority: number;
  firstSeen: string;
  lastSeen?: string;
  status: 'new' | 'verified' | 'lost';
}

interface MonitoringData {
  domain: string;
  status: 'active' | 'paused' | 'error';
  lastCheck: string;
  nextCheck: string;
  recentAlerts: Array<{
    id: string;
    type: 'gain' | 'loss' | 'toxic' | 'authority_drop';
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  trends: {
    backlinks: Array<{ date: string; count: number }>;
    authority: Array<{ date: string; da: number; tf: number }>;
  };
  topGainedDomains: Array<{
    domain: string;
    count: number;
    avgAuthority: number;
  }>;
  topLostDomains: Array<{
    domain: string;
    count: number;
    avgAuthority: number;
  }>;
  recentChanges: BacklinkChange[];
}

export default function BacklinkMonitoringPage() {
  const [domain, setDomain] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [alertThreshold, setAlertThreshold] = useState(10);
  const [trackTypes, setTrackTypes] = useState<string[]>(['new_backlinks', 'lost_backlinks']);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [webhookNotifications, setWebhookNotifications] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'gained' | 'lost'>('all');
  const [filterDate, setFilterDate] = useState<'all' | '7d' | '30d' | '90d'>('30d');

  // Cargar configuración existente al montar el componente
  useEffect(() => {
    loadExistingMonitoring();
  }, []);

  const loadExistingMonitoring = async () => {
    try {
      const response = await fetch('/api/backlink-checker/monitoring/setup');
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        const config = result.data[0]; // Tomar la primera configuración
        setDomain(config.domain);
        setFrequency(config.frequency);
        setAlertThreshold(config.alertThreshold);
        setTrackTypes(config.trackTypes);
        setEmailNotifications(config.notifications.email);
        setWebhookNotifications(config.notifications.webhook);
        setEmailAddress(config.notifications.emailAddress || '');
        setWebhookUrl(config.notifications.webhookUrl || '');
        
        // Simular datos de monitoreo
        loadMonitoringData(config.domain);
      }
    } catch (error) {
      console.error('Error loading existing monitoring:', error);
    }
  };

  const loadMonitoringData = (monitoredDomain: string) => {
    // Simular datos de monitoreo
    const mockData: MonitoringData = {
      domain: monitoredDomain,
      status: 'active',
      lastCheck: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      nextCheck: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      recentAlerts: [
        {
          id: '1',
          type: 'gain',
          message: '5 nuevos backlinks de alta autoridad detectados',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          severity: 'medium'
        },
        {
          id: '2',
          type: 'toxic',
          message: '2 backlinks tóxicos detectados',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          severity: 'high'
        },
        {
          id: '3',
          type: 'loss',
          message: '3 backlinks perdidos',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          severity: 'low'
        }
      ],
      trends: {
        backlinks: [
          { date: '2024-01-01', count: 1250 },
          { date: '2024-01-08', count: 1267 },
          { date: '2024-01-15', count: 1245 },
          { date: '2024-01-22', count: 1289 },
          { date: '2024-01-29', count: 1312 }
        ],
        authority: [
          { date: '2024-01-01', da: 65, tf: 58 },
          { date: '2024-01-08', da: 66, tf: 59 },
          { date: '2024-01-15', da: 65, tf: 58 },
          { date: '2024-01-22', da: 67, tf: 60 },
          { date: '2024-01-29', da: 68, tf: 61 }
        ]
      },
      topGainedDomains: [
        { domain: 'techcrunch.com', count: 3, avgAuthority: 92 },
        { domain: 'mashable.com', count: 2, avgAuthority: 78 },
        { domain: 'venturebeat.com', count: 2, avgAuthority: 82 }
      ],
      topLostDomains: [
        { domain: 'old-blog.com', count: 2, avgAuthority: 45 },
        { domain: 'expired-site.net', count: 1, avgAuthority: 38 }
      ],
      recentChanges: [
        {
          id: '1',
          type: 'gained',
          domain: 'techcrunch.com',
          url: 'https://techcrunch.com/article-123',
          anchorText: 'innovative solution',
          domainAuthority: 92,
          pageAuthority: 78,
          firstSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'verified'
        },
        {
          id: '2',
          type: 'gained',
          domain: 'mashable.com',
          url: 'https://mashable.com/review-456',
          anchorText: 'best tool',
          domainAuthority: 78,
          pageAuthority: 65,
          firstSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'new'
        },
        {
          id: '3',
          type: 'lost',
          domain: 'old-blog.com',
          url: 'https://old-blog.com/post-789',
          anchorText: 'check this out',
          domainAuthority: 45,
          pageAuthority: 42,
          firstSeen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastSeen: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'lost'
        }
      ]
    };
    
    setMonitoringData(mockData);
  };

  const handleSetupMonitoring = async () => {
    if (!domain) {
      toast.error('Por favor ingresa un dominio');
      return;
    }

    if (emailNotifications && !emailAddress) {
      toast.error('Por favor ingresa un email para las notificaciones');
      return;
    }

    if (webhookNotifications && !webhookUrl) {
      toast.error('Por favor ingresa una URL de webhook');
      return;
    }

    setIsSettingUp(true);
    
    try {
      const requestData: MonitoringSetupRequest = {
        domain,
        frequency,
        alertThreshold,
        trackTypes,
        notifications: {
          email: emailNotifications,
          webhook: webhookNotifications,
          emailAddress: emailNotifications ? emailAddress : undefined,
          webhookUrl: webhookNotifications ? webhookUrl : undefined,
        }
      };

      const response = await fetch('/api/backlink-checker/monitoring/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result: MonitoringSetupResponse = await response.json();

      if (result.success && result.data) {
        toast.success('Monitoreo configurado exitosamente');
        loadMonitoringData(domain);
      } else {
        toast.error(result.message || 'Error al configurar el monitoreo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al configurar el monitoreo');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleTrackTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setTrackTypes([...trackTypes, type]);
    } else {
      setTrackTypes(trackTypes.filter(t => t !== type));
    }
  };

  const filteredChanges = monitoringData?.recentChanges.filter(change => {
    const typeMatch = filterType === 'all' || change.type === filterType;
    
    let dateMatch = true;
    if (filterDate !== 'all') {
      const days = parseInt(filterDate.replace('d', ''));
      const changeDate = new Date(change.firstSeen);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      dateMatch = changeDate >= cutoffDate;
    }
    
    return typeMatch && dateMatch;
  }) || [];

  const exportChanges = () => {
    if (!filteredChanges.length) {
      toast.error('No hay cambios para exportar');
      return;
    }

    const csvContent = [
      'Type,Domain,URL,Anchor Text,DA,PA,First Seen,Status',
      ...filteredChanges.map(change => 
        `${change.type},${change.domain},${change.url},"${change.anchorText}",${change.domainAuthority},${change.pageAuthority},${change.firstSeen},${change.status}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backlink-changes-${domain}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`${filteredChanges.length} cambios exportados`);
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChangeTypeColor = (type: string) => {
    return type === 'gained' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoreo de Backlinks</h1>
          <p className="text-muted-foreground">Configura y monitorea cambios en tu perfil de backlinks</p>
        </div>
      </div>

      {/* Configuración de Monitoreo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Monitoreo
          </CardTitle>
          <CardDescription>
            Configura cómo quieres monitorear los cambios en tus backlinks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="domain">Dominio a Monitorear</Label>
                <Input
                  id="domain"
                  placeholder="ejemplo.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="frequency">Frecuencia de Monitoreo</Label>
                <select 
                  id="frequency"
                  value={frequency} 
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>

              <div>
                <Label htmlFor="threshold">Umbral de Alerta (cambios)</Label>
                <Input
                  id="threshold"
                  type="number"
                  min="1"
                  max="100"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recibir alerta cuando haya más de {alertThreshold} cambios
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Tipos de Backlinks a Rastrear</Label>
                <div className="space-y-2 mt-2">
                  {[
                    { id: 'new_backlinks', label: 'Nuevos Backlinks' },
                    { id: 'lost_backlinks', label: 'Backlinks Perdidos' },
                    { id: 'toxic_backlinks', label: 'Backlinks Tóxicos' },
                    { id: 'authority_changes', label: 'Cambios de Autoridad' }
                  ].map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Switch
                        checked={trackTypes.includes(type.id)}
                        onCheckedChange={(checked) => handleTrackTypeChange(type.id, checked)}
                      />
                      <Label>{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Preferencias de Notificación</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                    <Mail className="h-4 w-4" />
                    <Label>Notificaciones por Email</Label>
                  </div>
                  {emailNotifications && (
                    <Input
                      placeholder="tu-email@ejemplo.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                    />
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={webhookNotifications}
                      onCheckedChange={setWebhookNotifications}
                    />
                    <Bell className="h-4 w-4" />
                    <Label>Webhook</Label>
                  </div>
                  {webhookNotifications && (
                    <Input
                      placeholder="https://tu-webhook.com/endpoint"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSetupMonitoring} 
            disabled={isSettingUp || !domain}
            className="w-full"
          >
            {isSettingUp ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Configurando monitoreo...
              </>
            ) : (
              <>
                <Monitor className="h-4 w-4 mr-2" />
                {monitoringData ? 'Actualizar Configuración' : 'Iniciar Monitoreo'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Dashboard de Monitoreo */}
      {monitoringData && (
        <>
          {/* Estado del Monitoreo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Activity className={`h-4 w-4 ${monitoringData.status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm font-medium">
                    {monitoringData.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Estado del monitoreo</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-lg font-bold">{monitoringData.recentAlerts.length}</div>
                <p className="text-xs text-muted-foreground">Alertas recientes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-lg font-bold">
                  {new Date(monitoringData.lastCheck).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">Última verificación</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-lg font-bold">
                  {new Date(monitoringData.nextCheck).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">Próxima verificación</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs de Contenido */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="trends">Tendencias</TabsTrigger>
              <TabsTrigger value="changes">Cambios</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Dominios que Más Enlaces Ganaron
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {monitoringData.topGainedDomains.map((domain, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{domain.domain}</div>
                            <div className="text-sm text-muted-foreground">
                              DA promedio: {domain.avgAuthority}
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            +{domain.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      Dominios que Más Enlaces Perdieron
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {monitoringData.topLostDomains.map((domain, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{domain.domain}</div>
                            <div className="text-sm text-muted-foreground">
                              DA promedio: {domain.avgAuthority}
                            </div>
                          </div>
                          <Badge className="bg-red-100 text-red-800">
                            -{domain.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tendencia de Backlinks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monitoringData.trends.backlinks}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tendencia de Autoridad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monitoringData.trends.authority}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="da" stroke="#10b981" strokeWidth={2} name="Domain Authority" />
                        <Line type="monotone" dataKey="tf" stroke="#f59e0b" strokeWidth={2} name="Trust Flow" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="changes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Cambios Recientes ({filteredChanges.length})</span>
                    <div className="flex gap-2">
                      <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="px-3 py-1 border rounded-md text-sm"
                      >
                        <option value="all">Todos los cambios</option>
                        <option value="gained">Enlaces ganados</option>
                        <option value="lost">Enlaces perdidos</option>
                      </select>
                      <select 
                        value={filterDate} 
                        onChange={(e) => setFilterDate(e.target.value as any)}
                        className="px-3 py-1 border rounded-md text-sm"
                      >
                        <option value="all">Todo el tiempo</option>
                        <option value="7d">Últimos 7 días</option>
                        <option value="30d">Últimos 30 días</option>
                        <option value="90d">Últimos 90 días</option>
                      </select>
                      <Button onClick={exportChanges} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredChanges.slice(0, 20).map((change) => (
                      <div key={change.id} className="flex items-start gap-3 p-4 border rounded-lg">
                        <Badge className={getChangeTypeColor(change.type)}>
                          {change.type === 'gained' ? 'Ganado' : 'Perdido'}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <a 
                              href={change.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:underline truncate"
                            >
                              {change.domain}
                            </a>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Anchor text: "{change.anchorText}"
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>DA: {change.domainAuthority}</span>
                            <span>PA: {change.pageAuthority}</span>
                            <span>
                              {change.type === 'gained' ? 'Detectado' : 'Perdido'}: {' '}
                              {new Date(change.type === 'gained' ? change.firstSeen : change.lastSeen!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {change.status === 'new' ? 'Nuevo' : 
                           change.status === 'verified' ? 'Verificado' : 'Perdido'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Alertas Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monitoringData.recentAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start gap-3 p-4 border rounded-lg">
                        <Badge className={getAlertSeverityColor(alert.severity)}>
                          {alert.severity === 'high' ? 'Alta' : 
                           alert.severity === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {alert.type === 'gain' ? 'Ganancia' :
                           alert.type === 'loss' ? 'Pérdida' :
                           alert.type === 'toxic' ? 'Tóxico' : 'Autoridad'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}