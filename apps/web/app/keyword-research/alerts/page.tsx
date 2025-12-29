'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Plus, 
  Settings,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  X,
  Edit,
  Trash2,
  Mail,
  Smartphone,
  Slack,
  Webhook,
  Calendar,
  Clock,
  Eye,
  Activity,
  Zap,
  Filter,
  Search,
  BarChart3
} from 'lucide-react';

interface Alert {
  id: string;
  name: string;
  type: 'position_change' | 'serp_feature' | 'competitor_movement' | 'visibility_drop' | 'volume_change' | 'new_keyword';
  keywords: string[];
  conditions: AlertCondition[];
  notifications: NotificationChannel[];
  frequency: 'immediate' | 'daily' | 'weekly';
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
  createdAt: string;
}

interface AlertCondition {
  field: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'changes_by' | 'contains';
  value: string | number;
  threshold?: number;
}

interface NotificationChannel {
  type: 'email' | 'sms' | 'slack' | 'webhook';
  config: any;
  enabled: boolean;
}

interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  type: Alert['type'];
  defaultConditions: AlertCondition[];
}

const AlertConfiguration = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [editingAlert, setEditingAlert] = useState<string | null>(null);
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    name: '',
    type: 'position_change',
    keywords: [],
    conditions: [],
    notifications: [],
    frequency: 'immediate',
    enabled: true
  });
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [keywordSearch, setKeywordSearch] = useState('');

  // Mock data
  const alertTemplates: AlertTemplate[] = [
    {
      id: 'position-drop',
      name: 'Caída de Posición',
      description: 'Alerta cuando una keyword baja más de X posiciones',
      type: 'position_change',
      defaultConditions: [
        { field: 'position', operator: 'changes_by', value: 5, threshold: 5 }
      ]
    },
    {
      id: 'position-gain',
      name: 'Mejora de Posición',
      description: 'Alerta cuando una keyword sube más de X posiciones',
      type: 'position_change',
      defaultConditions: [
        { field: 'position', operator: 'changes_by', value: -3, threshold: 3 }
      ]
    },
    {
      id: 'top-10-entry',
      name: 'Entrada al Top 10',
      description: 'Alerta cuando una keyword entra al top 10',
      type: 'position_change',
      defaultConditions: [
        { field: 'position', operator: 'less_than', value: 11 }
      ]
    },
    {
      id: 'serp-feature',
      name: 'Nueva SERP Feature',
      description: 'Alerta cuando aparece una nueva feature en SERP',
      type: 'serp_feature',
      defaultConditions: [
        { field: 'serp_features', operator: 'contains', value: 'featured_snippet' }
      ]
    },
    {
      id: 'competitor-overtake',
      name: 'Competidor nos Supera',
      description: 'Alerta cuando un competidor supera nuestra posición',
      type: 'competitor_movement',
      defaultConditions: [
        { field: 'competitor_position', operator: 'less_than', value: 'our_position' }
      ]
    },
    {
      id: 'visibility-drop',
      name: 'Caída de Visibilidad',
      description: 'Alerta cuando la visibilidad baja más del X%',
      type: 'visibility_drop',
      defaultConditions: [
        { field: 'visibility', operator: 'changes_by', value: -20, threshold: 20 }
      ]
    }
  ];

  const mockAlerts: Alert[] = [
    {
      id: 'alert-1',
      name: 'Caída Crítica de Rankings',
      type: 'position_change',
      keywords: ['seo tools', 'keyword research'],
      conditions: [
        { field: 'position', operator: 'changes_by', value: 5, threshold: 5 }
      ],
      notifications: [
        { type: 'email', config: { email: 'admin@empresa.com' }, enabled: true },
        { type: 'slack', config: { channel: '#seo-alerts' }, enabled: true }
      ],
      frequency: 'immediate',
      enabled: true,
      lastTriggered: '2024-01-19',
      triggerCount: 3,
      createdAt: '2024-01-15'
    },
    {
      id: 'alert-2',
      name: 'Entrada al Top 10',
      type: 'position_change',
      keywords: ['backlink checker', 'competitor analysis'],
      conditions: [
        { field: 'position', operator: 'less_than', value: 11 }
      ],
      notifications: [
        { type: 'email', config: { email: 'team@empresa.com' }, enabled: true }
      ],
      frequency: 'immediate',
      enabled: true,
      triggerCount: 1,
      createdAt: '2024-01-10'
    },
    {
      id: 'alert-3',
      name: 'Movimiento de Competidores',
      type: 'competitor_movement',
      keywords: ['seo tools'],
      conditions: [
        { field: 'competitor_position', operator: 'less_than', value: 'our_position' }
      ],
      notifications: [
        { type: 'email', config: { email: 'seo@empresa.com' }, enabled: true }
      ],
      frequency: 'daily',
      enabled: false,
      triggerCount: 0,
      createdAt: '2024-01-08'
    }
  ];

  const mockKeywords = [
    'seo tools', 'keyword research', 'backlink checker', 'rank tracker',
    'competitor analysis', 'serp analysis', 'content optimization', 'link building',
    'technical seo', 'local seo', 'mobile seo', 'page speed optimization'
  ];

  React.useEffect(() => {
    setAlerts(mockAlerts);
  }, []);

  const handleCreateAlert = async () => {
    if (!newAlert.name?.trim() || selectedKeywords.length === 0) return;

    try {
      const response = await fetch('/api/keyword-research/alerts/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAlert.name,
          type: newAlert.type || 'position_change',
          keywords: selectedKeywords,
          conditions: newAlert.conditions || [],
          notifications: newAlert.notifications || [],
          frequency: newAlert.frequency || 'immediate',
          enabled: newAlert.enabled ?? true,
          domain: 'misitio.com', // En una implementación real, esto vendría del contexto del usuario
          settings: {
            threshold: 5,
            includeWeekends: true,
            timezone: 'UTC'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la alerta');
      }

      const data = await response.json();
      
      // Transformar datos de la API al formato esperado
      const alert: Alert = {
        id: data.alert.id,
        name: data.alert.name,
        type: data.alert.type,
        keywords: data.alert.keywords,
        conditions: data.alert.conditions,
        notifications: data.alert.notifications,
        frequency: data.alert.frequency,
        enabled: data.alert.enabled,
        triggerCount: 0,
        createdAt: data.alert.createdAt
      };

      setAlerts([alert, ...alerts]);
      setShowNewAlert(false);
      setNewAlert({
        name: '',
        type: 'position_change',
        keywords: [],
        conditions: [],
        notifications: [],
        frequency: 'immediate',
        enabled: true
      });
      setSelectedKeywords([]);
    } catch (error) {
      console.error('Error al crear alerta:', error);
      
      // Fallback a creación local en caso de error
      const alert: Alert = {
        id: `alert-${Date.now()}`,
        name: newAlert.name,
        type: newAlert.type || 'position_change',
        keywords: selectedKeywords,
        conditions: newAlert.conditions || [],
        notifications: newAlert.notifications || [],
        frequency: newAlert.frequency || 'immediate',
        enabled: newAlert.enabled ?? true,
        triggerCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setAlerts([alert, ...alerts]);
      setShowNewAlert(false);
      setNewAlert({
        name: '',
        type: 'position_change',
        keywords: [],
        conditions: [],
        notifications: [],
        frequency: 'immediate',
        enabled: true
      });
      setSelectedKeywords([]);
    }
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, enabled: !alert.enabled }
        : alert
    ));
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const getAlertTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'position_change':
        return <TrendingUp className="h-4 w-4" />;
      case 'serp_feature':
        return <Search className="h-4 w-4" />;
      case 'competitor_movement':
        return <Target className="h-4 w-4" />;
      case 'visibility_drop':
        return <BarChart3 className="h-4 w-4" />;
      case 'volume_change':
        return <Activity className="h-4 w-4" />;
      case 'new_keyword':
        return <Plus className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertTypeColor = (type: Alert['type']) => {
    switch (type) {
      case 'position_change':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'serp_feature':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'competitor_movement':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'visibility_drop':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'volume_change':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'new_keyword':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Smartphone className="h-4 w-4" />;
      case 'slack':
        return <Slack className="h-4 w-4" />;
      case 'webhook':
        return <Webhook className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'immediate':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'daily':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'weekly':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredKeywords = mockKeywords.filter(keyword =>
    keyword.toLowerCase().includes(keywordSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración de Alertas</h1>
            <p className="text-gray-600 mt-1">Configura alertas automáticas para monitorear cambios importantes</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configuración Global
            </Button>
            <Button onClick={() => setShowNewAlert(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Alerta
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.filter(a => a.enabled).length}</div>
              <p className="text-xs text-muted-foreground">
                de {alerts.length} configuradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activaciones Hoy</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                alertas disparadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Keywords Monitoreadas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...new Set(alerts.flatMap(a => a.keywords))].length}
              </div>
              <p className="text-xs text-muted-foreground">
                keywords únicas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Canales Configurados</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...new Set(alerts.flatMap(a => a.notifications.map(n => n.type)))].length}
              </div>
              <p className="text-xs text-muted-foreground">
                tipos de notificación
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Formulario nueva alerta */}
        {showNewAlert && (
          <Card>
            <CardHeader>
              <CardTitle>Crear Nueva Alerta</CardTitle>
              <CardDescription>Configura una nueva alerta para monitorear cambios específicos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Templates de alerta */}
              <div className="space-y-3">
                <Label>Templates de Alerta</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {alertTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="border rounded-lg p-3 cursor-pointer hover:border-blue-300 transition-colors"
                      onClick={() => {
                        setNewAlert({
                          ...newAlert,
                          name: template.name,
                          type: template.type,
                          conditions: template.defaultConditions
                        });
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getAlertTypeColor(template.type)}>
                          {getAlertTypeIcon(template.type)}
                          <span className="ml-1">{template.name}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de la Alerta</Label>
                  <Input
                    placeholder="Ej: Caída crítica de rankings"
                    value={newAlert.name || ''}
                    onChange={(e) => setNewAlert({...newAlert, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Alerta</Label>
                  <Select 
                    value={newAlert.type} 
                    onValueChange={(value: Alert['type']) => setNewAlert({...newAlert, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="position_change">Cambio de Posición</SelectItem>
                      <SelectItem value="serp_feature">SERP Features</SelectItem>
                      <SelectItem value="competitor_movement">Movimiento Competidores</SelectItem>
                      <SelectItem value="visibility_drop">Caída de Visibilidad</SelectItem>
                      <SelectItem value="volume_change">Cambio de Volumen</SelectItem>
                      <SelectItem value="new_keyword">Nueva Keyword</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selección de keywords */}
              <div className="space-y-3">
                <Label>Keywords a Monitorear</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Buscar keywords..."
                    value={keywordSearch}
                    onChange={(e) => setKeywordSearch(e.target.value)}
                  />
                  <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {filteredKeywords.map((keyword) => (
                        <div key={keyword} className="flex items-center space-x-2">
                          <Checkbox
                            id={keyword}
                            checked={selectedKeywords.includes(keyword)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedKeywords([...selectedKeywords, keyword]);
                              } else {
                                setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
                              }
                            }}
                          />
                          <Label htmlFor={keyword} className="text-sm">{keyword}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedKeywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="text-xs">
                          {keyword}
                          <X 
                            className="h-3 w-3 ml-1 cursor-pointer" 
                            onClick={() => setSelectedKeywords(selectedKeywords.filter(k => k !== keyword))}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Frecuencia */}
              <div className="space-y-2">
                <Label>Frecuencia de Verificación</Label>
                <Select 
                  value={newAlert.frequency} 
                  onValueChange={(value: Alert['frequency']) => setNewAlert({...newAlert, frequency: value})}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Inmediata</SelectItem>
                    <SelectItem value="daily">Diaria</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleCreateAlert}
                  disabled={!newAlert.name?.trim() || selectedKeywords.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Alerta
                </Button>
                <Button variant="outline" onClick={() => setShowNewAlert(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas Configuradas
            </CardTitle>
            <CardDescription>Gestiona todas tus alertas activas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{alert.name}</h3>
                        <Badge variant="outline" className={getAlertTypeColor(alert.type)}>
                          {getAlertTypeIcon(alert.type)}
                          <span className="ml-1 capitalize">{alert.type.replace('_', ' ')}</span>
                        </Badge>
                        <Badge variant="outline" className={getFrequencyColor(alert.frequency)}>
                          <Clock className="h-3 w-3 mr-1" />
                          {alert.frequency}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {alert.keywords.slice(0, 3).map((keyword) => (
                          <Badge key={keyword} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {alert.keywords.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{alert.keywords.length - 3} más
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span>Notificaciones:</span>
                          {alert.notifications.map((notification, index) => (
                            <span key={index} className="flex items-center gap-1">
                              {getNotificationIcon(notification.type)}
                            </span>
                          ))}
                        </div>
                        <div>Activaciones: {alert.triggerCount}</div>
                        {alert.lastTriggered && (
                          <div>Última: {alert.lastTriggered}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.enabled}
                        onCheckedChange={() => handleToggleAlert(alert.id)}
                      />
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Condiciones */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium mb-2">Condiciones:</div>
                    <div className="space-y-1">
                      {alert.conditions.map((condition, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {condition.field} {condition.operator.replace('_', ' ')} {condition.value}
                          {condition.threshold && ` (umbral: ${condition.threshold})`}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {alerts.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alertas configuradas</h3>
                  <p className="text-gray-600 mb-4">Crea tu primera alerta para comenzar a monitorear cambios</p>
                  <Button onClick={() => setShowNewAlert(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Alerta
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlertConfiguration;