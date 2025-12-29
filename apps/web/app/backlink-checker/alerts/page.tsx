'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Mail,
  Smartphone,
  Slack,
  Webhook,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Eye,
  BarChart3,
  ExternalLink,
  Shield,
  Target,
  Zap,
  Calendar,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface Alert {
  id: string;
  name: string;
  description: string;
  domain: string;
  type: 'new_backlinks' | 'lost_backlinks' | 'toxic_links' | 'domain_authority' | 'competitor_activity';
  conditions: {
    threshold?: number;
    operator?: 'greater_than' | 'less_than' | 'equals' | 'percentage_change';
    timeframe?: 'daily' | 'weekly' | 'monthly';
    comparison?: 'previous_period' | 'baseline';
  };
  notifications: {
    email: boolean;
    sms: boolean;
    slack: boolean;
    webhook: boolean;
  };
  recipients: string[];
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface AlertHistory {
  id: string;
  alertId: string;
  alertName: string;
  triggeredAt: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  acknowledged: boolean;
}

const AlertConfiguration = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'Nuevos Backlinks Detectados',
      description: 'Notificar cuando se detecten más de 10 nuevos backlinks en un día',
      domain: 'ejemplo.com',
      type: 'new_backlinks',
      conditions: {
        threshold: 10,
        operator: 'greater_than',
        timeframe: 'daily'
      },
      notifications: {
        email: true,
        sms: false,
        slack: true,
        webhook: false
      },
      recipients: ['admin@ejemplo.com'],
      isActive: true,
      createdAt: '2024-01-10T10:00:00Z',
      lastTriggered: '2024-01-15T14:30:00Z',
      triggerCount: 5
    },
    {
      id: '2',
      name: 'Enlaces Tóxicos Críticos',
      description: 'Alerta inmediata cuando se detecten enlaces con score tóxico > 80',
      domain: 'ejemplo.com',
      type: 'toxic_links',
      conditions: {
        threshold: 80,
        operator: 'greater_than',
        timeframe: 'daily'
      },
      notifications: {
        email: true,
        sms: true,
        slack: true,
        webhook: true
      },
      recipients: ['admin@ejemplo.com', 'seo@ejemplo.com'],
      isActive: true,
      createdAt: '2024-01-08T09:00:00Z',
      triggerCount: 2
    },
    {
      id: '3',
      name: 'Caída de Autoridad de Dominio',
      description: 'Notificar si la autoridad de dominio baja más del 5%',
      domain: 'ejemplo.com',
      type: 'domain_authority',
      conditions: {
        threshold: 5,
        operator: 'greater_than',
        timeframe: 'weekly',
        comparison: 'previous_period'
      },
      notifications: {
        email: true,
        sms: false,
        slack: false,
        webhook: false
      },
      recipients: ['director@ejemplo.com'],
      isActive: false,
      createdAt: '2024-01-05T16:00:00Z',
      triggerCount: 0
    }
  ]);

  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([
    {
      id: '1',
      alertId: '1',
      alertName: 'Nuevos Backlinks Detectados',
      triggeredAt: '2024-01-15T14:30:00Z',
      message: '15 nuevos backlinks detectados para ejemplo.com',
      severity: 'medium',
      data: { newBacklinks: 15, domains: 8 },
      acknowledged: true
    },
    {
      id: '2',
      alertId: '2',
      alertName: 'Enlaces Tóxicos Críticos',
      triggeredAt: '2024-01-14T11:20:00Z',
      message: 'Detectado enlace tóxico con score 85 desde spam-domain.net',
      severity: 'high',
      data: { toxicScore: 85, domain: 'spam-domain.net' },
      acknowledged: false
    },
    {
      id: '3',
      alertId: '1',
      alertName: 'Nuevos Backlinks Detectados',
      triggeredAt: '2024-01-12T09:15:00Z',
      message: '12 nuevos backlinks detectados para ejemplo.com',
      severity: 'low',
      data: { newBacklinks: 12, domains: 6 },
      acknowledged: true
    }
  ]);

  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    name: '',
    description: '',
    domain: '',
    type: 'new_backlinks',
    conditions: {
      threshold: 10,
      operator: 'greater_than',
      timeframe: 'daily'
    },
    notifications: {
      email: true,
      sms: false,
      slack: false,
      webhook: false
    },
    recipients: [],
    isActive: true
  });

  const [newRecipient, setNewRecipient] = useState('');

  const alertTypes = {
    new_backlinks: {
      name: 'Nuevos Backlinks',
      description: 'Detectar cuando se ganen nuevos backlinks',
      icon: <ExternalLink className="h-4 w-4" />,
      color: 'text-green-600'
    },
    lost_backlinks: {
      name: 'Backlinks Perdidos',
      description: 'Detectar cuando se pierdan backlinks existentes',
      icon: <TrendingDown className="h-4 w-4" />,
      color: 'text-red-600'
    },
    toxic_links: {
      name: 'Enlaces Tóxicos',
      description: 'Detectar enlaces de baja calidad o spam',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-orange-600'
    },
    domain_authority: {
      name: 'Autoridad de Dominio',
      description: 'Monitorear cambios en métricas de autoridad',
      icon: <Shield className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    competitor_activity: {
      name: 'Actividad de Competidores',
      description: 'Monitorear backlinks de la competencia',
      icon: <Target className="h-4 w-4" />,
      color: 'text-purple-600'
    }
  };

  const createAlert = () => {
    if (!newAlert.name || !newAlert.domain || !newAlert.description) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const alert: Alert = {
      id: Date.now().toString(),
      name: newAlert.name!,
      description: newAlert.description!,
      domain: newAlert.domain!,
      type: newAlert.type!,
      conditions: newAlert.conditions!,
      notifications: newAlert.notifications!,
      recipients: newAlert.recipients!,
      isActive: newAlert.isActive!,
      createdAt: new Date().toISOString(),
      triggerCount: 0
    };

    setAlerts(prev => [alert, ...prev]);
    setNewAlert({
      name: '',
      description: '',
      domain: '',
      type: 'new_backlinks',
      conditions: {
        threshold: 10,
        operator: 'greater_than',
        timeframe: 'daily'
      },
      notifications: {
        email: true,
        sms: false,
        slack: false,
        webhook: false
      },
      recipients: [],
      isActive: true
    });
    setShowCreateAlert(false);
    toast.success('Alerta creada exitosamente');
  };

  const toggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, isActive: !alert.isActive }
        : alert
    ));
    toast.success('Estado de alerta actualizado');
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast.success('Alerta eliminada');
  };

  const addRecipient = () => {
    if (!newRecipient || !newRecipient.includes('@')) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    if (newAlert.recipients?.includes(newRecipient)) {
      toast.error('Este email ya está en la lista');
      return;
    }

    setNewAlert(prev => ({
      ...prev,
      recipients: [...(prev.recipients || []), newRecipient]
    }));
    setNewRecipient('');
  };

  const removeRecipient = (email: string) => {
    setNewAlert(prev => ({
      ...prev,
      recipients: prev.recipients?.filter(r => r !== email) || []
    }));
  };

  const acknowledgeAlert = (historyId: string) => {
    setAlertHistory(prev => prev.map(item => 
      item.id === historyId 
        ? { ...item, acknowledged: true }
        : item
    ));
    toast.success('Alerta marcada como vista');
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Baja</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Media</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Alta</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Crítica</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getNotificationIcons = (notifications: Alert['notifications']) => {
    const icons = [];
    if (notifications.email) icons.push(<Mail key="email" className="h-3 w-3" />);
    if (notifications.sms) icons.push(<Smartphone key="sms" className="h-3 w-3" />);
    if (notifications.slack) icons.push(<Slack key="slack" className="h-3 w-3" />);
    if (notifications.webhook) icons.push(<Webhook key="webhook" className="h-3 w-3" />);
    return icons;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Configuración de Alertas
              </h1>
              <p className="text-gray-600">
                Configura alertas automáticas para monitorear cambios en tu perfil de backlinks
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateAlert(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Alerta
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Alertas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estadísticas de Alertas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Alertas</CardTitle>
                  <Bell className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alerts.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {alerts.filter(a => a.isActive).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disparadas Hoy</CardTitle>
                  <Zap className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {alertHistory.filter(h => 
                      new Date(h.triggeredAt).toDateString() === new Date().toDateString()
                    ).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sin Revisar</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {alertHistory.filter(h => !h.acknowledged).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Alertas Configuradas */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas Configuradas</CardTitle>
                <CardDescription>
                  Gestiona tus alertas de monitoreo de backlinks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${alertTypes[alert.type].color}`}>
                            {alertTypes[alert.type].icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{alert.name}</h3>
                              <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                                {alert.isActive ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Dominio: {alert.domain}</span>
                              <span>Tipo: {alertTypes[alert.type].name}</span>
                              <span>Disparada: {alert.triggerCount} veces</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {getNotificationIcons(alert.notifications)}
                          </div>
                          <Switch
                            checked={alert.isActive}
                            onCheckedChange={() => toggleAlert(alert.id)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Creada: {new Date(alert.createdAt).toLocaleDateString()}</span>
                          {alert.lastTriggered && (
                            <span>Última vez: {new Date(alert.lastTriggered).toLocaleDateString()}</span>
                          )}
                          <span>Destinatarios: {alert.recipients.length}</span>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteAlert(alert.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Condiciones de la Alerta */}
                      <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
                        <strong>Condiciones:</strong> 
                        {alert.conditions.threshold && (
                          <span> {alert.conditions.operator?.replace('_', ' ')} {alert.conditions.threshold}</span>
                        )}
                        {alert.conditions.timeframe && (
                          <span> • Periodo: {alert.conditions.timeframe}</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {alerts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No tienes alertas configuradas. Crea tu primera alerta para comenzar el monitoreo.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Crear Nueva Alerta */}
            {showCreateAlert && (
              <Card>
                <CardHeader>
                  <CardTitle>Nueva Alerta</CardTitle>
                  <CardDescription>
                    Configura una nueva alerta de monitoreo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="alertName">Nombre de la Alerta</Label>
                    <Input
                      id="alertName"
                      placeholder="Ej: Nuevos backlinks diarios"
                      value={newAlert.name || ''}
                      onChange={(e) => setNewAlert(prev => ({...prev, name: e.target.value}))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="alertDomain">Dominio</Label>
                    <Input
                      id="alertDomain"
                      placeholder="ejemplo.com"
                      value={newAlert.domain || ''}
                      onChange={(e) => setNewAlert(prev => ({...prev, domain: e.target.value}))}
                    />
                  </div>

                  <div>
                    <Label>Tipo de Alerta</Label>
                    <Select 
                      value={newAlert.type} 
                      onValueChange={(value: any) => setNewAlert(prev => ({...prev, type: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(alertTypes).map(([key, type]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="alertDescription">Descripción</Label>
                    <Textarea
                      id="alertDescription"
                      placeholder="Describe cuándo debe dispararse esta alerta"
                      value={newAlert.description || ''}
                      onChange={(e) => setNewAlert(prev => ({...prev, description: e.target.value}))}
                    />
                  </div>

                  {/* Condiciones */}
                  <div className="space-y-3">
                    <Label>Condiciones</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Umbral</Label>
                        <Input
                          type="number"
                          placeholder="10"
                          value={newAlert.conditions?.threshold || ''}
                          onChange={(e) => setNewAlert(prev => ({
                            ...prev,
                            conditions: {
                              ...prev.conditions!,
                              threshold: parseInt(e.target.value) || 0
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Operador</Label>
                        <Select 
                          value={newAlert.conditions?.operator} 
                          onValueChange={(value: any) => setNewAlert(prev => ({
                            ...prev,
                            conditions: {...prev.conditions!, operator: value}
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="greater_than">Mayor que</SelectItem>
                            <SelectItem value="less_than">Menor que</SelectItem>
                            <SelectItem value="equals">Igual a</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Periodo</Label>
                      <Select 
                        value={newAlert.conditions?.timeframe} 
                        onValueChange={(value: any) => setNewAlert(prev => ({
                          ...prev,
                          conditions: {...prev.conditions!, timeframe: value}
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diario</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Notificaciones */}
                  <div className="space-y-3">
                    <Label>Métodos de Notificación</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newAlert.notifications?.email}
                          onCheckedChange={(checked) => setNewAlert(prev => ({
                            ...prev,
                            notifications: {...prev.notifications!, email: checked}
                          }))}
                        />
                        <Mail className="h-4 w-4" />
                        <Label>Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newAlert.notifications?.sms}
                          onCheckedChange={(checked) => setNewAlert(prev => ({
                            ...prev,
                            notifications: {...prev.notifications!, sms: checked}
                          }))}
                        />
                        <Smartphone className="h-4 w-4" />
                        <Label>SMS</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newAlert.notifications?.slack}
                          onCheckedChange={(checked) => setNewAlert(prev => ({
                            ...prev,
                            notifications: {...prev.notifications!, slack: checked}
                          }))}
                        />
                        <Slack className="h-4 w-4" />
                        <Label>Slack</Label>
                      </div>
                    </div>
                  </div>

                  {/* Destinatarios */}
                  <div className="space-y-3">
                    <Label>Destinatarios</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="email@ejemplo.com"
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                      />
                      <Button onClick={addRecipient} size="sm">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {newAlert.recipients && newAlert.recipients.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {newAlert.recipients.map((email) => (
                          <Badge key={email} variant="secondary" className="text-xs">
                            {email}
                            <button
                              onClick={() => removeRecipient(email)}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={createAlert}
                      disabled={!newAlert.name || !newAlert.domain}
                      className="flex-1"
                    >
                      Crear Alerta
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowCreateAlert(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historial de Alertas */}
            <Card>
              <CardHeader>
                <CardTitle>Historial Reciente</CardTitle>
                <CardDescription>
                  Alertas disparadas recientemente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertHistory.slice(0, 5).map((item) => (
                    <div key={item.id} className={`border rounded-lg p-3 ${!item.acknowledged ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getSeverityBadge(item.severity)}
                            {!item.acknowledged && (
                              <Badge variant="outline" className="text-xs">Nueva</Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm">{item.alertName}</h4>
                          <p className="text-xs text-gray-600 mt-1">{item.message}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(item.triggeredAt).toLocaleString()}</span>
                        {!item.acknowledged && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => acknowledgeAlert(item.id)}
                            className="text-xs h-6"
                          >
                            Marcar como vista
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {alertHistory.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No hay alertas recientes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Configuración Global */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración Global</CardTitle>
                <CardDescription>
                  Ajustes generales de alertas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas Habilitadas</Label>
                    <p className="text-xs text-gray-500">Activar/desactivar todas las alertas</p>
                  </div>
                  <Switch checked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo Silencioso</Label>
                    <p className="text-xs text-gray-500">Pausar alertas temporalmente</p>
                  </div>
                  <Switch />
                </div>

                <div>
                  <Label>Frecuencia Máxima</Label>
                  <Select defaultValue="hourly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Inmediata</SelectItem>
                      <SelectItem value="hourly">Cada hora</SelectItem>
                      <SelectItem value="daily">Diaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración Avanzada
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertConfiguration;