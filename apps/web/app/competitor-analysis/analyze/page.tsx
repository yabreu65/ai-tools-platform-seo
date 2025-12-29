'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  X, 
  Globe, 
  Search, 
  BarChart3, 
  Link as LinkIcon, 
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CompetitorInput {
  id: string;
  url: string;
  name: string;
  isValid: boolean;
}

interface AnalysisConfig {
  analysisType: 'full' | 'keywords' | 'backlinks' | 'content';
  depth: number;
  includeHistorical: boolean;
  keywordLimit: number;
  includeImages: boolean;
  includeVideos: boolean;
  regions: string[];
}

const CompetitorAnalysisForm = () => {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<CompetitorInput[]>([
    { id: '1', url: '', name: '', isValid: false }
  ]);
  const [config, setConfig] = useState<AnalysisConfig>({
    analysisType: 'full',
    depth: 3,
    includeHistorical: false,
    keywordLimit: 1000,
    includeImages: true,
    includeVideos: false,
    regions: ['es']
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const addCompetitor = () => {
    if (competitors.length < 5) {
      const newId = (competitors.length + 1).toString();
      setCompetitors([...competitors, { id: newId, url: '', name: '', isValid: false }]);
    }
  };

  const removeCompetitor = (id: string) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter(comp => comp.id !== id));
    }
  };

  const updateCompetitor = (id: string, field: 'url' | 'name', value: string) => {
    setCompetitors(competitors.map(comp => {
      if (comp.id === id) {
        const updated = { ...comp, [field]: value };
        if (field === 'url') {
          updated.isValid = isValidUrl(value);
          if (updated.isValid && !updated.name) {
            updated.name = extractDomainName(value);
          }
        }
        return updated;
      }
      return comp;
    }));
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const extractDomainName = (url: string): string => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return domain.replace('www.', '');
    } catch {
      return '';
    }
  };

  const validateForm = (): boolean => {
    const validCompetitors = competitors.filter(comp => comp.url && comp.isValid);
    if (validCompetitors.length === 0) {
      toast.error('Debes agregar al menos un competidor válido');
      return false;
    }
    return true;
  };

  const simulateAnalysis = async () => {
    const steps = [
      'Validando URLs de competidores...',
      'Extrayendo datos de SEO...',
      'Analizando keywords orgánicas...',
      'Evaluando perfil de backlinks...',
      'Analizando contenido y estructura...',
      'Generando comparaciones...',
      'Identificando oportunidades...',
      'Finalizando análisis...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      setAnalysisProgress((i + 1) / steps.length * 100);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  };

  const handleAnalyze = async () => {
    if (!validateForm()) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Iniciar simulación visual
      const simulationPromise = simulateAnalysis();

      // Preparar datos para la API
      const validCompetitors = competitors.filter(comp => comp.url && comp.isValid);
      const analysisData = {
        competitors: validCompetitors.map(comp => comp.url),
        analysisType: config.analysisType,
        depth: config.depth,
        includeHistorical: config.includeHistorical,
        keywordLimit: config.keywordLimit,
        regions: config.regions,
        includeImages: config.includeImages,
        includeVideos: config.includeVideos
      };

      // Llamada real a la API
      const response = await fetch('/api/competitor-analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al realizar el análisis');
      }

      const result = await response.json();
      
      // Esperar a que termine la simulación visual
      await simulationPromise;
      
      toast.success('Análisis completado exitosamente');
      router.push(`/competitor-analysis/results/${result.analysisId}`);
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al realizar el análisis');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setCurrentStep('');
    }
  };

  const analysisTypes = [
    { value: 'full', label: 'Análisis Completo', description: 'Keywords, backlinks, contenido y métricas técnicas' },
    { value: 'keywords', label: 'Solo Keywords', description: 'Análisis enfocado en keywords orgánicas' },
    { value: 'backlinks', label: 'Solo Backlinks', description: 'Análisis del perfil de enlaces' },
    { value: 'content', label: 'Solo Contenido', description: 'Análisis de contenido y estructura' }
  ];

  const regions = [
    { value: 'es', label: 'España' },
    { value: 'mx', label: 'México' },
    { value: 'ar', label: 'Argentina' },
    { value: 'co', label: 'Colombia' },
    { value: 'us', label: 'Estados Unidos' },
    { value: 'global', label: 'Global' }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Análisis de Competidores</h1>
        <p className="text-gray-600 mt-2">
          Configura tu análisis competitivo para obtener insights accionables
        </p>
      </div>

      {/* Progreso del análisis */}
      {isAnalyzing && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">{currentStep}</p>
                <Progress value={analysisProgress} className="mt-2" />
                <p className="text-sm text-blue-700 mt-1">
                  {Math.round(analysisProgress)}% completado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Competidores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-blue-600" />
                Competidores a Analizar
              </CardTitle>
              <CardDescription>
                Agrega hasta 5 competidores para comparar (mínimo 1)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {competitors.map((competitor, index) => (
                <div key={competitor.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`url-${competitor.id}`} className="text-sm">
                        URL del Competidor
                      </Label>
                      <div className="relative">
                        <Input
                          id={`url-${competitor.id}`}
                          placeholder="https://ejemplo.com"
                          value={competitor.url}
                          onChange={(e) => updateCompetitor(competitor.id, 'url', e.target.value)}
                          className={competitor.url && !competitor.isValid ? 'border-red-300' : ''}
                          disabled={isAnalyzing}
                        />
                        {competitor.url && (
                          <div className="absolute right-2 top-2">
                            {competitor.isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`name-${competitor.id}`} className="text-sm">
                        Nombre (opcional)
                      </Label>
                      <Input
                        id={`name-${competitor.id}`}
                        placeholder="Nombre del competidor"
                        value={competitor.name}
                        onChange={(e) => updateCompetitor(competitor.id, 'name', e.target.value)}
                        disabled={isAnalyzing}
                      />
                    </div>
                  </div>
                  {competitors.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCompetitor(competitor.id)}
                      disabled={isAnalyzing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {competitors.length < 5 && (
                <Button
                  variant="outline"
                  onClick={addCompetitor}
                  className="w-full"
                  disabled={isAnalyzing}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Competidor
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Configuración del análisis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Configuración del Análisis
              </CardTitle>
              <CardDescription>
                Personaliza los parámetros de tu análisis competitivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo de análisis */}
              <div>
                <Label className="text-sm font-medium">Tipo de Análisis</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {analysisTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        config.analysisType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => !isAnalyzing && setConfig({ ...config, analysisType: type.value as any })}
                    >
                      <h4 className="font-medium text-sm">{type.label}</h4>
                      <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profundidad del análisis */}
              <div>
                <Label htmlFor="depth" className="text-sm font-medium">
                  Profundidad del Análisis: {config.depth}
                </Label>
                <input
                  id="depth"
                  type="range"
                  min="1"
                  max="5"
                  value={config.depth}
                  onChange={(e) => setConfig({ ...config, depth: parseInt(e.target.value) })}
                  className="w-full mt-2"
                  disabled={isAnalyzing}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Básico</span>
                  <span>Intermedio</span>
                  <span>Avanzado</span>
                </div>
              </div>

              {/* Límite de keywords */}
              <div>
                <Label htmlFor="keywordLimit" className="text-sm font-medium">
                  Límite de Keywords
                </Label>
                <Select
                  value={config.keywordLimit.toString()}
                  onValueChange={(value) => setConfig({ ...config, keywordLimit: parseInt(value) })}
                  disabled={isAnalyzing}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">500 keywords</SelectItem>
                    <SelectItem value="1000">1,000 keywords</SelectItem>
                    <SelectItem value="2500">2,500 keywords</SelectItem>
                    <SelectItem value="5000">5,000 keywords</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Opciones adicionales */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Opciones Adicionales</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="historical"
                    checked={config.includeHistorical}
                    onCheckedChange={(checked) => 
                      setConfig({ ...config, includeHistorical: checked as boolean })
                    }
                    disabled={isAnalyzing}
                  />
                  <Label htmlFor="historical" className="text-sm">
                    Incluir datos históricos (últimos 6 meses)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="images"
                    checked={config.includeImages}
                    onCheckedChange={(checked) => 
                      setConfig({ ...config, includeImages: checked as boolean })
                    }
                    disabled={isAnalyzing}
                  />
                  <Label htmlFor="images" className="text-sm">
                    Analizar optimización de imágenes
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="videos"
                    checked={config.includeVideos}
                    onCheckedChange={(checked) => 
                      setConfig({ ...config, includeVideos: checked as boolean })
                    }
                    disabled={isAnalyzing}
                  />
                  <Label htmlFor="videos" className="text-sm">
                    Incluir análisis de contenido de video
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen del Análisis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Competidores:</span>
                <Badge variant="outline">
                  {competitors.filter(c => c.url && c.isValid).length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tipo:</span>
                <Badge variant="outline">
                  {analysisTypes.find(t => t.value === config.analysisType)?.label}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Profundidad:</span>
                <Badge variant="outline">{config.depth}/5</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Keywords:</span>
                <Badge variant="outline">{config.keywordLimit.toLocaleString()}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Información del plan */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Plan Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-blue-800">
                  <strong>Plan Básico</strong>
                </p>
                <p className="text-xs text-blue-700">
                  • Hasta 3 competidores por análisis
                </p>
                <p className="text-xs text-blue-700">
                  • 1,000 keywords máximo
                </p>
                <p className="text-xs text-blue-700">
                  • Reportes básicos
                </p>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Actualizar Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botón de análisis */}
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || competitors.filter(c => c.url && c.isValid).length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Iniciar Análisis
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysisForm;