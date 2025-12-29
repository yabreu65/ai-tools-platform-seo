'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Link as LinkIcon, 
  FileText, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  BarChart3,
  Globe,
  Search,
  Zap,
  Eye,
  Calendar,
  Filter,
  Download,
  Share2,
  ArrowLeft,
  ExternalLink,
  Users,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Interfaces
interface AlertCondition {
  metric: string;
  operator: string;
  value: number;
  threshold?: number;
}

interface Alert {
  id: string;
  name: string;
  type: 'keyword-ranking' | 'backlinks' | 'content' | 'technical' | 'traffic' | 'competitor';
  description: string;
  conditions: AlertCondition;
  frequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  channels: string[];
  domains: string[];
  keywords?: string[];
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface AlertHistory {
  id: string;
  alertId: string;
  alertName: string;
  type: string;
  message: string;
  triggeredAt: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  data: any;
  acknowledged: boolean;
}

const AlertsConfiguration = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [selectedTab, setSelectedTab] = useState('active');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    name: '',
    type: 'keyword-ranking',
    description: '',
    conditions: {
      metric: 'ranking-change',
      operator: 'decreases',
      value: 5,
      threshold: 10
    },
    frequency: 'daily',
    channels: ['email'],
    domains: [''],
    keywords: [''],
    isActive: true,
    priority: 'medium'
  });

  // Mock data para alertas existentes
  const mockAlerts: Alert[] = [
    {
      id: 'alert_001',
      name: 'Caída en Rankings Principales',
      type: 'keyword-ranking',
      description: 'Alerta cuando las keywords principales bajan más de 5 posiciones',
      conditions: {
        metric: 'ranking-change',
        operator: 'decreases',
        value: 5
      },
      frequency: 'daily',
      channels: ['email', 'slack'],
      domains: ['competitor1.com', 'competitor2.com'],
      keywords: ['seo tools', 'competitor analysis', 'keyword research'],
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      lastTriggered: '2024-01-20T14:22:00Z',
      triggerCount: 12,
      priority: 'high'
    },
    {
      id: 'alert_002',
      name: 'Nuevos Backlinks Competidores',
      type: 'backlinks',
      description: 'Notificar cuando competidores obtienen backlinks de alta calidad',
      conditions: {
        metric: 'new-backlinks',
        operator: 'increases',
        value: 10,
        threshold: 70
      },
      frequency: 'daily',
      channels: ['email', 'webhook'],
      domains: ['competitor1.com'],
      isActive: true,
      createdAt: '2024-01-10T09:15:00Z',
      lastTriggered: '2024-01-19T11:45:00Z',
      triggerCount: 8,
      priority: 'medium'
    },
    {
      id: 'alert_003',
      name: 'Contenido Nuevo Competidores',
      type: 'content',
      description: 'Detectar cuando competidores publican contenido nuevo',
      conditions: {
        metric: 'new-pages',
        operator: 'increases',
        value: 1
      },
      frequency: 'weekly',
      channels: ['email'],
      domains: ['competitor1.com', 'competitor2.com'],
      isActive: false,
      createdAt: '2024-01-05T16:20:00Z',
      triggerCount: 3,
      priority: 'low'
    },
    {
      id: 'alert_004',
      name: 'Cambios Técnicos Críticos',
      type: 'technical',
      description: 'Alerta sobre cambios técnicos que afecten el SEO',
      conditions: {
        metric: 'technical-score',
        operator: 'decreases',
        value: 10
      },
      frequency: 'real-time',
      channels: ['email', 'sms', 'slack'],
      domains: ['competitor1.com'],
      isActive: true,
      createdAt: '2024-01-12T13:10:00Z',
      lastTriggered: '2024-01-18T09:30:00Z',
      triggerCount: 5,
      priority: 'critical'
    }
  ];

  // Mock data para historial de alertas
  const mockAlertHistory: AlertHistory[] = [
    {
      id: 'history_001',
      alertId: 'alert_001',
      alertName: 'Caída en Rankings Principales',
      type: 'keyword-ranking',
      message: 'La keyword "seo tools" bajó 7 posiciones (de #3 a #10) en competitor1.com',
      triggeredAt: '2024-01-20T14:22:00Z',
      severity: 'warning',
      data: {
        keyword: 'seo tools',
        oldPosition: 3,
        newPosition: 10,
        domain: 'competitor1.com',
        change: -7
      },
      acknowledged: true
    },
    {
      id: 'history_002',
      alertId: 'alert_002',
      alertName: 'Nuevos Backlinks Competidores',
      type: 'backlinks',
      message: 'competitor1.com obtuvo 15 nuevos backlinks de alta calidad (DR>70)',
      triggeredAt: '2024-01-19T11:45:00Z',
      severity: 'info',
      data: {
        domain: 'competitor1.com',
        newBacklinks: 15,
        averageDR: 78,
        topDomains: ['authority-site.com', 'industry-leader.com']
      },
      acknowledged: false
    },
    {
      id: 'history_003',
      alertId: 'alert_004',
      alertName: 'Cambios Técnicos Críticos',
      type: 'technical',
      message: 'competitor1.com experimentó una caída crítica en el score técnico (-15 puntos)',
      triggeredAt: '2024-01-18T09:30:00Z',
      severity: 'critical',
      data: {
        domain: 'competitor1.com',
        oldScore: 92,
        newScore: 77,
        issues: ['Core Web Vitals', 'Mobile Usability', 'Page Speed']
      },
      acknowledged: true
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setAlerts(mockAlerts);
      setAlertHistory(mockAlertHistory);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateAlert = async () => {
    try {
      const alertData = {
        ...newAlert,
        id: `alert_${Date.now()}`,
        createdAt: new Date().toISOString(),
        triggerCount: 0
      } as Alert;

      setAlerts(prev => [...prev, alertData]);
      setShowCreateForm(false);
      setNewAlert({
        name: '',
        type: 'keyword-ranking',
        description: '',
        conditions: {
          metric: 'ranking-change',
          operator: 'decreases',
          value: 5,
          threshold: 10
        },
        frequency: 'daily',
        channels: ['email'],
        domains: [''],
        keywords: [''],
        isActive: true,
        priority: 'medium'
      });
      
      toast.success('Alerta creada exitosamente');
    } catch (error) {
      toast.error('Error al crear la alerta');
    }
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, isActive: !alert.isActive }
        : alert
    ));
    toast.success('Estado de alerta actualizado');
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast.success('Alerta eliminada');
  };

  const handleAcknowledgeAlert = (historyId: string) => {
    setAlertHistory(prev => prev.map(item =>
      item.id === historyId
        ? { ...item, acknowledged: true }
        : item
    ));
    toast.success('Alerta marcada como vista');
  };

  const getAlertTypeIcon = (type: string) => {
     switch (type) {
       case 'keyword-ranking': return <Search className="h-4 w-4" />;
       case 'backlinks': return <LinkIcon className="h-4 w-4" />;
       case 'content': return <FileText className="h-4 w-4" />;
       case 'technical': return <Settings className="h-4 w-4" />;
       case 'traffic': return <BarChart3 className="h-4 w-4" />;
       case 'competitor': return <Users className="h-4 w-4" />;
       default: return <Bell className="h-4 w-4" />;
     }
   };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'error': return 'bg-red-400';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterType !== 'all' && alert.type !== filterType) return false;
    if (filterStatus === 'active' && !alert.isActive) return false;
    if (filterStatus === 'inactive' && alert.isActive) return false;
    return true;
  });

  const unacknowledgedCount = alertHistory.filter(item => !item.acknowledged).length;

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando sistema de alertas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/competitor-analysis">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Bell className="h-8 w-8 mr-3 text-blue-600" />
              Sistema de Alertas
            </h1>
            <p className="text-gray-600">
              Configura alertas automáticas para monitorear cambios en la competencia
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Alerta
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alerts.filter(a => a.isActive).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {alerts.length} total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sin Revisar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {unacknowledgedCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                Requieren atención
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activaciones Hoy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alertHistory.filter(h => 
                    new Date(h.triggeredAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                Últimas 24h
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cobertura</p>
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(alerts.flatMap(a => a.domains))].length}
                </p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Dominios monitoreados
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Alertas Activas</TabsTrigger>
          <TabsTrigger value="history">
            Historial
            {unacknowledgedCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {unacknowledgedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Active Alerts Tab */}
        <TabsContent value="active" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">Filtros:</Label>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo de alerta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="keyword-ranking">Keywords</SelectItem>
                    <SelectItem value="backlinks">Backlinks</SelectItem>
                    <SelectItem value="content">Contenido</SelectItem>
                    <SelectItem value="technical">Técnico</SelectItem>
                    <SelectItem value="traffic">Tráfico</SelectItem>
                    <SelectItem value="competitor">Competidores</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="active">Activas</SelectItem>
                    <SelectItem value="inactive">Inactivas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Alerts List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getAlertTypeIcon(alert.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{alert.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(alert.priority)}>
                            {alert.priority}
                          </Badge>
                          <Badge variant="outline">
                            {alert.frequency}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={alert.isActive}
                      onCheckedChange={() => handleToggleAlert(alert.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{alert.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Condición:</span>
                      <span className="font-medium">
                        {alert.conditions.metric} {alert.conditions.operator} {alert.conditions.value}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Canales:</span>
                      <div className="flex space-x-1">
                        {alert.channels.map((channel, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Activaciones:</span>
                      <span className="font-medium">{alert.triggerCount}</span>
                    </div>
                    {alert.lastTriggered && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Última activación:</span>
                        <span className="font-medium">
                          {new Date(alert.lastTriggered).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.domains.length} dominio(s)
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAlerts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay alertas configuradas
                </h3>
                <p className="text-gray-600 mb-4">
                  Crea tu primera alerta para comenzar a monitorear la competencia
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Alerta
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Historial de Alertas
              </CardTitle>
              <CardDescription>
                Registro de todas las alertas activadas recientemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-4 border rounded-lg ${
                      item.acknowledged ? 'bg-gray-50' : 'bg-white border-l-4 border-l-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getSeverityColor(item.severity)}`}></div>
                          <h4 className="font-medium">{item.alertName}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(item.triggeredAt).toLocaleString('es-ES')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{item.message}</p>
                        
                        {/* Data details */}
                        {item.data && (
                          <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                            <pre>{JSON.stringify(item.data, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!item.acknowledged && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAcknowledgeAlert(item.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar como vista
                          </Button>
                        )}
                        {item.acknowledged && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Vista
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Canales de Notificación
                </CardTitle>
                <CardDescription>
                  Configura cómo quieres recibir las alertas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">usuario@ejemplo.com</p>
                    </div>
                  </div>
                  <Switch checked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Slack</p>
                      <p className="text-sm text-gray-600">#seo-alerts</p>
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">SMS</p>
                      <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Webhook</p>
                      <p className="text-sm text-gray-600">https://api.ejemplo.com/webhook</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Alert Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Preferencias Generales
                </CardTitle>
                <CardDescription>
                  Configuración global del sistema de alertas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Zona Horaria</Label>
                  <Select defaultValue="america/mexico_city">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america/mexico_city">América/Ciudad de México</SelectItem>
                      <SelectItem value="america/new_york">América/Nueva York</SelectItem>
                      <SelectItem value="europe/madrid">Europa/Madrid</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Frecuencia Máxima de Alertas</Label>
                  <Select defaultValue="hourly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real-time">Tiempo Real</SelectItem>
                      <SelectItem value="hourly">Cada Hora</SelectItem>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas Nocturnas</p>
                    <p className="text-sm text-gray-600">Recibir alertas entre 10 PM y 6 AM</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Resumen Diario</p>
                    <p className="text-sm text-gray-600">Enviar resumen de actividad diaria</p>
                  </div>
                  <Switch checked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas de Mantenimiento</p>
                    <p className="text-sm text-gray-600">Notificar sobre actualizaciones del sistema</p>
                  </div>
                  <Switch checked={true} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Alert Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Crear Nueva Alerta</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de la Alerta</Label>
                  <Input
                    value={newAlert.name}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Caída en rankings principales"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo de Alerta</Label>
                  <Select 
                    value={newAlert.type} 
                    onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keyword-ranking">Keywords & Rankings</SelectItem>
                      <SelectItem value="backlinks">Backlinks</SelectItem>
                      <SelectItem value="content">Contenido</SelectItem>
                      <SelectItem value="technical">Técnico</SelectItem>
                      <SelectItem value="traffic">Tráfico</SelectItem>
                      <SelectItem value="competitor">Competidores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={newAlert.description}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe qué monitorea esta alerta..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Métrica</Label>
                  <Select 
                    value={newAlert.conditions?.metric} 
                    onValueChange={(value) => setNewAlert(prev => ({ 
                      ...prev, 
                      conditions: { ...prev.conditions!, metric: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ranking-change">Cambio en Ranking</SelectItem>
                      <SelectItem value="new-backlinks">Nuevos Backlinks</SelectItem>
                      <SelectItem value="new-pages">Páginas Nuevas</SelectItem>
                      <SelectItem value="technical-score">Score Técnico</SelectItem>
                      <SelectItem value="traffic-change">Cambio en Tráfico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Operador</Label>
                  <Select 
                    value={newAlert.conditions?.operator} 
                    onValueChange={(value) => setNewAlert(prev => ({ 
                      ...prev, 
                      conditions: { ...prev.conditions!, operator: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increases">Aumenta</SelectItem>
                      <SelectItem value="decreases">Disminuye</SelectItem>
                      <SelectItem value="equals">Igual a</SelectItem>
                      <SelectItem value="greater_than">Mayor que</SelectItem>
                      <SelectItem value="less_than">Menor que</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    value={newAlert.conditions?.value}
                    onChange={(e) => setNewAlert(prev => ({ 
                      ...prev, 
                      conditions: { ...prev.conditions!, value: parseInt(e.target.value) }
                    }))}
                    placeholder="5"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frecuencia</Label>
                  <Select 
                    value={newAlert.frequency} 
                    onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real-time">Tiempo Real</SelectItem>
                      <SelectItem value="hourly">Cada Hora</SelectItem>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Prioridad</Label>
                  <Select 
                    value={newAlert.priority} 
                    onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Dominios a Monitorear</Label>
                <Textarea
                  value={newAlert.domains?.join('\n')}
                  onChange={(e) => setNewAlert(prev => ({ 
                    ...prev, 
                    domains: e.target.value.split('\n').filter(d => d.trim())
                  }))}
                  placeholder="competitor1.com&#10;competitor2.com"
                  rows={3}
                />
              </div>
              
              {newAlert.type === 'keyword-ranking' && (
                <div className="space-y-2">
                  <Label>Keywords (opcional)</Label>
                  <Textarea
                    value={newAlert.keywords?.join('\n')}
                    onChange={(e) => setNewAlert(prev => ({ 
                      ...prev, 
                      keywords: e.target.value.split('\n').filter(k => k.trim())
                    }))}
                    placeholder="seo tools&#10;competitor analysis&#10;keyword research"
                    rows={3}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Canales de Notificación</Label>
                <div className="flex flex-wrap gap-2">
                  {['email', 'slack', 'sms', 'webhook'].map((channel) => (
                    <div key={channel} className="flex items-center space-x-2">
                      <Checkbox
                        checked={newAlert.channels?.includes(channel)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewAlert(prev => ({ 
                              ...prev, 
                              channels: [...(prev.channels || []), channel]
                            }));
                          } else {
                            setNewAlert(prev => ({ 
                              ...prev, 
                              channels: prev.channels?.filter(c => c !== channel)
                            }));
                          }
                        }}
                      />
                      <Label className="capitalize">{channel}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newAlert.isActive}
                  onCheckedChange={(checked) => setNewAlert(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>Activar alerta inmediatamente</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateAlert}
                disabled={!newAlert.name || !newAlert.description}
              >
                Crear Alerta
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsConfiguration;