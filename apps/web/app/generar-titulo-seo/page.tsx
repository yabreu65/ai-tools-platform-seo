'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';
import { Brain, Edit3, Target, Sparkles, Save, Download } from 'lucide-react';
import { SaveAnalysisModal } from '@/components/SaveAnalysisModal';
import { ExportDropdown } from '@/components/export';
import { PlanLimitWarning } from '@/components/PlanLimitWarning';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { toast } from 'sonner';

export default function GeneradorTituloSeoPage() {
  const { user } = useAuth();
  const { canCreateAnalysis, incrementUsage } = usePlan();
  const [keyword, setKeyword] = useState('');
  const [nombre, setNombre] = useState('');
  const [contexto, setContexto] = useState('blog');
  const [tono, setTono] = useState('profesional');
  const [idioma, setIdioma] = useState('es');
  const [incluirEmojis, setIncluirEmojis] = useState(false);
  const [competencia, setCompetencia] = useState('');
  const [result, setResult] = useState<{ 
    titulo: string; 
    descripcion: string; 
    alternativas?: {
      titulo_2: string;
      titulo_3: string;
    };
    analisis?: {
      titulo_longitud: number;
      descripcion_longitud: number;
      keyword_en_titulo: boolean;
      keyword_en_descripcion: boolean;
      palabras_poder: string[];
      cta_presente: boolean;
      puntuacion_seo: number;
    };
    sugerencias?: string[];
    metadata?: {
      timestamp: string;
      keyword_original: string;
      contexto_original: string;
      tono_original: string;
      nombre_original: string | null;
      idioma_original: string;
      incluir_emojis: boolean;
      competencia_original: string | null;
    };
    validacion?: {
      titulo_longitud_ok: boolean;
      descripcion_longitud_ok: boolean;
      keyword_presente_titulo: boolean;
      keyword_presente_descripcion: boolean;
      puntuacion_general: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const validateInput = (): string[] => {
    const errors: string[] = [];
    
    if (!keyword.trim()) {
      errors.push('La palabra clave es requerida');
    } else if (keyword.length > 100) {
      errors.push('La palabra clave no puede exceder 100 caracteres');
    }
    
    if (nombre && nombre.length > 50) {
      errors.push('El nombre de la marca no puede exceder 50 caracteres');
    }
    
    if (competencia && competencia.length > 200) {
      errors.push('La información de competencia es muy larga');
    }
    
    return errors;
  };

  const handleGenerar = async () => {
    // Validar entrada
    const validationErrors = validateInput();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    // Verificar límites del plan si el usuario está autenticado
    if (user && !canCreateAnalysis()) {
      toast.error('Has alcanzado el límite de análisis para tu plan actual');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const requestBody = {
        keyword: keyword.trim(),
        contexto,
        tono,
        nombre: nombre.trim() || undefined,
        idioma,
        incluirEmojis,
        competencia: competencia.trim() || undefined
      };

      const res = await fetch('/api/generar-titulos-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        // Manejo específico de errores de la API
        if (res.status === 400 && data.details) {
          // Errores de validación específicos
          data.details.forEach((detail: any) => {
            toast.error(`${detail.field}: ${detail.message}`);
          });
        } else if (res.status === 429) {
          toast.error(data.error || 'Límite de velocidad excedido', {
            description: 'Intenta nuevamente en unos segundos'
          });
        } else if (res.status === 503) {
          toast.error(data.error || 'Servicio temporalmente no disponible', {
            description: 'Intenta nuevamente en unos minutos'
          });
        } else {
          toast.error(data.error || 'Error al generar el contenido');
        }
        return;
      }

      setResult(data);
      
      // Incrementar uso si el usuario está autenticado
      if (user) {
        incrementUsage('analysis');
      }

      toast.success('Contenido SEO generado exitosamente', {
        description: `Puntuación SEO: ${data.analisis?.puntuacion_seo || 'N/A'}/10`
      });

      // Registrar uso de la herramienta
      try {
        await fetch('/api/analytics/tools', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tool: "Generador de Títulos SEO",
            slug: "generar-titulo-seo",
            usedAt: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            metadata: {
              keyword,
              contexto,
              tono,
              idioma,
              puntuacion_seo: data.analisis?.puntuacion_seo
            }
          }),
        });
      } catch (error) {
        console.warn('Error registrando uso:', error);
      }
      
    } catch (err) {
      console.error('Error:', err);
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        toast.error('Error de conexión. Verifica tu conexión a internet.');
      } else if (err instanceof SyntaxError) {
        toast.error('Error procesando la respuesta del servidor');
      } else {
        toast.error(err instanceof Error ? err.message : 'Error inesperado generando contenido SEO');
      }
    } finally {
      setLoading(false);
    }
  };

  const contextOptions = [
    {
      value: 'blog',
      title: 'Blog',
      description: 'Artículos y contenido informativo'
    },
    {
      value: 'producto',
      title: 'Producto',
      description: 'Páginas de productos comerciales'
    },
    {
      value: 'servicio',
      title: 'Servicio',
      description: 'Páginas de servicios profesionales'
    },
    {
      value: 'empresa',
      title: 'Empresa',
      description: 'Páginas corporativas o institucionales'
    },
    {
      value: 'landing',
      title: 'Landing',
      description: 'Páginas de aterrizaje para conversión'
    },
    {
      value: 'categoria',
      title: 'Categoría',
      description: 'Páginas de categoría o listado'
    },
    {
      value: 'otro',
      title: 'Otro',
      description: 'Página web general'
    }
  ];

  const tonoOptions = [
    {
      value: 'profesional',
      title: 'Profesional',
      description: 'Formal, confiable y experto'
    },
    {
      value: 'casual',
      title: 'Casual',
      description: 'Cercano, amigable y conversacional'
    },
    {
      value: 'persuasivo',
      title: 'Persuasivo',
      description: 'Convincente, orientado a la acción'
    },
    {
      value: 'informativo',
      title: 'Informativo',
      description: 'Educativo, claro y directo'
    },
    {
      value: 'creativo',
      title: 'Creativo',
      description: 'Original, innovador y llamativo'
    },
    {
      value: 'urgente',
      title: 'Urgente',
      description: 'Inmediato, con sentido de urgencia'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <HomeFloatingButton/>
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Generador de Títulos y Descripciones SEO
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Crea contenido optimizado para buscadores con solo una palabra clave. Potenciado por inteligencia artificial.
            </p>
          </motion.div>
        </div>

        {/* Plan Limit Warning */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <PlanLimitWarning type="analysis" />
          </motion.div>
        )}

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-lg border bg-card">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-card-foreground">
                Configuración del contenido
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Completa los campos para generar títulos y descripciones SEO optimizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="keyword" className="text-card-foreground font-medium">
                    Palabra clave principal *
                  </Label>
                  <Input
                    id="keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="ej: marketing digital"
                    className="focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-card-foreground font-medium">
                    Nombre de tu marca/empresa *
                  </Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="ej: Mi Empresa"
                    className="focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idioma" className="text-card-foreground font-medium">
                    Idioma
                  </Label>
                  <select
                    id="idioma"
                    value={idioma}
                    onChange={(e) => setIdioma(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:border-primary focus:outline-none bg-background text-foreground"
                  >
                    <option value="es">Español</option>
                    <option value="en">Inglés</option>
                    <option value="pt">Portugués</option>
                    <option value="fr">Francés</option>
                    <option value="it">Italiano</option>
                    <option value="de">Alemán</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competencia" className="text-card-foreground font-medium">
                    Competencia (opcional)
                  </Label>
                  <Input
                    id="competencia"
                    value={competencia}
                    onChange={(e) => setCompetencia(e.target.value)}
                    placeholder="ej: Amazon, MercadoLibre"
                    className="focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Menciona competidores para diferenciarte mejor
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="incluirEmojis"
                      checked={incluirEmojis}
                      onChange={(e) => setIncluirEmojis(e.target.checked)}
                      className="rounded border-border focus:ring-primary"
                    />
                    <Label htmlFor="incluirEmojis" className="text-card-foreground font-medium">
                      Incluir emojis en títulos
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Los emojis pueden aumentar el CTR pero úsalos con moderación
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-card-foreground font-medium">
                    Tipo de contenido
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {contextOptions.map((option) => (
                      <Card
                        key={option.value}
                        className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-md ${
                          contexto === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setContexto(option.value)}
                      >
                        <CardContent className="p-3 text-center">
                          <p className="text-sm font-medium text-card-foreground">{option.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-card-foreground font-medium">
                    Tono de comunicación
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {tonoOptions.map((option) => (
                      <Card
                        key={option.value}
                        className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-md ${
                          tono === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setTono(option.value)}
                      >
                        <CardContent className="p-4">
                          <p className="text-sm font-medium text-card-foreground mb-1">{option.title}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {error && (
                  <Card className="border-destructive bg-destructive/5">
                    <CardContent className="p-4">
                      <p className="text-sm text-destructive font-medium">
                        Error: {error}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={handleGenerar}
                  disabled={loading || !keyword.trim() || !nombre.trim()}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Generando contenido...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generar Títulos y Descripciones
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {!result && (
          <>
            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <Card className="border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-primary/10 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg text-card-foreground mb-2">
                    ¿Qué hace esta herramienta?
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Genera títulos SEO y meta descripciones optimizadas usando inteligencia artificial avanzada.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-secondary/10 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-lg text-card-foreground mb-2">
                    ¿Por qué es importante?
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Un contenido optimizado rankea mejor y compite con mayor fuerza en resultados de búsqueda.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-accent/10 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg text-card-foreground mb-2">
                    ¿Para quién es útil?
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Ideal para bloggers, medios, e-commerce y cualquier sitio que ya tenga contenido online.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* Results Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <Card className="shadow-xl border bg-card">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-4 mb-2">
                  <Image src="/logo/logo_blue.png" alt="Logo YA" width={40} height={40} className="dark:hidden" />
                  <Image src="/logo/logo_white.png" alt="Logo YA Dark" width={40} height={40} className="hidden dark:block" />
                  <CardTitle className="text-2xl text-success">
                    Contenido SEO Generado
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Título principal */}
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">
                      Título SEO
                    </Label>
                    <Card className="bg-muted/30 border">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-primary">
                          {result.titulo}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Meta descripción */}
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">
                      Meta descripción
                    </Label>
                    <Card className="bg-muted/30 border">
                      <CardContent className="p-4">
                        <p className="text-sm text-card-foreground">
                          {result.descripcion}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Títulos alternativos */}
                  {Array.isArray(result.alternativas) && result.alternativas.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">
                        Títulos alternativos
                      </Label>
                      <div className="space-y-2">
                        {result.alternativas.map((titulo, index) => (
                          <Card key={index} className="bg-muted/20 border hover:bg-muted/30 transition-colors cursor-pointer"
                                onClick={() => setResult({...result, titulo})}>
                            <CardContent className="p-3">
                              <p className="text-sm text-card-foreground">
                                {titulo}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Análisis SEO mejorado */}
                  {result.analisis && (
                    <div className="space-y-4">
                      <Label className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">
                        Análisis SEO
                      </Label>
                      
                      {/* Score general */}
                      {typeof result.analisis?.puntuacion_seo === 'number' && (
                        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-card-foreground">Puntuación SEO</p>
                                <p className="text-xs text-muted-foreground">Basado en mejores prácticas</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">{result.analisis.puntuacion_seo}/100</p>
                                <div className={`text-xs font-medium ${
                                  result.analisis.puntuacion_seo >= 80 ? 'text-green-600' : 
                                  result.analisis.puntuacion_seo >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {result.analisis.puntuacion_seo >= 80 ? 'Excelente' : 
                                   result.analisis.puntuacion_seo >= 60 ? 'Bueno' : 'Necesita mejoras'}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Métricas detalladas */}
                      <Card className="bg-muted/30 border">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <p className="font-medium text-card-foreground">
                                {typeof result.analisis?.titulo_longitud === 'number' 
                                  ? result.analisis.titulo_longitud 
                                  : (result.titulo?.length || 0)}
                              </p>
                              <p className="text-muted-foreground text-xs">Caracteres título</p>
                              <div className={`w-full h-1 rounded mt-1 ${
                                ((typeof result.analisis?.titulo_longitud === 'number' 
                                  ? result.analisis.titulo_longitud 
                                  : (result.titulo?.length || 0)) <= 60) ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-card-foreground">
                                {typeof result.analisis?.descripcion_longitud === 'number' 
                                  ? result.analisis.descripcion_longitud 
                                  : (result.descripcion?.length || 0)}
                              </p>
                              <p className="text-muted-foreground text-xs">Caracteres descripción</p>
                              <div className={`w-full h-1 rounded mt-1 ${
                                ((typeof result.analisis?.descripcion_longitud === 'number' 
                                  ? result.analisis.descripcion_longitud 
                                  : (result.descripcion?.length || 0)) >= 150 && 
                                 (typeof result.analisis?.descripcion_longitud === 'number' 
                                  ? result.analisis.descripcion_longitud 
                                  : (result.descripcion?.length || 0)) <= 160) 
                                  ? 'bg-green-500' : 'bg-yellow-500'
                              }`}></div>
                            </div>
                            <div className="text-center">
                              <p className={`font-medium ${
                                ((result.analisis?.keyword_en_titulo ?? (result.titulo?.toLowerCase().includes(keyword.toLowerCase()) || false)) ? 'text-green-600' : 'text-red-600')
                              }`}>
                                {(result.analisis?.keyword_en_titulo ?? (result.titulo?.toLowerCase().includes(keyword.toLowerCase()) || false)) ? '✓' : '✗'}
                              </p>
                              <p className="text-muted-foreground text-xs">Keyword en título</p>
                            </div>
                            <div className="text-center">
                              <p className={`font-medium ${
                                ((result.analisis?.keyword_en_descripcion ?? (result.descripcion?.toLowerCase().includes(keyword.toLowerCase()) || false)) ? 'text-green-600' : 'text-red-600')
                              }`}>
                                {(result.analisis?.keyword_en_descripcion ?? (result.descripcion?.toLowerCase().includes(keyword.toLowerCase()) || false)) ? '✓' : '✗'}
                              </p>
                              <p className="text-muted-foreground text-xs">Keyword en descripción</p>
                            </div>
                          </div>

                          {/* Indicadores adicionales */}
                          {Array.isArray(result.analisis?.palabras_poder) && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div className="text-center">
                                  <p className={`font-medium ${(result.analisis?.palabras_poder?.length || 0) > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {(result.analisis?.palabras_poder?.length || 0) > 0 ? '✓' : '○'}
                                  </p>
                                  <p className="text-muted-foreground text-xs">Palabras poder</p>
                                </div>
                                <div className="text-center">
                                  <p className={`font-medium ${result.analisis?.cta_presente ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {result.analisis?.cta_presente ? '✓' : '○'}
                                  </p>
                                  <p className="text-muted-foreground text-xs">Call to Action</p>
                                </div>
                                <div className="text-center">
                                  <p className={`font-medium ${incluirEmojis ? 'text-green-600' : 'text-gray-400'}`}>
                                    {incluirEmojis ? '✓' : '○'}
                                  </p>
                                  <p className="text-muted-foreground text-xs">Emojis</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Sugerencias de mejora */}
                  {result.sugerencias && result.sugerencias.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">
                        Sugerencias de mejora
                      </Label>
                      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4">
                          <ul className="space-y-2">
                            {result.sugerencias.map((sugerencia, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-blue-500 mt-0.5">💡</span>
                                <span className="text-blue-700 dark:text-blue-300">{sugerencia}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Validación técnica */}
                  {result.validacion && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">
                        Validación técnica
                      </Label>
                      <Card className="bg-muted/20 border">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                result.validacion.titulo_longitud_ok ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
                              <span className="text-card-foreground">Longitud título óptima</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                result.validacion.descripcion_longitud_ok ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
                              <span className="text-card-foreground">Longitud descripción óptima</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                ((result.validacion?.keyword_presente_titulo || result.validacion?.keyword_presente_descripcion) ? 'bg-green-500' : 'bg-red-500')
                              }`}></span>
                              <span className="text-card-foreground">Keyword presente</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                (typeof result.analisis?.puntuacion_seo === 'number' ? result.analisis.puntuacion_seo : 0) >= 70 ? 'bg-green-500' : 
                                (typeof result.analisis?.puntuacion_seo === 'number' ? result.analisis.puntuacion_seo : 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></span>
                              <span className="text-card-foreground">Puntuación general</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => setResult(null)}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Generar otro
                  </Button>

                  {user && (
                    <>
                      <SaveAnalysisModal
                        toolType="title-generator"
                        result={{
                          titulo: result.titulo,
                          descripcion: result.descripcion,
                          alternativas: result.alternativas,
                          analisis: result.analisis,
                          sugerencias: result.sugerencias,
                          metadata: result.metadata,
                          validacion: result.validacion,
                          keyword,
                          nombre,
                          contexto,
                          tono
                        }}
                        metadata={{
                          score: typeof result.analisis?.puntuacion_seo === 'number' ? result.analisis.puntuacion_seo : undefined,
                          generatedAt: new Date().toISOString(),
                          keyword,
                          brand: nombre,
                          context: contexto,
                          tone: tono
                        }}
                        trigger={
                          <Button
                            variant="outline"
                            className="border-success text-success hover:bg-success/5"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Guardar análisis
                          </Button>
                        }
                      />

                      <ExportDropdown
                        toolType="title-generator"
                        data={{
                          titles: [result.titulo],
                          keywords: keyword,
                          tone: tono,
                          context: contexto,
                          brand: nombre,
                          description: result.descripcion,
                          characteristics: {
                            titulo_longitud: typeof result.analisis?.titulo_longitud === 'number' ? result.analisis.titulo_longitud : (result.titulo?.length || 0),
                            descripcion_longitud: typeof result.analisis?.descripcion_longitud === 'number' ? result.analisis.descripcion_longitud : (result.descripcion?.length || 0),
                            keyword_en_titulo: result.analisis?.keyword_en_titulo ?? (result.titulo?.toLowerCase().includes(keyword.toLowerCase()) || false),
                            keyword_en_descripcion: result.analisis?.keyword_en_descripcion ?? (result.descripcion?.toLowerCase().includes(keyword.toLowerCase()) || false),
                            palabras_poder: Array.isArray(result.analisis?.palabras_poder) ? result.analisis.palabras_poder : [],
                            cta_presente: result.analisis?.cta_presente ?? false,
                            emojis_incluidos: incluirEmojis
                          },
                          metadata: {
                            generatedAt: new Date().toISOString(),
                            keyword,
                            brand: nombre,
                            context: contexto,
                            tone: tono
                          }
                        }}
                        title="Generador de Títulos SEO"
                      />
                    </>
                  )}

                  <Link href="/" passHref legacyBehavior>
                    <Button asChild variant="outline">
                      <a>
                        <span className="mr-2">🏠</span>
                        Volver al inicio
                      </a>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Save Analysis Modal render se maneja mediante el trigger en la sección de acciones */}


      </div>
    </div>
  );
}
