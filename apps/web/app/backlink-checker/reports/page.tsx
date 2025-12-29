'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Share2, 
  Calendar, 
  Settings, 
  Eye,
  Trash2,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Filter,
  Search,
  Mail,
  Palette,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportGenerateRequest {
  domain: string;
  reportType: 'comprehensive' | 'executive' | 'technical' | 'competitive';
  outputFormat: 'pdf' | 'excel' | 'html';
  sections: string[];
  dateRange: {
    start: string;
    end: string;
  };
  includeCharts: boolean;
  includeTables: boolean;
  includeRawData: boolean;
  branding: {
    companyName: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  recipients: string[];
  schedule?: {
    frequency: 'once' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
}

interface ReportGenerateResponse {
  success: boolean;
  data?: {
    reportId: string;
    filename: string;
    estimatedCompletionTime: number;
    downloadUrl?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
  };
  message?: string;
}

interface ExistingReport {
  id: string;
  domain: string;
  reportType: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  fileSize?: number;
}

export default function ReportsPage() {
  const [domain, setDomain] = useState('');
  const [reportType, setReportType] = useState<'comprehensive' | 'executive' | 'technical' | 'competitive'>('comprehensive');
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'excel' | 'html'>('pdf');
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'overview', 'backlink-profile', 'toxic-links', 'opportunities'
  ]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [branding, setBranding] = useState({
    companyName: '',
    logoUrl: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b'
  });
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState('');
  const [schedule, setSchedule] = useState({
    frequency: 'once' as 'once' | 'weekly' | 'monthly',
    dayOfWeek: 1,
    dayOfMonth: 1
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingReports, setExistingReports] = useState<ExistingReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const availableSections = [
    { id: 'overview', label: 'Resumen Ejecutivo', description: 'Métricas clave y tendencias' },
    { id: 'backlink-profile', label: 'Perfil de Backlinks', description: 'Análisis detallado del perfil' },
    { id: 'toxic-links', label: 'Enlaces Tóxicos', description: 'Identificación de enlaces dañinos' },
    { id: 'opportunities', label: 'Oportunidades', description: 'Oportunidades de link building' },
    { id: 'competitor-analysis', label: 'Análisis Competitivo', description: 'Comparación con competidores' },
    { id: 'recommendations', label: 'Recomendaciones', description: 'Acciones sugeridas' },
    { id: 'appendix', label: 'Apéndice', description: 'Datos técnicos adicionales' }
  ];

  // Cargar reportes existentes al montar el componente
  useEffect(() => {
    loadExistingReports();
  }, []);

  const loadExistingReports = async () => {
    try {
      const response = await fetch('/api/backlink-checker/reports/generate');
      const result = await response.json();
      
      if (result.success && result.data?.reports) {
        setExistingReports(result.data.reports);
      }
    } catch (error) {
      console.error('Error loading existing reports:', error);
    }
  };

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleAddRecipient = () => {
    if (!newRecipient.trim()) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    if (recipients.includes(newRecipient)) {
      toast.error('Este email ya está en la lista');
      return;
    }

    setRecipients([...recipients, newRecipient]);
    setNewRecipient('');
    toast.success('Destinatario agregado');
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
    toast.success('Destinatario eliminado');
  };

  const handleGenerateReport = async () => {
    if (!domain) {
      toast.error('Por favor ingresa el dominio');
      return;
    }

    if (selectedSections.length === 0) {
      toast.error('Por favor selecciona al menos una sección');
      return;
    }

    setIsGenerating(true);

    try {
      const requestData: ReportGenerateRequest = {
        domain,
        reportType,
        outputFormat,
        sections: selectedSections,
        dateRange,
        includeCharts,
        includeTables,
        includeRawData,
        branding,
        recipients,
        schedule: schedule.frequency !== 'once' ? schedule : undefined
      };

      const response = await fetch('/api/backlink-checker/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result: ReportGenerateResponse = await response.json();

      if (result.success && result.data) {
        toast.success(`Reporte generado: ${result.data.filename}`);
        
        // Recargar la lista de reportes
        await loadExistingReports();
        
        // Si el reporte está completado inmediatamente, descargarlo
        if (result.data.status === 'completed' && result.data.downloadUrl) {
          window.open(result.data.downloadUrl, '_blank');
        }
      } else {
        toast.error(result.message || 'Error al generar el reporte');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (report: ExistingReport) => {
    if (report.downloadUrl) {
      window.open(report.downloadUrl, '_blank');
      toast.success('Descargando reporte...');
    } else {
      toast.error('URL de descarga no disponible');
    }
  };

  const handleShareReport = (report: ExistingReport) => {
    if (report.downloadUrl) {
      navigator.clipboard.writeText(report.downloadUrl).then(() => {
        toast.success('Enlace copiado al portapapeles');
      }).catch(() => {
        toast.error('Error al copiar el enlace');
      });
    } else {
      toast.error('No se puede compartir este reporte');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      // Aquí iría la llamada a la API para eliminar el reporte
      setExistingReports(prev => prev.filter(r => r.id !== reportId));
      toast.success('Reporte eliminado');
    } catch (error) {
      toast.error('Error al eliminar el reporte');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'completed': return 'Completado';
      case 'failed': return 'Fallido';
      default: return status;
    }
  };

  const filteredReports = existingReports.filter(report => {
    const statusMatch = filterStatus === 'all' || report.status === filterStatus;
    const searchMatch = searchTerm === '' || 
      report.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.filename.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  const reportTypeLabels = {
    comprehensive: 'Completo',
    executive: 'Ejecutivo',
    technical: 'Técnico',
    competitive: 'Competitivo'
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Generador de Reportes</h1>
          <p className="text-muted-foreground">Crea reportes personalizados de análisis de backlinks</p>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generar Reporte</TabsTrigger>
          <TabsTrigger value="history">Historial de Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {/* Configuración Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración Básica
              </CardTitle>
              <CardDescription>
                Define los parámetros principales del reporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="domain">Dominio</Label>
                  <Input
                    id="domain"
                    placeholder="ejemplo.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="reportType">Tipo de Reporte</Label>
                  <select 
                    id="reportType"
                    value={reportType} 
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="comprehensive">Completo</option>
                    <option value="executive">Ejecutivo</option>
                    <option value="technical">Técnico</option>
                    <option value="competitive">Competitivo</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="outputFormat">Formato de Salida</Label>
                  <select 
                    id="outputFormat"
                    value={outputFormat} 
                    onChange={(e) => setOutputFormat(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="html">HTML</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Fecha de Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Fecha de Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secciones del Reporte */}
          <Card>
            <CardHeader>
              <CardTitle>Secciones del Reporte</CardTitle>
              <CardDescription>
                Selecciona las secciones que deseas incluir en el reporte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSections.map((section) => (
                  <div key={section.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section.id)}
                      onChange={() => handleSectionToggle(section.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{section.label}</div>
                      <div className="text-sm text-muted-foreground">{section.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Opciones de Contenido */}
          <Card>
            <CardHeader>
              <CardTitle>Opciones de Contenido</CardTitle>
              <CardDescription>
                Personaliza el contenido y formato del reporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={includeCharts}
                    onCheckedChange={setIncludeCharts}
                  />
                  <Label>Incluir gráficos</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={includeTables}
                    onCheckedChange={setIncludeTables}
                  />
                  <Label>Incluir tablas</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={includeRawData}
                    onCheckedChange={setIncludeRawData}
                  />
                  <Label>Incluir datos en bruto</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personalización de Marca */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Personalización de Marca
              </CardTitle>
              <CardDescription>
                Personaliza el reporte con tu marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Nombre de la Empresa</Label>
                  <Input
                    id="companyName"
                    placeholder="Mi Empresa"
                    value={branding.companyName}
                    onChange={(e) => setBranding(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="logoUrl">URL del Logo</Label>
                  <Input
                    id="logoUrl"
                    placeholder="https://ejemplo.com/logo.png"
                    value={branding.logoUrl}
                    onChange={(e) => setBranding(prev => ({ ...prev, logoUrl: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="primaryColor">Color Primario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16"
                    />
                    <Input
                      value={branding.primaryColor}
                      onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondaryColor">Color Secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-16"
                    />
                    <Input
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destinatarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Destinatarios
              </CardTitle>
              <CardDescription>
                Agrega emails para enviar el reporte automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="email@ejemplo.com"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                />
                <Button onClick={handleAddRecipient}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>

              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recipients.map((email, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <button
                        onClick={() => handleRemoveRecipient(email)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Programación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Programación
              </CardTitle>
              <CardDescription>
                Programa la generación automática del reporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Frecuencia</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="once"
                      checked={schedule.frequency === 'once'}
                      onChange={(e) => setSchedule(prev => ({ ...prev, frequency: e.target.value as any }))}
                    />
                    <span>Una vez</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="weekly"
                      checked={schedule.frequency === 'weekly'}
                      onChange={(e) => setSchedule(prev => ({ ...prev, frequency: e.target.value as any }))}
                    />
                    <span>Semanal</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="monthly"
                      checked={schedule.frequency === 'monthly'}
                      onChange={(e) => setSchedule(prev => ({ ...prev, frequency: e.target.value as any }))}
                    />
                    <span>Mensual</span>
                  </label>
                </div>
              </div>

              {schedule.frequency === 'weekly' && (
                <div>
                  <Label htmlFor="dayOfWeek">Día de la Semana</Label>
                  <select 
                    id="dayOfWeek"
                    value={schedule.dayOfWeek} 
                    onChange={(e) => setSchedule(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value={1}>Lunes</option>
                    <option value={2}>Martes</option>
                    <option value={3}>Miércoles</option>
                    <option value={4}>Jueves</option>
                    <option value={5}>Viernes</option>
                    <option value={6}>Sábado</option>
                    <option value={0}>Domingo</option>
                  </select>
                </div>
              )}

              {schedule.frequency === 'monthly' && (
                <div>
                  <Label htmlFor="dayOfMonth">Día del Mes</Label>
                  <Input
                    id="dayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    value={schedule.dayOfMonth}
                    onChange={(e) => setSchedule(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botón de Generación */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={handleGenerateReport} 
                disabled={isGenerating || !domain || selectedSections.length === 0}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando reporte...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </>
                )}
              </Button>

              {(!domain || selectedSections.length === 0) && (
                <div className="text-center text-sm text-muted-foreground mt-2">
                  {!domain && 'Por favor especifica un dominio. '}
                  {selectedSections.length === 0 && 'Por favor selecciona al menos una sección.'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Reportes Generados ({filteredReports.length})</span>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendientes</option>
                    <option value="processing">Procesando</option>
                    <option value="completed">Completados</option>
                    <option value="failed">Fallidos</option>
                  </select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredReports.length > 0 ? (
                <div className="space-y-3">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                          {getStatusLabel(report.status)}
                        </Badge>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{report.filename}</span>
                          <Badge variant="outline" className="text-xs">
                            {reportTypeLabels[report.reportType as keyof typeof reportTypeLabels] || report.reportType}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Dominio: {report.domain} • Creado: {new Date(report.createdAt).toLocaleString()}
                          {report.fileSize && ` • Tamaño: ${(report.fileSize / 1024 / 1024).toFixed(2)} MB`}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {report.status === 'completed' && report.downloadUrl && (
                          <>
                            <Button
                              onClick={() => handleDownloadReport(report)}
                              variant="outline"
                              size="sm"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleShareReport(report)}
                              variant="outline"
                              size="sm"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => handleDeleteReport(report.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay reportes
                  </h3>
                  <p className="text-gray-600">
                    Los reportes generados aparecerán aquí
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}