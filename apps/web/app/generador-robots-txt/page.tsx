'use client';

import { useState } from 'react';
// import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Bot, 
  Download, 
  Settings, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Plus,
  Trash2,
  Copy,
  Eye,
  Shield,
  Search
} from 'lucide-react';
import { usePlan } from '@/contexts/PlanContext';

interface RobotsConfig {
  siteUrl: string;
  siteType: string;
  allowAll: boolean;
  disallowPaths: string[];
  allowPaths: string[];
  crawlDelay: number;
  sitemapUrl: string;
  customRules: string;
}

interface RobotsResult {
  robotsContent: string;
  config: RobotsConfig;
  generatedAt: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export default function GeneradorRobotsTxt() {
  // const { data: session } = useSession();
  const [config, setConfig] = useState<RobotsConfig>({
    siteUrl: '',
    siteType: 'website',
    allowAll: true,
    disallowPaths: ['/admin', '/private', '/temp'],
    allowPaths: [],
    crawlDelay: 0,
    sitemapUrl: '',
    customRules: ''
  });

  const [result, setResult] = useState<RobotsResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('config');

  const { currentPlan } = usePlan();
  const userPlan = currentPlan?.id || 'free';

  const siteTypes = [
    { value: 'website', label: 'Sitio Web General' },
    { value: 'blog', label: 'Blog' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'corporate', label: 'Corporativo' },
    { value: 'news', label: 'Noticias' }
  ];

  const handleGenerate = async () => {
    if (!config.siteUrl.trim()) {
      toast.error('Por favor ingresa la URL del sitio web');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setActiveTab('result');

    // Simular progreso
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    try {
      const response = await fetch('/api/seo/robots-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar robots.txt');
      }

      setResult({
        robotsContent: data.robotsContent,
        config,
        generatedAt: new Date().toISOString()
      });

      toast.success('robots.txt generado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar robots.txt');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleValidate = async () => {
    if (!result?.robotsContent) {
      toast.error('Primero genera el archivo robots.txt');
      return;
    }

    setIsValidating(true);
    setProgress(0);

    // Simular progreso
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    try {
      const response = await fetch('/api/seo/robots-validator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ robotsContent: result.robotsContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al validar robots.txt');
      }

      setValidation({
        isValid: data.isValid,
        errors: data.errors || [],
        warnings: data.warnings || [],
        suggestions: data.suggestions || []
      });

      toast.success('Validación completada');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al validar robots.txt');
    } finally {
      setIsValidating(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const blob = new Blob([result.robotsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Robots.txt descargado exitosamente');
  };

  const handleCopy = () => {
    if (!result) return;

    navigator.clipboard.writeText(result.robotsContent);
    toast.success('Robots.txt copiado al portapapeles');
  };

  const addDisallowPath = () => {
    setConfig(prev => ({
      ...prev,
      disallowPaths: [...prev.disallowPaths, '']
    }));
  };

  const removeDisallowPath = (index: number) => {
    setConfig(prev => ({
      ...prev,
      disallowPaths: prev.disallowPaths.filter((_, i) => i !== index)
    }));
  };

  const updateDisallowPath = (index: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      disallowPaths: prev.disallowPaths.map((path, i) => 
        i === index ? value : path
      )
    }));
  };

  const addAllowPath = () => {
    setConfig(prev => ({
      ...prev,
      allowPaths: [...prev.allowPaths, '']
    }));
  };

  const removeAllowPath = (index: number) => {
    setConfig(prev => ({
      ...prev,
      allowPaths: prev.allowPaths.filter((_, i) => i !== index)
    }));
  };

  const updateAllowPath = (index: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      allowPaths: prev.allowPaths.map((path, i) => 
        i === index ? value : path
      )
    }));
  };

  const loadTemplate = (type: string) => {
    const templates: Record<string, Partial<RobotsConfig>> = {
      ecommerce: {
        disallowPaths: ['/admin', '/checkout', '/cart', '/search', '/account'],
        allowPaths: ['/products', '/categories'],
        crawlDelay: 1
      },
      blog: {
        disallowPaths: ['/admin', '/wp-admin', '/private', '/drafts'],
        allowPaths: ['/posts', '/articles', '/blog'],
        crawlDelay: 0
      },
      portfolio: {
        disallowPaths: ['/admin', '/private'],
        allowPaths: ['/projects', '/gallery', '/work'],
        crawlDelay: 0
      }
    };

    const template = templates[type];
    if (template) {
      setConfig(prev => ({ ...prev, ...template }));
      toast.success(`Plantilla ${type} aplicada`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-orange-100 rounded-xl">
            <Bot className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Generador de Robots.txt
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Crea archivos robots.txt optimizados para controlar cómo los motores de búsqueda rastrean tu sitio web
        </p>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <Badge variant={userPlan === 'premium' ? 'default' : 'secondary'} className="text-sm">
            Plan {userPlan === 'free' ? 'Gratuito' : userPlan === 'premium' ? 'Premium' : 'Trial'}
          </Badge>
          <span className="text-sm text-gray-500">
            {userPlan === 'free' ? 'Plantillas básicas' : 'Plantillas avanzadas + validación'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Bot className="h-5 w-5 text-orange-600 animate-pulse" />
            <span className="text-sm font-medium">Generando robots.txt...</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Avanzado
          </TabsTrigger>
          <TabsTrigger value="result" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Resultado
          </TabsTrigger>
        </TabsList>

        {/* Configuración Básica */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Configuración Básica
              </CardTitle>
              <CardDescription>
                Configura los parámetros principales para generar tu robots.txt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteUrl">URL del Sitio Web *</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  placeholder="https://ejemplo.com"
                  value={config.siteUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">
                  Ingresa la URL principal de tu sitio web
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteType">Tipo de Sitio</Label>
                  <Select
                    value={config.siteType}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, siteType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {siteTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Selecciona el tipo para aplicar reglas optimizadas
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowAll">Permitir Todo por Defecto</Label>
                      <p className="text-xs text-gray-500">Permite el acceso a todo el sitio</p>
                    </div>
                    <Switch
                      checked={config.allowAll}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, allowAll: checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* Plantillas Rápidas */}
              <div className="space-y-3">
                <Label>Plantillas Rápidas</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadTemplate('ecommerce')}
                  >
                    E-commerce
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadTemplate('blog')}
                  >
                    Blog
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadTemplate('portfolio')}
                  >
                    Portfolio
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Aplica configuraciones predefinidas según el tipo de sitio
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !config.siteUrl.trim()}
                  size="lg"
                  className="px-8"
                >
                  {isGenerating ? (
                    <>
                      <Bot className="mr-2 h-4 w-4 animate-pulse" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Generar Robots.txt
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración Avanzada */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rutas Bloqueadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Rutas Bloqueadas (Disallow)
                </CardTitle>
                <CardDescription>
                  Especifica qué rutas no deben ser rastreadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.disallowPaths.map((path, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="/admin, /private, /temp"
                      value={path}
                      onChange={(e) => updateDisallowPath(index, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDisallowPath(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addDisallowPath}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Ruta Bloqueada
                </Button>
              </CardContent>
            </Card>

            {/* Rutas Permitidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Rutas Permitidas (Allow)
                </CardTitle>
                <CardDescription>
                  Especifica rutas que deben ser rastreadas explícitamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.allowPaths.map((path, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="/products, /blog, /public"
                      value={path}
                      onChange={(e) => updateAllowPath(index, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAllowPath(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addAllowPath}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Ruta Permitida
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Configuración Adicional */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="crawlDelay">Crawl-Delay (segundos)</Label>
                  <Input
                    id="crawlDelay"
                    type="number"
                    min="0"
                    max="10"
                    value={config.crawlDelay}
                    onChange={(e) => setConfig(prev => ({ ...prev, crawlDelay: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-sm text-gray-500">
                    Tiempo de espera entre solicitudes (0 = sin límite)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sitemapUrl">URL del Sitemap (opcional)</Label>
                  <Input
                    id="sitemapUrl"
                    type="url"
                    placeholder="https://ejemplo.com/sitemap.xml"
                    value={config.sitemapUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, sitemapUrl: e.target.value }))}
                  />
                  <p className="text-sm text-gray-500">
                    Deja vacío para generar automáticamente
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customRules">Reglas Personalizadas</Label>
                <Textarea
                  id="customRules"
                  placeholder="# Reglas personalizadas&#10;User-agent: Googlebot&#10;Disallow: /search"
                  value={config.customRules}
                  onChange={(e) => setConfig(prev => ({ ...prev, customRules: e.target.value }))}
                  rows={4}
                  disabled={userPlan === 'free'}
                />
                {userPlan === 'free' ? (
                  <p className="text-sm text-gray-500">
                    Reglas personalizadas disponibles en plan Premium
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Agrega reglas personalizadas en formato robots.txt
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resultado */}
        <TabsContent value="result" className="space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Resumen */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Robots.txt Generado Exitosamente
                  </CardTitle>
                  <CardDescription>
                    Tu archivo robots.txt ha sido generado y está listo para usar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar Archivo
                    </Button>
                    <Button variant="outline" onClick={handleCopy}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar Contenido
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleValidate}
                      disabled={isValidating}
                    >
                      {isValidating ? (
                        <>
                          <Search className="mr-2 h-4 w-4 animate-spin" />
                          Validando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Validar
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Información del archivo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.robotsContent.split('\n').length}
                      </div>
                      <div className="text-sm text-gray-600">Líneas</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(result.robotsContent.length / 1024) || 1}KB
                      </div>
                      <div className="text-sm text-gray-600">Tamaño</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {validation?.isValid ? 'Válido' : validation ? 'Errores' : 'No validado'}
                      </div>
                      <div className="text-sm text-gray-600">Estado</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Validación */}
              {validation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Validación del Robots.txt
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {validation.errors.length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium mb-2">Errores encontrados:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {validation.errors.map((error, index) => (
                              <li key={index} className="text-sm">{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {validation.warnings.length > 0 && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium mb-2">Advertencias:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {validation.warnings.map((warning, index) => (
                              <li key={index} className="text-sm">{warning}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {validation.suggestions.length > 0 && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium mb-2">Sugerencias:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {validation.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm">{suggestion}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Preview del contenido */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Vista Previa del Robots.txt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {result.robotsContent}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay robots.txt generado
                </h3>
                <p className="text-gray-500 mb-4">
                  Configura los parámetros y genera tu archivo robots.txt
                </p>
                <Button onClick={() => setActiveTab('config')}>
                  Ir a Configuración
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}