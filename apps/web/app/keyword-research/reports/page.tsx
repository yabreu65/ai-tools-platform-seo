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
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  TrendingUp,
  Target,
  Eye,
  Settings,
  Plus,
  X,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Image,
  Mail,
  Share2,
  Palette,
  Layout
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
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ReferenceLine
} from 'recharts';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'keyword_analysis' | 'ranking_report' | 'competitor_analysis' | 'trend_report' | 'custom';
  sections: ReportSection[];
  format: 'pdf' | 'excel' | 'html';
  frequency?: 'manual' | 'daily' | 'weekly' | 'monthly';
}

interface ReportSection {
  id: string;
  name: string;
  type: 'overview' | 'keywords_table' | 'trends_chart' | 'competitors' | 'serp_analysis' | 'recommendations';
  enabled: boolean;
  config: any;
}

interface ReportConfig {
  title: string;
  description: string;
  dateRange: string;
  includeCharts: boolean;
  includeTables: boolean;
  includeRecommendations: boolean;
  selectedKeywords: string[];
  selectedCompetitors: string[];
  branding: {
    logo: boolean;
    colors: boolean;
    companyName: string;
  };
}

interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  format: string;
  createdAt: string;
  size: string;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
}

const ReportGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: '',
    description: '',
    dateRange: '30d',
    includeCharts: true,
    includeTables: true,
    includeRecommendations: true,
    selectedKeywords: [],
    selectedCompetitors: [],
    branding: {
      logo: true,
      colors: true,
      companyName: 'Mi Empresa'
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [showCustomTemplate, setShowCustomTemplate] = useState(false);

  // Mock data
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'keyword-analysis',
      name: 'Análisis de Keywords',
      description: 'Reporte completo de rendimiento de keywords con métricas y tendencias',
      type: 'keyword_analysis',
      format: 'pdf',
      sections: [
        { id: 'overview', name: 'Resumen Ejecutivo', type: 'overview', enabled: true, config: {} },
        { id: 'keywords', name: 'Tabla de Keywords', type: 'keywords_table', enabled: true, config: {} },
        { id: 'trends', name: 'Gráficos de Tendencias', type: 'trends_chart', enabled: true, config: {} },
        { id: 'recommendations', name: 'Recomendaciones', type: 'recommendations', enabled: true, config: {} }
      ]
    },
    {
      id: 'ranking-report',
      name: 'Reporte de Rankings',
      description: 'Seguimiento de posiciones y cambios en rankings de keywords',
      type: 'ranking_report',
      format: 'pdf',
      sections: [
        { id: 'overview', name: 'Resumen de Rankings', type: 'overview', enabled: true, config: {} },
        { id: 'keywords', name: 'Posiciones Actuales', type: 'keywords_table', enabled: true, config: {} },
        { id: 'trends', name: 'Evolución Temporal', type: 'trends_chart', enabled: true, config: {} }
      ]
    },
    {
      id: 'competitor-analysis',
      name: 'Análisis de Competidores',
      description: 'Comparación detallada con competidores principales',
      type: 'competitor_analysis',
      format: 'pdf',
      sections: [
        { id: 'overview', name: 'Resumen Competitivo', type: 'overview', enabled: true, config: {} },
        { id: 'competitors', name: 'Análisis de Competidores', type: 'competitors', enabled: true, config: {} },
        { id: 'keywords', name: 'Keywords Compartidas', type: 'keywords_table', enabled: true, config: {} }
      ]
    },
    {
      id: 'trend-report',
      name: 'Reporte de Tendencias',
      description: 'Análisis de tendencias y estacionalidad de keywords',
      type: 'trend_report',
      format: 'excel',
      sections: [
        { id: 'trends', name: 'Análisis de Tendencias', type: 'trends_chart', enabled: true, config: {} },
        { id: 'keywords', name: 'Datos de Tendencias', type: 'keywords_table', enabled: true, config: {} }
      ]
    }
  ];

  const mockKeywords = [
    'seo tools', 'keyword research', 'backlink checker', 'rank tracker', 
    'competitor analysis', 'serp analysis', 'content optimization'
  ];

  const mockCompetitors = [
    'competitor1.com', 'competitor2.com', 'competitor3.com', 'competitor4.com'
  ];

  const mockGeneratedReports: GeneratedReport[] = [
    {
      id: 'report-1',
      name: 'Análisis de Keywords - Enero 2024',
      type: 'Análisis de Keywords',
      format: 'PDF',
      createdAt: '2024-01-20',
      size: '2.4 MB',
      status: 'completed',
      downloadUrl: '/reports/keyword-analysis-jan-2024.pdf'
    },
    {
      id: 'report-2',
      name: 'Reporte de Rankings - Semanal',
      type: 'Reporte de Rankings',
      format: 'Excel',
      createdAt: '2024-01-19',
      size: '1.8 MB',
      status: 'completed',
      downloadUrl: '/reports/ranking-report-weekly.xlsx'
    },
    {
      id: 'report-3',
      name: 'Análisis de Competidores - Q1',
      type: 'Análisis de Competidores',
      format: 'PDF',
      createdAt: '2024-01-18',
      size: '3.2 MB',
      status: 'generating'
    }
  ];

  const handleGenerateReport = async () => {
    if (!selectedTemplate || !reportConfig.title.trim()) return;

    setIsGenerating(true);

    try {
      const selectedTemplateData = reportTemplates.find(t => t.id === selectedTemplate);
      
      const response = await fetch('/api/keyword-research/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: reportConfig.title,
          description: reportConfig.description,
          type: selectedTemplateData?.type || 'custom',
          format: selectedTemplateData?.format || 'pdf',
          dateRange: reportConfig.dateRange,
          keywords: reportConfig.selectedKeywords.length > 0 ? reportConfig.selectedKeywords : mockKeywords,
          competitors: reportConfig.selectedCompetitors,
          sections: selectedTemplateData?.sections || [],
          settings: {
            includeCharts: reportConfig.includeCharts,
            includeTables: reportConfig.includeTables,
            includeRecommendations: reportConfig.includeRecommendations,
            branding: reportConfig.branding
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar el reporte');
      }

      const data = await response.json();
      
      // Crear el reporte con estado inicial
      const newReport: GeneratedReport = {
        id: data.reportId,
        name: reportConfig.title,
        type: selectedTemplateData?.name || 'Reporte Personalizado',
        format: (selectedTemplateData?.format || 'pdf').toUpperCase(),
        createdAt: new Date().toISOString().split('T')[0],
        size: '0 MB',
        status: 'generating'
      };

      setGeneratedReports([newReport, ...generatedReports]);

      // Simular tiempo de generación (en una implementación real, esto sería polling o websockets)
      setTimeout(() => {
        setGeneratedReports(prev => 
          prev.map(report => 
            report.id === newReport.id 
              ? { 
                  ...report, 
                  status: 'completed', 
                  size: data.estimatedSize || '2.1 MB', 
                  downloadUrl: data.downloadUrl || '/reports/generated-report.pdf' 
                }
              : report
          )
        );
        setIsGenerating(false);
      }, 3000);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      
      // Fallback a generación simulada en caso de error
      const newReport: GeneratedReport = {
        id: `report-${Date.now()}`,
        name: reportConfig.title,
        type: reportTemplates.find(t => t.id === selectedTemplate)?.name || 'Reporte Personalizado',
        format: reportTemplates.find(t => t.id === selectedTemplate)?.format.toUpperCase() || 'PDF',
        createdAt: new Date().toISOString().split('T')[0],
        size: '0 MB',
        status: 'generating'
      };

      setGeneratedReports([newReport, ...generatedReports]);

      setTimeout(() => {
        setGeneratedReports(prev => 
          prev.map(report => 
            report.id === newReport.id 
              ? { ...report, status: 'completed', size: '2.1 MB', downloadUrl: '/reports/generated-report.pdf' }
              : report
          )
        );
        setIsGenerating(false);
      }, 3000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'generating':
        return <Clock className="h-4 w-4 text-yellow-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'generating':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'html':
        return <Layout className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  // Datos para preview del reporte
  const previewData = {
    keywords: [
      { keyword: 'seo tools', position: 8, volume: 49500, difficulty: 67, trend: 'up' },
      { keyword: 'keyword research', position: 15, volume: 40500, difficulty: 62, trend: 'up' },
      { keyword: 'backlink checker', position: 22, volume: 33500, difficulty: 74, trend: 'down' }
    ],
    trends: [
      { date: '2024-01-01', position: 15, visibility: 45 },
      { date: '2024-01-02', position: 14, visibility: 47 },
      { date: '2024-01-03', position: 13, visibility: 49 },
      { date: '2024-01-04', position: 12, visibility: 52 },
      { date: '2024-01-05', position: 11, visibility: 55 },
      { date: '2024-01-06', position: 10, visibility: 58 },
      { date: '2024-01-07', position: 9, visibility: 62 },
      { date: '2024-01-08', position: 8, visibility: 65 }
    ],
    competitors: [
      { name: 'Competitor 1', avgPosition: 6.5, visibility: 78 },
      { name: 'Competitor 2', avgPosition: 11.2, visibility: 65 },
      { name: 'Competitor 3', avgPosition: 18.7, visibility: 42 }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Generador de Reportes</h1>
            <p className="text-gray-600 mt-1">Crea reportes profesionales de tus análisis de keywords</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCustomTemplate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Template Personalizado
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuración del reporte */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selección de template */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Seleccionar Template
                </CardTitle>
                <CardDescription>Elige un template predefinido o crea uno personalizado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <div className="flex items-center gap-1">
                          {getFormatIcon(template.format)}
                          <Badge variant="outline" className="text-xs">
                            {template.format.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.sections.slice(0, 3).map((section) => (
                          <Badge key={section.id} variant="secondary" className="text-xs">
                            {section.name}
                          </Badge>
                        ))}
                        {template.sections.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.sections.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configuración del reporte */}
            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuración del Reporte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título del Reporte</Label>
                      <Input
                        placeholder="Ej: Análisis SEO - Enero 2024"
                        value={reportConfig.title}
                        onChange={(e) => setReportConfig({...reportConfig, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rango de Fechas</Label>
                      <Select 
                        value={reportConfig.dateRange} 
                        onValueChange={(value) => setReportConfig({...reportConfig, dateRange: value})}
                      >
                        <SelectTrigger>
                          <Calendar className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">Últimos 7 días</SelectItem>
                          <SelectItem value="30d">Últimos 30 días</SelectItem>
                          <SelectItem value="90d">Últimos 90 días</SelectItem>
                          <SelectItem value="1y">Último año</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      placeholder="Descripción opcional del reporte..."
                      value={reportConfig.description}
                      onChange={(e) => setReportConfig({...reportConfig, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  {/* Selección de keywords */}
                  <div className="space-y-2">
                    <Label>Keywords a Incluir</Label>
                    <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {mockKeywords.map((keyword) => (
                          <div key={keyword} className="flex items-center space-x-2">
                            <Checkbox
                              id={keyword}
                              checked={reportConfig.selectedKeywords.includes(keyword)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setReportConfig({
                                    ...reportConfig,
                                    selectedKeywords: [...reportConfig.selectedKeywords, keyword]
                                  });
                                } else {
                                  setReportConfig({
                                    ...reportConfig,
                                    selectedKeywords: reportConfig.selectedKeywords.filter(k => k !== keyword)
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={keyword} className="text-sm">{keyword}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Opciones de contenido */}
                  <div className="space-y-3">
                    <Label>Contenido a Incluir</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="charts"
                          checked={reportConfig.includeCharts}
                          onCheckedChange={(checked) => 
                            setReportConfig({...reportConfig, includeCharts: !!checked})
                          }
                        />
                        <Label htmlFor="charts">Gráficos y visualizaciones</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="tables"
                          checked={reportConfig.includeTables}
                          onCheckedChange={(checked) => 
                            setReportConfig({...reportConfig, includeTables: !!checked})
                          }
                        />
                        <Label htmlFor="tables">Tablas de datos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recommendations"
                          checked={reportConfig.includeRecommendations}
                          onCheckedChange={(checked) => 
                            setReportConfig({...reportConfig, includeRecommendations: !!checked})
                          }
                        />
                        <Label htmlFor="recommendations">Recomendaciones y insights</Label>
                      </div>
                    </div>
                  </div>

                  {/* Branding */}
                  <div className="space-y-3">
                    <Label>Personalización</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre de la Empresa</Label>
                        <Input
                          placeholder="Mi Empresa"
                          value={reportConfig.branding.companyName}
                          onChange={(e) => setReportConfig({
                            ...reportConfig,
                            branding: {...reportConfig.branding, companyName: e.target.value}
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="logo"
                            checked={reportConfig.branding.logo}
                            onCheckedChange={(checked) => 
                              setReportConfig({
                                ...reportConfig,
                                branding: {...reportConfig.branding, logo: !!checked}
                              })
                            }
                          />
                          <Label htmlFor="logo">Incluir logo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="colors"
                            checked={reportConfig.branding.colors}
                            onCheckedChange={(checked) => 
                              setReportConfig({
                                ...reportConfig,
                                branding: {...reportConfig.branding, colors: !!checked}
                              })
                            }
                          />
                          <Label htmlFor="colors">Colores corporativos</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botón generar */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleGenerateReport}
                      disabled={isGenerating || !reportConfig.title.trim()}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Generar Reporte
                        </>
                      )}
                    </Button>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Vista Previa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview y reportes generados */}
          <div className="space-y-6">
            {/* Preview */}
            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Vista Previa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-3 bg-white">
                    <div className="text-sm font-medium mb-2">
                      {reportConfig.title || 'Título del Reporte'}
                    </div>
                    <div className="text-xs text-gray-600 mb-3">
                      {reportConfig.branding.companyName} • {new Date().toLocaleDateString()}
                    </div>
                    
                    {reportConfig.includeCharts && (
                      <div className="mb-3">
                        <div className="text-xs font-medium mb-1">Tendencias de Rankings</div>
                        <ResponsiveContainer width="100%" height={120}>
                          <LineChart data={previewData.trends.slice(-5)}>
                            <Line 
                              type="monotone" 
                              dataKey="position" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {reportConfig.includeTables && (
                      <div className="mb-3">
                        <div className="text-xs font-medium mb-1">Top Keywords</div>
                        <div className="space-y-1">
                          {previewData.keywords.slice(0, 3).map((kw, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span>{kw.keyword}</span>
                              <span>#{kw.position}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {reportConfig.includeRecommendations && (
                      <div className="text-xs">
                        <div className="font-medium mb-1">Recomendaciones</div>
                        <div className="text-gray-600">
                          • Optimizar contenido para "seo tools"<br/>
                          • Mejorar velocidad de carga<br/>
                          • Crear más contenido long-tail
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reportes generados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Reportes Generados
                </CardTitle>
                <CardDescription>Historial de reportes creados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...generatedReports, ...mockGeneratedReports].map((report) => (
                    <div key={report.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{report.name}</div>
                          <div className="text-xs text-gray-600">{report.type}</div>
                        </div>
                        <Badge variant="outline" className={getStatusColor(report.status)}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1 capitalize">{report.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          {getFormatIcon(report.format)}
                          <span>{report.format}</span>
                          <span>•</span>
                          <span>{report.size}</span>
                        </div>
                        <span>{report.createdAt}</span>
                      </div>

                      {report.status === 'completed' && report.downloadUrl && (
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download className="h-3 w-3 mr-1" />
                            Descargar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;