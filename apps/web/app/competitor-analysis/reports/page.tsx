'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  Eye, 
  Trash2, 
  Edit, 
  Share, 
  Mail, 
  FileSpreadsheet, 
  Settings, 
  Filter, 
  Plus,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Globe,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  Copy,
  ExternalLink,
  Presentation,
  FileImage,
  Palette,
  Building,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

// Interfaces
interface ReportConfig {
  title: string;
  format: 'pdf' | 'excel' | 'powerpoint' | 'word';
  sections: string[];
  dateRange: string;
  includeCharts: boolean;
  includeRecommendations: boolean;
  customNotes: string;
  competitors: string[];
  keywords: string[];
  branding: {
    logo: boolean;
    colors: boolean;
    companyName: string;
  };
  scheduling: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
}

interface Report {
  id: string;
  title: string;
  format: 'pdf' | 'excel' | 'powerpoint' | 'word';
  status: 'completed' | 'generating' | 'failed' | 'scheduled';
  createdAt: string;
  fileSize: string | null;
  sections: string[];
  downloadUrl: string | null;
  views: number;
  shared: boolean;
  scheduledFor?: string;
  recipients?: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  icon: React.ReactNode;
  category: 'standard' | 'advanced' | 'custom';
}

const ReportsGenerator = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: '',
    format: 'pdf',
    sections: ['executive-summary', 'competitor-overview', 'keyword-analysis'],
    dateRange: '30days',
    includeCharts: true,
    includeRecommendations: true,
    customNotes: '',
    competitors: [],
    keywords: [],
    branding: {
      logo: true,
      colors: true,
      companyName: 'Mi Empresa'
    },
    scheduling: {
      enabled: false,
      frequency: 'monthly',
      recipients: []
    }
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newRecipient, setNewRecipient] = useState('');

  // Mock data para reportes existentes
  const mockReports: Report[] = [
    {
      id: 'rpt_001',
      title: 'Análisis Competitivo Q1 2024',
      format: 'pdf',
      status: 'completed',
      createdAt: '2024-01-20T10:30:00Z',
      fileSize: '2.4 MB',
      sections: ['executive-summary', 'competitor-overview', 'keyword-analysis', 'backlink-analysis'],
      downloadUrl: '/reports/competitive-analysis-q1-2024.pdf',
      views: 12,
      shared: true
    },
    {
      id: 'rpt_002',
      title: 'Reporte Mensual - Enero 2024',
      format: 'excel',
      status: 'completed',
      createdAt: '2024-01-15T14:20:00Z',
      fileSize: '1.8 MB',
      sections: ['keyword-analysis', 'content-gaps', 'recommendations'],
      downloadUrl: '/reports/monthly-report-jan-2024.xlsx',
      views: 8,
      shared: false
    },
    {
      id: 'rpt_003',
      title: 'Análisis de Backlinks - Competidores',
      format: 'pdf',
      status: 'generating',
      createdAt: '2024-01-22T09:15:00Z',
      fileSize: null,
      sections: ['backlink-analysis', 'link-opportunities'],
      downloadUrl: null,
      views: 0,
      shared: false
    },
    {
      id: 'rpt_004',
      title: 'Reporte Ejecutivo Semanal',
      format: 'powerpoint',
      status: 'scheduled',
      createdAt: '2024-01-25T08:00:00Z',
      fileSize: null,
      sections: ['executive-summary', 'key-metrics', 'recommendations'],
      downloadUrl: null,
      views: 0,
      shared: false,
      scheduledFor: '2024-01-29T09:00:00Z',
      recipients: ['ceo@empresa.com', 'marketing@empresa.com']
    },
    {
      id: 'rpt_005',
      title: 'Análisis de Contenido Competitivo',
      format: 'word',
      status: 'failed',
      createdAt: '2024-01-23T16:45:00Z',
      fileSize: null,
      sections: ['content-gaps', 'competitor-content', 'opportunities'],
      downloadUrl: null,
      views: 0,
      shared: false
    }
  ];

  const availableSections = [
    { id: 'executive-summary', name: 'Resumen Ejecutivo', description: 'Resumen de hallazgos clave y métricas principales' },
    { id: 'competitor-overview', name: 'Vista General de Competidores', description: 'Análisis de competidores principales y posicionamiento' },
    { id: 'keyword-analysis', name: 'Análisis de Keywords', description: 'Comparación de palabras clave y oportunidades' },
    { id: 'backlink-analysis', name: 'Análisis de Backlinks', description: 'Perfil de enlaces entrantes y calidad de dominios' },
    { id: 'content-gaps', name: 'Gaps de Contenido', description: 'Oportunidades de contenido no cubiertas' },
    { id: 'technical-seo', name: 'SEO Técnico', description: 'Aspectos técnicos y rendimiento del sitio' },
    { id: 'recommendations', name: 'Recomendaciones', description: 'Sugerencias de mejora priorizadas' },
    { id: 'traffic-analysis', name: 'Análisis de Tráfico', description: 'Estimaciones de tráfico y tendencias' },
    { id: 'social-media', name: 'Redes Sociales', description: 'Presencia y engagement en redes sociales' },
    { id: 'appendix', name: 'Apéndice', description: 'Datos adicionales y metodología' }
  ];

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'comprehensive',
      name: 'Análisis Completo',
      description: 'Reporte completo con todas las secciones disponibles',
      sections: ['executive-summary', 'competitor-overview', 'keyword-analysis', 'backlink-analysis', 'content-gaps', 'technical-seo', 'recommendations'],
      icon: <BarChart3 className="h-5 w-5" />,
      category: 'advanced'
    },
    {
      id: 'keyword-focused',
      name: 'Enfoque en Keywords',
      description: 'Análisis centrado en palabras clave y oportunidades',
      sections: ['executive-summary', 'keyword-analysis', 'content-gaps', 'recommendations'],
      icon: <Target className="h-5 w-5" />,
      category: 'standard'
    },
    {
      id: 'backlink-focused',
      name: 'Enfoque en Backlinks',
      description: 'Análisis profundo de perfiles de enlaces',
      sections: ['executive-summary', 'backlink-analysis', 'recommendations'],
      icon: <Globe className="h-5 w-5" />,
      category: 'standard'
    },
    {
      id: 'executive-summary',
      name: 'Resumen Ejecutivo',
      description: 'Reporte conciso para directivos',
      sections: ['executive-summary', 'recommendations'],
      icon: <TrendingUp className="h-5 w-5" />,
      category: 'standard'
    },
    {
      id: 'technical-audit',
      name: 'Auditoría Técnica',
      description: 'Análisis técnico detallado de SEO',
      sections: ['technical-seo', 'competitor-overview', 'recommendations'],
      icon: <Settings className="h-5 w-5" />,
      category: 'advanced'
    },
    {
      id: 'content-strategy',
      name: 'Estrategia de Contenido',
      description: 'Oportunidades y gaps de contenido',
      sections: ['content-gaps', 'keyword-analysis', 'recommendations'],
      icon: <FileText className="h-5 w-5" />,
      category: 'advanced'
    }
  ];

  // Funciones
  const handleGenerateReport = async () => {
    if (!reportConfig.title || reportConfig.sections.length === 0) {
      toast.error('Debes agregar un título y al menos una sección');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simular progreso visual
      const progressSteps = [
        { progress: 20, message: 'Recopilando datos de competidores...' },
        { progress: 40, message: 'Analizando keywords y backlinks...' },
        { progress: 60, message: 'Generando gráficos y visualizaciones...' },
        { progress: 80, message: 'Compilando reporte final...' },
        { progress: 100, message: 'Finalizando y optimizando...' }
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGenerationProgress(step.progress);
      }

      // Llamada real a la API
      const response = await fetch('/api/competitor-analysis/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportConfig)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar el reporte');
      }

      const result = await response.json();
      
      toast.success('Reporte generado exitosamente');
      
      // Si está programado, enviar por email
      if (reportConfig.scheduling.enabled && reportConfig.scheduling.recipients.length > 0) {
        toast.success(`Reporte programado para envío ${reportConfig.scheduling.frequency}`);
      }
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al generar el reporte');
      console.error('Report generation error:', error);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleSectionToggle = (sectionId: string) => {
    setReportConfig(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter(s => s !== sectionId)
        : [...prev.sections, sectionId]
    }));
  };

  const applyTemplate = (template: ReportTemplate) => {
    setReportConfig(prev => ({
      ...prev,
      sections: template.sections,
      title: template.name
    }));
    setSelectedTemplate(template.id);
    toast.success(`Plantilla "${template.name}" aplicada`);
  };

  const addRecipient = () => {
    if (newRecipient && !reportConfig.scheduling.recipients.includes(newRecipient)) {
      setReportConfig(prev => ({
        ...prev,
        scheduling: {
          ...prev.scheduling,
          recipients: [...prev.scheduling.recipients, newRecipient]
        }
      }));
      setNewRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setReportConfig(prev => ({
      ...prev,
      scheduling: {
        ...prev.scheduling,
        recipients: prev.scheduling.recipients.filter(r => r !== email)
      }
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Completado', icon: CheckCircle },
      generating: { color: 'bg-yellow-100 text-yellow-800', label: 'Generando', icon: RefreshCw },
      failed: { color: 'bg-red-100 text-red-800', label: 'Error', icon: AlertCircle },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Programado', icon: Calendar }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getFormatIcon = (format: string) => {
    const icons = {
      pdf: FileText,
      excel: FileSpreadsheet,
      powerpoint: Presentation,
      word: FileImage
    };
    const Icon = icons[format as keyof typeof icons] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const filteredReports = mockReports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generador de Reportes Avanzados</h1>
          <p className="text-gray-600 mt-2">Crea reportes profesionales de análisis competitivo con IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurar Plantillas
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Programar Reportes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Crear Reporte</TabsTrigger>
          <TabsTrigger value="templates">Plantillas ({reportTemplates.length})</TabsTrigger>
          <TabsTrigger value="history">Historial ({mockReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          {/* Configuración del Reporte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configuración del Reporte
              </CardTitle>
              <CardDescription>
                Personaliza tu reporte de análisis competitivo con opciones avanzadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título del Reporte *</Label>
                  <Input
                    placeholder="Ej: Análisis Competitivo Q1 2024"
                    value={reportConfig.title}
                    onChange={(e) => setReportConfig({...reportConfig, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Formato de Exportación</Label>
                  <Select 
                    value={reportConfig.format} 
                    onValueChange={(value) => setReportConfig({...reportConfig, format: value as 'pdf' | 'excel' | 'powerpoint' | 'word'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          PDF - Documento profesional
                        </div>
                      </SelectItem>
                      <SelectItem value="excel">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Excel - Datos y análisis
                        </div>
                      </SelectItem>
                      <SelectItem value="powerpoint">
                        <div className="flex items-center gap-2">
                          <Presentation className="h-4 w-4" />
                          PowerPoint - Presentación
                        </div>
                      </SelectItem>
                      <SelectItem value="word">
                        <div className="flex items-center gap-2">
                          <FileImage className="h-4 w-4" />
                          Word - Documento editable
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rango de Datos</Label>
                <Select value={reportConfig.dateRange} onValueChange={(value) => setReportConfig({...reportConfig, dateRange: value})}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Últimos 7 días</SelectItem>
                    <SelectItem value="30days">Últimos 30 días</SelectItem>
                    <SelectItem value="90days">Últimos 90 días</SelectItem>
                    <SelectItem value="6months">Últimos 6 meses</SelectItem>
                    <SelectItem value="1year">Último año</SelectItem>
                    <SelectItem value="custom">Rango personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Secciones del Reporte */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Secciones a Incluir *</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setReportConfig({...reportConfig, sections: availableSections.map(s => s.id)})}
                  >
                    Seleccionar Todas
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableSections.map((section) => (
                    <div key={section.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id={section.id}
                        checked={reportConfig.sections.includes(section.id)}
                        onCheckedChange={() => handleSectionToggle(section.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={section.id} className="font-medium cursor-pointer">
                          {section.name}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opciones Avanzadas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Opciones Avanzadas</Label>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    {showAdvancedOptions ? 'Ocultar' : 'Mostrar'} Opciones
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="charts"
                      checked={reportConfig.includeCharts}
                      onCheckedChange={(checked) => setReportConfig({...reportConfig, includeCharts: !!checked})}
                    />
                    <Label htmlFor="charts">Incluir gráficos y visualizaciones</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recommendations"
                      checked={reportConfig.includeRecommendations}
                      onCheckedChange={(checked) => setReportConfig({...reportConfig, includeRecommendations: !!checked})}
                    />
                    <Label htmlFor="recommendations">Incluir recomendaciones con IA</Label>
                  </div>
                </div>

                {showAdvancedOptions && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    {/* Branding */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Personalización de Marca
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Nombre de la Empresa</Label>
                          <Input
                            id="companyName"
                            value={reportConfig.branding.companyName}
                            onChange={(e) => setReportConfig({
                              ...reportConfig,
                              branding: { ...reportConfig.branding, companyName: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="logo"
                              checked={reportConfig.branding.logo}
                              onCheckedChange={(checked) => setReportConfig({
                                ...reportConfig,
                                branding: { ...reportConfig.branding, logo: !!checked }
                              })}
                            />
                            <Label htmlFor="logo">Incluir logo de empresa</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="colors"
                              checked={reportConfig.branding.colors}
                              onCheckedChange={(checked) => setReportConfig({
                                ...reportConfig,
                                branding: { ...reportConfig.branding, colors: !!checked }
                              })}
                            />
                            <Label htmlFor="colors">Usar colores corporativos</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Programación */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={reportConfig.scheduling.enabled}
                          onCheckedChange={(checked) => setReportConfig({
                            ...reportConfig,
                            scheduling: { ...reportConfig.scheduling, enabled: checked }
                          })}
                        />
                        <Label htmlFor="scheduling" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Programar envío automático
                        </Label>
                      </div>

                      {reportConfig.scheduling.enabled && (
                        <div className="space-y-4 p-3 border rounded bg-white">
                          <div className="space-y-2">
                            <Label>Frecuencia</Label>
                            <Select 
                              value={reportConfig.scheduling.frequency} 
                              onValueChange={(value) => setReportConfig({
                                ...reportConfig,
                                scheduling: { ...reportConfig.scheduling, frequency: value as 'daily' | 'weekly' | 'monthly' }
                              })}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Diario</SelectItem>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="monthly">Mensual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Destinatarios</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="email@empresa.com"
                                value={newRecipient}
                                onChange={(e) => setNewRecipient(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                              />
                              <Button onClick={addRecipient} size="sm">
                                <UserPlus className="h-4 w-4" />
                              </Button>
                            </div>
                            {reportConfig.scheduling.recipients.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {reportConfig.scheduling.recipients.map((email, index) => (
                                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {email}
                                    <button onClick={() => removeRecipient(email)} className="ml-1 hover:text-red-600">
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notas Personalizadas */}
              <div className="space-y-2">
                <Label>Notas Personalizadas (Opcional)</Label>
                <Textarea
                  placeholder="Agrega contexto adicional, objetivos específicos o notas para este reporte..."
                  value={reportConfig.customNotes}
                  onChange={(e) => setReportConfig({...reportConfig, customNotes: e.target.value})}
                  rows={3}
                />
              </div>

              {/* Botón de Generación */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating || !reportConfig.title || reportConfig.sections.length === 0}
                  className="px-8 py-3 text-lg"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Generando Reporte...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Generar Reporte con IA
                    </>
                  )}
                </Button>
              </div>

              {isGenerating && (
                <div className="space-y-3">
                  <div className="text-center text-sm text-gray-600">
                    Generando reporte con {reportConfig.sections.length} secciones en formato {reportConfig.format.toUpperCase()}...
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                  <div className="text-center text-xs text-gray-500">
                    {generationProgress}% completado
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Plantillas Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Reportes</CardTitle>
              <CardDescription>Selecciona una plantilla predefinida para comenzar rápidamente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {template.icon}
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="text-xs text-gray-500">
                      {template.sections.length} secciones incluidas
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.sections.slice(0, 3).map((section, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {availableSections.find(s => s.id === section)?.name || section}
                        </Badge>
                      ))}
                      {template.sections.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.sections.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="completed">Completados</SelectItem>
                    <SelectItem value="generating">Generando</SelectItem>
                    <SelectItem value="failed">Con Error</SelectItem>
                    <SelectItem value="scheduled">Programados</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input 
                  placeholder="Buscar reportes..." 
                  className="w-64" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filtros Avanzados
                </Button>

                <div className="ml-auto text-sm text-gray-600">
                  {filteredReports.length} de {mockReports.length} reportes
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Reportes */}
          <Card>
            <CardHeader>
              <CardTitle>Reportes Generados</CardTitle>
              <CardDescription>Historial completo de reportes creados y programados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getFormatIcon(report.format)}
                        <div>
                          <h4 className="font-medium text-lg">{report.title}</h4>
                          <p className="text-sm text-gray-600">
                            Creado el {new Date(report.createdAt).toLocaleDateString()} a las {new Date(report.createdAt).toLocaleTimeString()}
                          </p>
                          {report.scheduledFor && (
                            <p className="text-sm text-blue-600">
                              Programado para: {new Date(report.scheduledFor).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(report.status)}
                        {report.shared && (
                          <Badge variant="outline" className="text-xs">
                            <Share className="h-3 w-3 mr-1" />
                            Compartido
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Formato:</span>
                        <span className="ml-2 font-medium uppercase">{report.format}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tamaño:</span>
                        <span className="ml-2 font-medium">{report.fileSize || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Secciones:</span>
                        <span className="ml-2 font-medium">{report.sections.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Vistas:</span>
                        <span className="ml-2 font-medium">{report.views}</span>
                      </div>
                      {report.recipients && (
                        <div>
                          <span className="text-gray-600">Destinatarios:</span>
                          <span className="ml-2 font-medium">{report.recipients.length}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {report.sections.slice(0, 4).map((section, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {availableSections.find(s => s.id === section)?.name || section}
                          </Badge>
                        ))}
                        {report.sections.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{report.sections.length - 4} más
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {report.status === 'completed' && (
                          <>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Vista Previa
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share className="h-4 w-4 mr-1" />
                              Compartir
                            </Button>
                          </>
                        )}
                        {report.status === 'scheduled' && (
                          <Button variant="outline" size="sm">
                            <Send className="h-4 w-4 mr-1" />
                            Enviar Ahora
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-1" />
                          Duplicar
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredReports.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron reportes que coincidan con los filtros seleccionados.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsGenerator;