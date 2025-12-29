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
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  Globe, 
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
  Search,
  Image,
  Video,
  Calendar,
  BarChart3
} from 'lucide-react';

interface SitemapConfig {
  siteUrl: string;
  crawlDepth: number;
  includeImages: boolean;
  includeVideos: boolean;
  excludePatterns: string[];
  customUrls: string[];
  changeFreq: string;
  priority: number;
  lastMod: boolean;
}

interface SitemapResult {
  sitemapXml: string;
  urlCount: number;
  imageCount: number;
  videoCount: number;
  isValid: boolean;
  size: number;
  generatedAt: string;
  planUsed?: string;
  limitsApplied?: {
    maxUrls: number;
    maxDepth: number;
    videosAllowed: boolean;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export default function GeneradorSitemapXml() {
  // const { data: session } = useSession();
  const session: { user?: any } | null = null; // Temporal para testing
  const [config, setConfig] = useState<SitemapConfig>({
    siteUrl: '',
    crawlDepth: 3,
    includeImages: true,
    includeVideos: false,
    excludePatterns: ['/admin', '/private', '/temp'],
    customUrls: [],
    changeFreq: 'weekly',
    priority: 0.8,
    lastMod: true
  });

  const [result, setResult] = useState<SitemapResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('config');

  const userPlan: string = 'free'; // Sesión desactivada en testing; usar plan por defecto

  const changeFreqOptions = [
    { value: 'always', label: 'Siempre' },
    { value: 'hourly', label: 'Cada hora' },
    { value: 'daily', label: 'Diariamente' },
    { value: 'weekly', label: 'Semanalmente' },
    { value: 'monthly', label: 'Mensualmente' },
    { value: 'yearly', label: 'Anualmente' },
    { value: 'never', label: 'Nunca' }
  ];

  const validateInput = (): string[] => {
    const errors: string[] = [];
    
    if (!config.siteUrl.trim()) {
      errors.push('La URL del sitio web es requerida');
    } else {
      try {
        const url = new URL(config.siteUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.push('La URL debe usar protocolo HTTP o HTTPS');
        }
      } catch {
        errors.push('La URL del sitio web no es válida');
      }
    }
    
    if (config.crawlDepth < 1 || config.crawlDepth > (userPlan === 'free' ? 3 : 10)) {
      errors.push(`La profundidad debe estar entre 1 y ${userPlan === 'free' ? 3 : 10}`);
    }
    
    if (config.priority < 0.1 || config.priority > 1.0) {
      errors.push('La prioridad debe estar entre 0.1 y 1.0');
    }
    
    // Validar URLs personalizadas
    config.customUrls.forEach((url, index) => {
      if (url.trim()) {
        try {
          new URL(url);
        } catch {
          errors.push(`URL personalizada ${index + 1} no es válida: ${url}`);
        }
      }
    });
    
    return errors;
  };

  const handleGenerate = async () => {
    // Validar entrada
    const validationErrors = validateInput();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResult(null);
    setValidation(null);
    setActiveTab('result');

    // Simular progreso
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    try {
      const response = await fetch('/api/seo/sitemap-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejo específico de errores de la API
        if (response.status === 400) {
          if (data.details) {
            // Errores de validación específicos
            data.details.forEach((detail: any) => {
              toast.error(`${detail.field}: ${detail.message}`);
            });
          } else {
            toast.error(data.error || 'Datos de configuración inválidos');
          }
        } else if (response.status === 403) {
          toast.error(data.error || 'Límites del plan excedidos', {
            description: data.currentPlan ? `Plan actual: ${data.currentPlan}` : undefined
          });
        } else if (response.status === 413) {
          toast.error(data.error || 'Sitemap demasiado grande', {
            description: data.currentSize ? `Tamaño: ${data.currentSize}` : undefined
          });
        } else {
          toast.error(data.error || 'Error generando sitemap XML');
        }
        return;
      }

      setResult(data);
      setProgress(100);
      
      // Auto-validar el resultado
      await validateSitemap(data.sitemapXml);
      
      toast.success('Sitemap XML generado exitosamente', {
        description: `${data.urlCount} URLs encontradas`
      });

      // Registrar uso de la herramienta
      try {
        await fetch('/api/analytics/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool: 'Generador de Sitemap XML',
            slug: 'generador-sitemap-xml',
            usedAt: new Date().toISOString(),
            metadata: {
              urlCount: data.urlCount,
              plan: userPlan,
              crawlDepth: config.crawlDepth
            }
          })
        });
      } catch (error) {
        console.warn('Error registrando uso:', error);
      }

    } catch (error) {
      console.error('Error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Error de conexión. Verifica tu conexión a internet.');
      } else if (error instanceof SyntaxError) {
        toast.error('Error procesando la respuesta del servidor');
      } else {
        toast.error(error instanceof Error ? error.message : 'Error inesperado generando sitemap XML');
      }
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const validateSitemap = async (content?: string) => {
    const sitemapContent = content || result?.sitemapXml;
    if (!sitemapContent) return;

    setIsValidating(true);

    try {
      // Simulación de validación más robusta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];
      
      // Validaciones básicas de estructura XML
      if (!sitemapContent.includes('<urlset')) {
        errors.push('Falta el elemento raíz <urlset>');
      }
      
      if (!sitemapContent.includes('</urlset>')) {
        errors.push('Falta el cierre del elemento </urlset>');
      }
      
      if (!sitemapContent.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
        errors.push('Falta el namespace requerido para sitemaps');
      }
      
      // Contar elementos
      const urlCount = (sitemapContent.match(/<url>/g) || []).length;
      const imageCount = (sitemapContent.match(/<image:image>/g) || []).length;
      const videoCount = (sitemapContent.match(/<video:video>/g) || []).length;
      
      if (urlCount === 0) {
        errors.push('El sitemap no contiene URLs');
      }
      
      // Validaciones de límites
      if (urlCount > 50000) {
        errors.push('El sitemap excede el límite de 50,000 URLs');
      } else if (urlCount > 10000) {
        warnings.push(`El sitemap contiene ${urlCount} URLs. Considera dividirlo en múltiples sitemaps.`);
      }
      
      // Validar tamaño
      const sizeInMB = new Blob([sitemapContent]).size / (1024 * 1024);
      if (sizeInMB > 50) {
        errors.push(`El sitemap excede el límite de 50MB (${sizeInMB.toFixed(2)}MB)`);
      } else if (sizeInMB > 10) {
        warnings.push(`El sitemap es grande (${sizeInMB.toFixed(2)}MB). Considera optimizarlo.`);
      }
      
      // Validar URLs duplicadas
      const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
      if (urlMatches) {
        const urls = urlMatches.map(match => match.replace(/<\/?loc>/g, ''));
        const uniqueUrls = new Set(urls);
        if (urls.length !== uniqueUrls.size) {
          warnings.push(`Se encontraron ${urls.length - uniqueUrls.size} URLs duplicadas`);
        }
      }
      
      // Validar fechas de modificación
      const lastmodMatches = sitemapContent.match(/<lastmod>(.*?)<\/lastmod>/g);
      if (lastmodMatches) {
        const invalidDates = lastmodMatches.filter(match => {
          const date = match.replace(/<\/?lastmod>/g, '');
          return isNaN(Date.parse(date));
        });
        
        if (invalidDates.length > 0) {
          warnings.push(`Se encontraron ${invalidDates.length} fechas de modificación inválidas`);
        }
      }
      
      // Validar prioridades
      const priorityMatches = sitemapContent.match(/<priority>(.*?)<\/priority>/g);
      if (priorityMatches) {
        const invalidPriorities = priorityMatches.filter(match => {
          const priority = parseFloat(match.replace(/<\/?priority>/g, ''));
          return isNaN(priority) || priority < 0 || priority > 1;
        });
        
        if (invalidPriorities.length > 0) {
          warnings.push(`Se encontraron ${invalidPriorities.length} valores de prioridad inválidos`);
        }
      }
      
      // Sugerencias
      if (imageCount === 0 && config.includeImages) {
        suggestions.push('Considera agregar imágenes al sitemap para mejor SEO');
      }
      
      if (!sitemapContent.includes('<lastmod>')) {
        suggestions.push('Revisa las fechas de modificación para mantenerlas actualizadas');
      }
      
      if (urlCount < 10) {
        suggestions.push('El sitemap tiene pocas URLs, verifica la configuración de crawling');
      }
      
      const isValid = errors.length === 0;
      
      const validation: ValidationResult = {
        isValid,
        errors,
        warnings,
        suggestions
      };

      setValidation(validation);
      
      if (isValid && warnings.length === 0) {
        toast.success('Sitemap XML validado correctamente');
      } else if (isValid && warnings.length > 0) {
        toast.warning(`Sitemap válido con ${warnings.length} advertencias`);
      } else {
        toast.error(`Sitemap inválido: ${errors.length} errores encontrados`);
      }

    } catch (error) {
      console.error('Error:', error);
      setValidation({
        isValid: false,
        errors: ['Error interno validando el sitemap'],
        warnings: [],
        suggestions: []
      });
      toast.error('Error validando sitemap XML');
    } finally {
      setIsValidating(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const blob = new Blob([result.sitemapXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Sitemap XML descargado exitosamente');
  };

  const handleCopy = () => {
    if (!result) return;

    navigator.clipboard.writeText(result.sitemapXml);
    toast.success('Sitemap XML copiado al portapapeles');
  };

  const addExcludePattern = () => {
    setConfig(prev => ({
      ...prev,
      excludePatterns: [...prev.excludePatterns, '']
    }));
  };

  const removeExcludePattern = (index: number) => {
    setConfig(prev => ({
      ...prev,
      excludePatterns: prev.excludePatterns.filter((_, i) => i !== index)
    }));
  };

  const updateExcludePattern = (index: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      excludePatterns: prev.excludePatterns.map((pattern, i) => 
        i === index ? value : pattern
      )
    }));
  };

  const addCustomUrl = () => {
    setConfig(prev => ({
      ...prev,
      customUrls: [...prev.customUrls, '']
    }));
  };

  const removeCustomUrl = (index: number) => {
    setConfig(prev => ({
      ...prev,
      customUrls: prev.customUrls.filter((_, i) => i !== index)
    }));
  };

  const updateCustomUrl = (index: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      customUrls: prev.customUrls.map((url, i) => 
        i === index ? value : url
      )
    }));
  };

  const loadPreset = (type: string) => {
    const presets: Record<string, Partial<SitemapConfig>> = {
      basic: {
        crawlDepth: 2,
        includeImages: false,
        includeVideos: false,
        changeFreq: 'monthly',
        priority: 0.5
      },
      comprehensive: {
        crawlDepth: 5,
        includeImages: true,
        includeVideos: true,
        changeFreq: 'weekly',
        priority: 0.8
      },
      ecommerce: {
        crawlDepth: 4,
        includeImages: true,
        includeVideos: false,
        excludePatterns: ['/admin', '/checkout', '/cart', '/account'],
        changeFreq: 'daily',
        priority: 0.9
      }
    };

    const preset = presets[type];
    if (preset) {
      setConfig(prev => ({ ...prev, ...preset }));
      toast.success(`Configuración ${type} aplicada`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <Globe className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Generador de Sitemap XML
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Crea sitemaps XML optimizados para ayudar a los motores de búsqueda a indexar tu sitio web
        </p>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <Badge variant={String(userPlan) === 'premium' ? 'default' : 'secondary'} className="text-sm">
            Plan {String(userPlan) === 'free' ? 'Gratuito' : String(userPlan) === 'premium' ? 'Premium' : 'Trial'}
          </Badge>
          <span className="text-sm text-gray-500">
            {userPlan === 'free' ? 'Hasta 100 URLs' : 'URLs ilimitadas + crawling avanzado'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-5 w-5 text-green-600 animate-pulse" />
            <span className="text-sm font-medium">Generando sitemap XML...</span>
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
            <Search className="h-4 w-4" />
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
                <Globe className="h-5 w-5" />
                Configuración Básica
              </CardTitle>
              <CardDescription>
                Configura los parámetros principales para generar tu sitemap XML
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
                  Ingresa la URL principal de tu sitio web para comenzar el crawling
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crawlDepth">Profundidad de Crawling: {config.crawlDepth}</Label>
                    <Slider
                      min={1}
                      max={String(userPlan) === 'free' ? 3 : 10}
                      step={1}
                      value={[config.crawlDepth]}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, crawlDepth: value[0] }))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500">
                      Niveles de profundidad para explorar el sitio
                      {userPlan === 'free' && ' (máximo 3 en plan gratuito)'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridad por Defecto: {config.priority}</Label>
                    <Slider
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      value={[config.priority]}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, priority: value[0] }))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500">
                      Prioridad relativa de las páginas (0.1 - 1.0)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="changeFreq">Frecuencia de Cambio</Label>
                    <Select
                      value={config.changeFreq}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, changeFreq: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {changeFreqOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      Frecuencia estimada de cambios en las páginas
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        <Label htmlFor="includeImages">Incluir Imágenes</Label>
                      </div>
                      <Switch
                        checked={config.includeImages}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeImages: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <Label htmlFor="includeVideos">Incluir Videos</Label>
                      </div>
                      <Switch
                        checked={config.includeVideos}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeVideos: checked }))}
                        disabled={String(userPlan) === 'free'}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <Label htmlFor="lastMod">Fecha de Modificación</Label>
                      </div>
                      <Switch
                        checked={config.lastMod}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, lastMod: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuraciones Rápidas */}
              <div className="space-y-3">
                <Label>Configuraciones Rápidas</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPreset('basic')}
                  >
                    Básico
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPreset('comprehensive')}
                  >
                    Completo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPreset('ecommerce')}
                    disabled={userPlan === 'free'}
                  >
                    E-commerce
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Aplica configuraciones predefinidas según tus necesidades
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
                      <Globe className="mr-2 h-4 w-4 animate-pulse" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Generar Sitemap XML
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
            {/* Patrones de Exclusión */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Patrones de Exclusión
                </CardTitle>
                <CardDescription>
                  URLs o patrones que deben ser excluidos del sitemap
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.excludePatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="/admin, /private, *.pdf"
                      value={pattern}
                      onChange={(e) => updateExcludePattern(index, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExcludePattern(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addExcludePattern}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Patrón de Exclusión
                </Button>
              </CardContent>
            </Card>

            {/* URLs Personalizadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  URLs Personalizadas
                </CardTitle>
                <CardDescription>
                  URLs adicionales que deben incluirse en el sitemap
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.customUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="https://ejemplo.com/pagina-especial"
                      value={url}
                      onChange={(e) => updateCustomUrl(index, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomUrl(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addCustomUrl}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar URL Personalizada
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Configuración de Crawling */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración Avanzada de Crawling</CardTitle>
              <CardDescription>
                Opciones avanzadas para el proceso de crawling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {userPlan === 'free' 
                    ? 'Las funciones avanzadas están disponibles en el plan Premium'
                    : 'Tienes acceso completo a todas las funciones avanzadas'
                  }
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Límites de Crawling</h4>
                  <div className="space-y-2">
                    <Label>Máximo de URLs</Label>
                    <Input
                      type="number"
                      value={userPlan === 'free' ? 100 : 50000}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500">
                      {userPlan === 'free' 
                        ? 'Limitado a 100 URLs en plan gratuito'
                        : 'Hasta 50,000 URLs en plan Premium'
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Opciones de Contenido</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Detectar contenido dinámico</Label>
                      <Switch disabled={userPlan === 'free'} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Seguir redirects</Label>
                      <Switch checked={true} disabled={userPlan === 'free'} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Validar URLs</Label>
                      <Switch checked={true} />
                    </div>
                  </div>
                </div>
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
                    Sitemap XML Generado Exitosamente
                  </CardTitle>
                  <CardDescription>
                    Tu sitemap XML ha sido generado y está listo para usar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar Sitemap
                    </Button>
                    <Button variant="outline" onClick={handleCopy}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar XML
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => validateSitemap()}
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
                          Validar XML
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.urlCount}
                      </div>
                      <div className="text-sm text-gray-600">URLs</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {result.imageCount}
                      </div>
                      <div className="text-sm text-gray-600">Imágenes</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(result.size / 1024)}KB
                      </div>
                      <div className="text-sm text-gray-600">Tamaño</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {result.isValid ? 'Válido' : 'Errores'}
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
                      <BarChart3 className="h-5 w-5" />
                      Validación del Sitemap XML
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

              {/* Preview del XML */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Vista Previa del Sitemap XML
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {result.sitemapXml.length > 2000 
                        ? result.sitemapXml.substring(0, 2000) + '\n\n... (contenido truncado para vista previa)'
                        : result.sitemapXml
                      }
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay sitemap XML generado
                </h3>
                <p className="text-gray-500 mb-4">
                  Configura los parámetros y genera tu sitemap XML
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