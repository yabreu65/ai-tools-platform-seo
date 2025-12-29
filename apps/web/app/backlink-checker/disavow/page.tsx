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
  Upload, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Filter,
  Search,
  ExternalLink,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface DisavowEntry {
  id: string;
  type: 'domain' | 'url';
  value: string;
  reason: string;
  dateAdded: string;
  status: 'active' | 'removed';
}

interface DisavowGenerateRequest {
  domain: string;
  entries: Array<{
    type: 'domain' | 'url';
    value: string;
    reason?: string;
  }>;
  options: {
    includeComments: boolean;
    groupByReason: boolean;
    format: 'google' | 'bing';
  };
}

interface DisavowGenerateResponse {
  success: boolean;
  data?: {
    fileId: string;
    filename: string;
    content: string;
    downloadUrl: string;
    statistics: {
      totalEntries: number;
      domains: number;
      urls: number;
      fileSize: number;
    };
  };
  message?: string;
}

export default function DisavowGeneratorPage() {
  const [domain, setDomain] = useState('');
  const [entries, setEntries] = useState<DisavowEntry[]>([]);
  const [newEntryType, setNewEntryType] = useState<'domain' | 'url'>('domain');
  const [newEntryValue, setNewEntryValue] = useState('');
  const [newEntryReason, setNewEntryReason] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [includeComments, setIncludeComments] = useState(true);
  const [groupByReason, setGroupByReason] = useState(false);
  const [format, setFormat] = useState<'google' | 'bing'>('google');
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'domain' | 'url'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [sampleEntries, setSampleEntries] = useState<any[]>([]);

  // Cargar ejemplos de entradas al montar el componente
  useEffect(() => {
    loadSampleEntries();
  }, []);

  const loadSampleEntries = async () => {
    try {
      const response = await fetch('/api/backlink-checker/disavow/generate');
      const result = await response.json();
      
      if (result.success && result.data?.sampleEntries) {
        setSampleEntries(result.data.sampleEntries);
      }
    } catch (error) {
      console.error('Error loading sample entries:', error);
    }
  };

  const handleAddEntry = () => {
    if (!newEntryValue.trim()) {
      toast.error('Por favor ingresa un dominio o URL');
      return;
    }

    // Validar formato
    if (newEntryType === 'domain') {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(newEntryValue)) {
        toast.error('Por favor ingresa un dominio válido (ej: ejemplo.com)');
        return;
      }
    } else {
      try {
        new URL(newEntryValue);
      } catch {
        toast.error('Por favor ingresa una URL válida');
        return;
      }
    }

    // Verificar duplicados
    const exists = entries.some(entry => 
      entry.value.toLowerCase() === newEntryValue.toLowerCase()
    );
    
    if (exists) {
      toast.error('Esta entrada ya existe en la lista');
      return;
    }

    const newEntry: DisavowEntry = {
      id: Date.now().toString(),
      type: newEntryType,
      value: newEntryValue.toLowerCase(),
      reason: newEntryReason || 'Sin especificar',
      dateAdded: new Date().toISOString(),
      status: 'active'
    };

    setEntries([...entries, newEntry]);
    setNewEntryValue('');
    setNewEntryReason('');
    toast.success('Entrada agregada exitosamente');
  };

  const handleBulkImport = () => {
    if (!bulkText.trim()) {
      toast.error('Por favor ingresa el texto para importar');
      return;
    }

    const lines = bulkText.split('\n').filter(line => line.trim());
    const newEntries: DisavowEntry[] = [];
    let errors = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('#') || !trimmedLine) return;

      let type: 'domain' | 'url' = 'domain';
      let value = trimmedLine;

      // Detectar si es dominio o URL
      if (trimmedLine.startsWith('http') || trimmedLine.includes('/')) {
        type = 'url';
        try {
          new URL(trimmedLine);
        } catch {
          errors++;
          return;
        }
      } else {
        // Validar dominio
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(trimmedLine)) {
          errors++;
          return;
        }
      }

      // Verificar duplicados
      const exists = entries.some(entry => 
        entry.value.toLowerCase() === value.toLowerCase()
      ) || newEntries.some(entry => 
        entry.value.toLowerCase() === value.toLowerCase()
      );

      if (!exists) {
        newEntries.push({
          id: `${Date.now()}-${index}`,
          type,
          value: value.toLowerCase(),
          reason: 'Importación masiva',
          dateAdded: new Date().toISOString(),
          status: 'active'
        });
      }
    });

    if (newEntries.length > 0) {
      setEntries([...entries, ...newEntries]);
      setBulkText('');
      toast.success(`${newEntries.length} entradas importadas${errors > 0 ? ` (${errors} errores)` : ''}`);
    } else {
      toast.error('No se pudieron importar entradas válidas');
    }
  };

  const handleRemoveEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
    setSelectedEntries(selectedEntries.filter(entryId => entryId !== id));
    toast.success('Entrada eliminada');
  };

  const handleRemoveSelected = () => {
    if (selectedEntries.length === 0) {
      toast.error('No hay entradas seleccionadas');
      return;
    }

    setEntries(entries.filter(entry => !selectedEntries.includes(entry.id)));
    setSelectedEntries([]);
    toast.success(`${selectedEntries.length} entradas eliminadas`);
  };

  const handleSelectEntry = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEntries([...selectedEntries, id]);
    } else {
      setSelectedEntries(selectedEntries.filter(entryId => entryId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(filteredEntries.map(entry => entry.id));
    } else {
      setSelectedEntries([]);
    }
  };

  const handleGenerateFile = async () => {
    if (!domain) {
      toast.error('Por favor ingresa el dominio');
      return;
    }

    if (entries.length === 0) {
      toast.error('Por favor agrega al menos una entrada');
      return;
    }

    setIsGenerating(true);

    try {
      const requestData: DisavowGenerateRequest = {
        domain,
        entries: entries.map(entry => ({
          type: entry.type,
          value: entry.value,
          reason: entry.reason
        })),
        options: {
          includeComments,
          groupByReason,
          format
        }
      };

      const response = await fetch('/api/backlink-checker/disavow/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result: DisavowGenerateResponse = await response.json();

      if (result.success && result.data) {
        // Crear y descargar el archivo
        const blob = new Blob([result.data.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(`Archivo disavow generado: ${result.data.filename}`);
      } else {
        toast.error(result.message || 'Error al generar el archivo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar el archivo disavow');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const typeMatch = filterType === 'all' || entry.type === filterType;
    const searchMatch = searchTerm === '' || 
      entry.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    return typeMatch && searchMatch;
  });

  const statistics = {
    total: entries.length,
    domains: entries.filter(e => e.type === 'domain').length,
    urls: entries.filter(e => e.type === 'url').length,
    selected: selectedEntries.length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Generador de Archivos Disavow</h1>
          <p className="text-muted-foreground">Crea archivos de desautorización para Google Search Console</p>
        </div>
      </div>

      {/* Configuración Inicial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Configuración del Archivo
          </CardTitle>
          <CardDescription>
            Configura los parámetros básicos para generar tu archivo disavow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="domain">Dominio Principal</Label>
              <Input
                id="domain"
                placeholder="ejemplo.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                El dominio para el cual generas el archivo disavow
              </p>
            </div>

            <div>
              <Label htmlFor="format">Formato del Archivo</Label>
              <select 
                id="format"
                value={format} 
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="google">Google Search Console</option>
                <option value="bing">Bing Webmaster Tools</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={includeComments}
                onCheckedChange={setIncludeComments}
              />
              <Label>Incluir comentarios explicativos</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={groupByReason}
                onCheckedChange={setGroupByReason}
              />
              <Label>Agrupar por razón</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">Total de entradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{statistics.domains}</div>
            <p className="text-xs text-muted-foreground">Dominios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{statistics.urls}</div>
            <p className="text-xs text-muted-foreground">URLs específicas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{statistics.selected}</div>
            <p className="text-xs text-muted-foreground">Seleccionadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Contenido */}
      <Tabs defaultValue="add" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add">Agregar Entradas</TabsTrigger>
          <TabsTrigger value="manage">Gestionar Lista</TabsTrigger>
          <TabsTrigger value="generate">Generar Archivo</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agregar Entrada Individual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Entrada Individual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tipo de Entrada</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="domain"
                        checked={newEntryType === 'domain'}
                        onChange={(e) => setNewEntryType(e.target.value as any)}
                      />
                      <span>Dominio completo</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="url"
                        checked={newEntryType === 'url'}
                        onChange={(e) => setNewEntryType(e.target.value as any)}
                      />
                      <span>URL específica</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newValue">
                    {newEntryType === 'domain' ? 'Dominio' : 'URL'}
                  </Label>
                  <Input
                    id="newValue"
                    placeholder={newEntryType === 'domain' ? 'ejemplo.com' : 'https://ejemplo.com/pagina'}
                    value={newEntryValue}
                    onChange={(e) => setNewEntryValue(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="newReason">Razón (opcional)</Label>
                  <Input
                    id="newReason"
                    placeholder="Ej: Spam, Baja calidad, Irrelevante"
                    value={newEntryReason}
                    onChange={(e) => setNewEntryReason(e.target.value)}
                  />
                </div>

                <Button onClick={handleAddEntry} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Entrada
                </Button>
              </CardContent>
            </Card>

            {/* Importación Masiva */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Importación Masiva
                </CardTitle>
                <CardDescription>
                  Pega una lista de dominios o URLs, uno por línea
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={`ejemplo1.com
https://ejemplo2.com/pagina
spam-site.net
# Comentarios empiezan con #
otro-dominio.com`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={8}
                />

                <Button onClick={handleBulkImport} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Entradas
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Ejemplos de Entradas */}
          {sampleEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Ejemplos de Entradas Comunes
                </CardTitle>
                <CardDescription>
                  Haz clic en cualquier ejemplo para agregarlo a tu lista
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {sampleEntries.map((sample, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewEntryType(sample.type);
                        setNewEntryValue(sample.value);
                        setNewEntryReason(sample.reason);
                      }}
                      className="justify-start text-left h-auto p-2"
                    >
                      <div>
                        <div className="font-medium text-xs">{sample.value}</div>
                        <div className="text-xs text-muted-foreground">{sample.reason}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Lista de Entradas ({filteredEntries.length})</span>
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
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="domain">Dominios</option>
                    <option value="url">URLs</option>
                  </select>
                  {selectedEntries.length > 0 && (
                    <Button onClick={handleRemoveSelected} variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar ({selectedEntries.length})
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredEntries.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <input
                      type="checkbox"
                      checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <span className="text-sm font-medium">Seleccionar todos</span>
                  </div>
                  
                  {filteredEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.id)}
                        onChange={(e) => handleSelectEntry(entry.id, e.target.checked)}
                      />
                      
                      <Badge className={entry.type === 'domain' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                        {entry.type === 'domain' ? 'Dominio' : 'URL'}
                      </Badge>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{entry.value}</span>
                          {entry.type === 'url' && (
                            <a href={entry.value} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 text-gray-400" />
                            </a>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Razón: {entry.reason} • Agregado: {new Date(entry.dateAdded).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleRemoveEntry(entry.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay entradas
                  </h3>
                  <p className="text-gray-600">
                    Agrega dominios o URLs para comenzar a crear tu archivo disavow
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Generar Archivo Disavow
              </CardTitle>
              <CardDescription>
                Revisa la configuración y genera tu archivo de desautorización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resumen de Configuración */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium mb-2">Configuración del Archivo</h4>
                  <ul className="text-sm space-y-1">
                    <li>Dominio: <span className="font-medium">{domain || 'No especificado'}</span></li>
                    <li>Formato: <span className="font-medium">{format === 'google' ? 'Google Search Console' : 'Bing Webmaster Tools'}</span></li>
                    <li>Comentarios: <span className="font-medium">{includeComments ? 'Incluidos' : 'No incluidos'}</span></li>
                    <li>Agrupación: <span className="font-medium">{groupByReason ? 'Por razón' : 'Sin agrupar'}</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Estadísticas</h4>
                  <ul className="text-sm space-y-1">
                    <li>Total de entradas: <span className="font-medium">{statistics.total}</span></li>
                    <li>Dominios: <span className="font-medium">{statistics.domains}</span></li>
                    <li>URLs específicas: <span className="font-medium">{statistics.urls}</span></li>
                    <li>Tamaño estimado: <span className="font-medium">~{Math.ceil(statistics.total * 50 / 1024)} KB</span></li>
                  </ul>
                </div>
              </div>

              {/* Información Importante */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">Información Importante</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• El archivo disavow debe subirse a Google Search Console</li>
                      <li>• Los cambios pueden tardar semanas o meses en tener efecto</li>
                      <li>• Solo desautoriza enlaces que realmente dañen tu sitio</li>
                      <li>• Revisa cuidadosamente antes de aplicar</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botón de Generación */}
              <Button 
                onClick={handleGenerateFile} 
                disabled={isGenerating || !domain || entries.length === 0}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando archivo...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generar y Descargar Archivo Disavow
                  </>
                )}
              </Button>

              {(!domain || entries.length === 0) && (
                <div className="text-center text-sm text-muted-foreground">
                  {!domain && 'Por favor especifica un dominio. '}
                  {entries.length === 0 && 'Por favor agrega al menos una entrada.'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}