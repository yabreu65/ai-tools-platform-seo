'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';
import { Search, Globe, CheckCircle, AlertTriangle, XCircle, TrendingUp, Clock, Smartphone, Target, BarChart3, FileText, Lightbulb, Settings, RotateCcw } from 'lucide-react';
import { ExportDropdown } from '@/components/export';
import { useAuth } from '@/contexts/AuthContext';
import { ToolPageSkeleton, CardSkeleton } from '@/components/loading/SkeletonLoaders';

interface SeoAuditResult {
  url: string;
  timestamp: string;
  puntuacion_general: number;
  
  seo_onpage: {
    titulo: {
      contenido: string;
      longitud: number;
      optimizado: boolean;
      recomendaciones: string[];
    };
    meta_descripcion: {
      contenido: string;
      longitud: number;
      optimizado: boolean;
      recomendaciones: string[];
    };
    encabezados: {
      h1: string[];
      h2: string[];
      h3: string[];
      estructura_correcta: boolean;
      recomendaciones: string[];
    };
    imagenes: {
      total: number;
      sin_alt: number;
      optimizadas: number;
      recomendaciones: string[];
    };
  };
  
  seo_tecnico: {
    velocidad: {
      puntuacion: number;
      tiempo_carga: number;
      core_web_vitals: {
        lcp: number;
        fid: number;
        cls: number;
      };
      recomendaciones: string[];
    };
    mobile_friendly: {
      optimizado: boolean;
      problemas: string[];
      recomendaciones: string[];
    };
    indexabilidad: {
      robots_txt: boolean;
      sitemap: boolean;
      canonical: string;
      recomendaciones: string[];
    };
  };
  
  contenido: {
    palabras_clave_principales: string[];
    densidad_keywords: number;
    legibilidad: {
      puntuacion: number;
      nivel: string;
    };
    estructura_contenido: {
      parrafos: number;
      listas: number;
      enlaces_internos: number;
      enlaces_externos: number;
    };
    recomendaciones: string[];
  };
  
  analisis_ia: {
    fortalezas: string[];
    debilidades: string[];
    oportunidades: string[];
    prioridades: string[];
    recomendaciones_estrategicas: string;
  };
  
  resumen: {
    estado_general: 'Excelente' | 'Bueno' | 'Regular' | 'Necesita mejoras';
    problemas_criticos: number;
    problemas_menores: number;
    acciones_prioritarias: string[];
  };
}

export default function SeoAuditPage() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<SeoAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/seo-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error desconocido');

      setResult(data);
      
      // Tracking de uso (proxy vía Next.js para evitar CORS)
      await fetch('/api/analytics/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'seo audit',
          slug: 'seo-audit-tool',
          usedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          language: navigator.language,
        }),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-error-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success-500';
    if (score >= 60) return 'bg-warning-500';
    return 'bg-error-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <HomeFloatingButton />
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Auditoría SEO Completa
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Análisis técnico completo de tu sitio web con inteligencia artificial. Detecta problemas y recibe recomendaciones específicas.
            </p>
            <Card className="max-w-3xl mx-auto border bg-card">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Esta herramienta realiza un análisis SEO integral que incluye elementos on-page, técnicos, de contenido y rendimiento.
                  <span className="font-medium text-primary ml-1">
                    Obtén un reporte detallado con puntuación y recomendaciones accionables</span> para mejorar tu posicionamiento.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

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
                Iniciar Auditoría SEO
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Ingresa la URL de tu sitio web para comenzar el análisis completo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-card-foreground font-medium">
                    URL del sitio web
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://ejemplo.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="text-base"
                  />
                </div>

                {error && (
                  <Card className="border-error-200 bg-error-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-error-600" />
                        <p className="text-error-700 font-medium">{error}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={handleAudit}
                  disabled={loading || !url}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analizando sitio web...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Iniciar Auditoría SEO
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            ¿Qué incluye nuestra auditoría?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">SEO On-Page</h3>
                <p className="text-sm text-muted-foreground">
                  Títulos, meta descripciones, encabezados y estructura de contenido
                </p>
              </CardContent>
            </Card>

            <Card className="border bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-secondary/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">SEO Técnico</h3>
                <p className="text-sm text-muted-foreground">
                  Velocidad, Core Web Vitals, indexabilidad y optimización móvil
                </p>
              </CardContent>
            </Card>

            <Card className="border bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-accent/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">Contenido</h3>
                <p className="text-sm text-muted-foreground">
                  Keywords, legibilidad, estructura y optimización de contenido
                </p>
              </CardContent>
            </Card>

            <Card className="border bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-info/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-6 w-6 text-info" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">Análisis IA</h3>
                <p className="text-sm text-muted-foreground">
                  Recomendaciones inteligentes y estrategias de mejora personalizadas
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Loading Section */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-12 space-y-8"
          >
            <div className="text-center space-y-4 mb-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <h3 className="text-xl font-semibold">Analizando tu sitio web...</h3>
              <p className="text-muted-foreground">
                Esto puede tomar unos momentos mientras revisamos todos los aspectos SEO
              </p>
            </div>
            
            {/* Skeleton para resultados */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
              <div className="space-y-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mt-12 space-y-8"
          >
            {/* Resumen General */}
            <Card className="shadow-xl border bg-card">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-4 mb-2">
                  <Image src="/logo/logo_blue.png" alt="Logo YA" width={40} height={40} className="dark:hidden" />
                  <Image src="/logo/logo_white.png" alt="Logo YA Dark" width={40} height={40} className="hidden dark:block" />
                  <CardTitle className="text-2xl text-success">
                    Auditoría SEO Completada
                  </CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  Análisis completo de {result.url} - Estado: {result.resumen.estado_general}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(result.puntuacion_general)}`}>
                      {result.puntuacion_general}
                    </div>
                    <div className="text-sm text-muted-foreground">Puntuación General</div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${getScoreBg(result.puntuacion_general)}`}
                        style={{ width: `${result.puntuacion_general}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-error mb-2">{result.resumen.problemas_criticos}</div>
                    <div className="text-sm text-muted-foreground">Problemas Críticos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-warning mb-2">{result.resumen.problemas_menores}</div>
                    <div className="text-sm text-muted-foreground">Problemas Menores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-info mb-2">{result.analisis_ia.oportunidades.length}</div>
                    <div className="text-sm text-muted-foreground">Oportunidades</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                      Acciones Prioritarias
                    </Label>
                    <div className="space-y-2">
                      {result.resumen.acciones_prioritarias.map((accion, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          <span className="text-sm">{accion}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                      Recomendación Estratégica
                    </Label>
                    <Card className="bg-muted/30 border">
                      <CardContent className="p-4">
                        <p className="text-sm text-card-foreground leading-relaxed">
                          {result.analisis_ia.recomendaciones_estrategicas}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO On-Page */}
            <Card className="shadow-lg border bg-card">
              <CardHeader>
                <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  SEO On-Page
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Análisis de elementos SEO en la página
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Título */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Título SEO</h4>
                      {result.seo_onpage.titulo.optimizado ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-error" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{result.seo_onpage.titulo.contenido}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span>Longitud: {result.seo_onpage.titulo.longitud} caracteres</span>
                      <span className={result.seo_onpage.titulo.longitud >= 30 && result.seo_onpage.titulo.longitud <= 60 ? 'text-success' : 'text-warning'}>
                        Óptimo: 30-60 caracteres
                      </span>
                    </div>
                    <div className="space-y-1">
                      {result.seo_onpage.titulo.recomendaciones.map((rec, index) => (
                        <p key={index} className="text-xs text-muted-foreground">• {rec}</p>
                      ))}
                    </div>
                  </div>

                  {/* Meta Descripción */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Meta Descripción</h4>
                      {result.seo_onpage.meta_descripcion.optimizado ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-error" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{result.seo_onpage.meta_descripcion.contenido || 'No encontrada'}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span>Longitud: {result.seo_onpage.meta_descripcion.longitud} caracteres</span>
                      <span className={result.seo_onpage.meta_descripcion.longitud >= 120 && result.seo_onpage.meta_descripcion.longitud <= 160 ? 'text-success' : 'text-warning'}>
                        Óptimo: 120-160 caracteres
                      </span>
                    </div>
                    <div className="space-y-1">
                      {result.seo_onpage.meta_descripcion.recomendaciones.map((rec, index) => (
                        <p key={index} className="text-xs text-muted-foreground">• {rec}</p>
                      ))}
                    </div>
                  </div>

                  {/* Encabezados */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Estructura de Encabezados</h4>
                      {result.seo_onpage.encabezados.estructura_correcta ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-error" />
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">H1 ({result.seo_onpage.encabezados.h1.length})</span>
                        {result.seo_onpage.encabezados.h1.slice(0, 2).map((h1, index) => (
                          <p key={index} className="text-sm truncate">{h1}</p>
                        ))}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">H2 ({result.seo_onpage.encabezados.h2.length})</span>
                        {result.seo_onpage.encabezados.h2.slice(0, 2).map((h2, index) => (
                          <p key={index} className="text-sm truncate">{h2}</p>
                        ))}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">H3 ({result.seo_onpage.encabezados.h3.length})</span>
                        {result.seo_onpage.encabezados.h3.slice(0, 2).map((h3, index) => (
                          <p key={index} className="text-sm truncate">{h3}</p>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {result.seo_onpage.encabezados.recomendaciones.map((rec, index) => (
                        <p key={index} className="text-xs text-muted-foreground">• {rec}</p>
                      ))}
                    </div>
                  </div>

                  {/* Imágenes */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Optimización de Imágenes</h4>
                      {result.seo_onpage.imagenes.sin_alt === 0 ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{result.seo_onpage.imagenes.total}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success">{result.seo_onpage.imagenes.optimizadas}</div>
                        <div className="text-xs text-muted-foreground">Con ALT</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-error">{result.seo_onpage.imagenes.sin_alt}</div>
                        <div className="text-xs text-muted-foreground">Sin ALT</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {result.seo_onpage.imagenes.recomendaciones.map((rec, index) => (
                        <p key={index} className="text-xs text-muted-foreground">• {rec}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Técnico */}
            <Card className="shadow-lg border bg-card">
              <CardHeader>
                <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                  <Settings className="h-5 w-5 text-secondary" />
                  SEO Técnico
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Análisis de rendimiento y aspectos técnicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Velocidad */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Velocidad y Core Web Vitals</h4>
                      <div className={`text-2xl font-bold ${getScoreColor(result.seo_tecnico.velocidad.puntuacion)}`}>
                        {result.seo_tecnico.velocidad.puntuacion}/100
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold">{(result.seo_tecnico.velocidad.core_web_vitals.lcp / 1000).toFixed(1)}s</div>
                        <div className="text-xs text-muted-foreground">LCP (Largest Contentful Paint)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{result.seo_tecnico.velocidad.core_web_vitals.fid}ms</div>
                        <div className="text-xs text-muted-foreground">FID (First Input Delay)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{result.seo_tecnico.velocidad.core_web_vitals.cls.toFixed(3)}</div>
                        <div className="text-xs text-muted-foreground">CLS (Cumulative Layout Shift)</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {result.seo_tecnico.velocidad.recomendaciones.map((rec, index) => (
                        <p key={index} className="text-xs text-muted-foreground">• {rec}</p>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Friendly */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Optimización Móvil</h4>
                      {result.seo_tecnico.mobile_friendly.optimizado ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-error" />
                      )}
                    </div>
                    <div className="space-y-1">
                      {result.seo_tecnico.mobile_friendly.recomendaciones.map((rec, index) => (
                        <p key={index} className="text-xs text-muted-foreground">• {rec}</p>
                      ))}
                    </div>
                  </div>

                  {/* Indexabilidad */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Indexabilidad</h4>
                      {result.seo_tecnico.indexabilidad.canonical ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      )}
                    </div>
                    {result.seo_tecnico.indexabilidad.canonical && (
                      <p className="text-sm text-muted-foreground mb-2 truncate">
                        Canonical: {result.seo_tecnico.indexabilidad.canonical}
                      </p>
                    )}
                    <div className="space-y-1">
                      {result.seo_tecnico.indexabilidad.recomendaciones.map((rec, index) => (
                        <p key={index} className="text-xs text-muted-foreground">• {rec}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Análisis de IA */}
            <Card className="shadow-lg border bg-card">
              <CardHeader>
                <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-info" />
                  Análisis con Inteligencia Artificial
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Insights y recomendaciones generadas por IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-success mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Fortalezas Detectadas
                    </h4>
                    <div className="space-y-2">
                      {result.analisis_ia.fortalezas.map((fortaleza, index) => (
                        <div key={index} className="p-2 bg-success/10 rounded text-sm">
                          {fortaleza}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-error mb-3 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Debilidades Identificadas
                    </h4>
                    <div className="space-y-2">
                      {result.analisis_ia.debilidades.map((debilidad, index) => (
                        <div key={index} className="p-2 bg-error/10 rounded text-sm">
                          {debilidad}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-info mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Oportunidades de Mejora
                    </h4>
                    <div className="space-y-2">
                      {result.analisis_ia.oportunidades.map((oportunidad, index) => (
                        <div key={index} className="p-2 bg-info/10 rounded text-sm">
                          {oportunidad}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-warning mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Prioridades de Acción
                    </h4>
                    <div className="space-y-2">
                      {result.analisis_ia.prioridades.map((prioridad, index) => (
                        <div key={index} className="p-2 bg-warning/10 rounded text-sm">
                          {prioridad}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => setResult(null)}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Nueva auditoría
              </Button>

              {user && (
                <ExportDropdown
                  toolType="seo-audit"
                  data={{
                    url: result.url,
                    puntuacion_general: result.puntuacion_general,
                    seo_onpage: result.seo_onpage,
                    seo_tecnico: result.seo_tecnico,
                    contenido: result.contenido,
                    analisis_ia: result.analisis_ia,
                    resumen: result.resumen,
                    metadata: {
                      url: result.url,
                      timestamp: result.timestamp,
                      generatedAt: new Date().toISOString()
                    }
                  }}
                  title="Auditoría SEO Completa"
                />
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
