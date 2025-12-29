'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Sparkles, Search, TrendingUp, Target, Loader2 } from 'lucide-react';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';

interface KeywordSuggestion {
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  relevance?: number;
}

interface DiscoverResults {
  seedKeyword: string;
  relatedKeywords: KeywordSuggestion[];
  longTailKeywords: KeywordSuggestion[];
  questions: string[];
  trends: {
    keyword: string;
    trend: 'rising' | 'stable' | 'declining';
  }[];
}

export default function KeywordResearchDiscover() {
  const [seedKeyword, setSeedKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DiscoverResults | null>(null);
  const [error, setError] = useState('');

  const handleDiscover = async () => {
    if (!seedKeyword.trim()) {
      setError('Por favor ingresa una palabra clave');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/keyword-research/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: seedKeyword,
          location,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al descubrir keywords');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Sparkles className="h-10 w-10 text-blue-600" />
              Descubrimiento de Keywords
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre palabras clave relacionadas con IA avanzada para optimizar tu estrategia de contenido
            </p>
          </div>

          {/* Main Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Buscar Keywords Relacionadas</CardTitle>
              <CardDescription>
                Ingresa una palabra clave semilla para descubrir términos relacionados, preguntas y tendencias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Palabra Clave Semilla</label>
                  <Input
                    placeholder="Ej: marketing digital, SEO, desarrollo web..."
                    value={seedKeyword}
                    onChange={(e) => setSeedKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDiscover()}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Idioma</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="es">Español</option>
                    <option value="en">Inglés</option>
                    <option value="pt">Portugués</option>
                    <option value="fr">Francés</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ubicación (Opcional)</label>
                <Input
                  placeholder="Ej: España, México, Argentina..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button
                onClick={handleDiscover}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Descubriendo keywords...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Descubrir Keywords
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-blue-900">{results.relatedKeywords.length}</p>
                      <p className="text-sm text-gray-600">Keywords Relacionadas</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-purple-900">{results.longTailKeywords.length}</p>
                      <p className="text-sm text-gray-600">Long-Tail Keywords</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-green-900">{results.questions.length}</p>
                      <p className="text-sm text-gray-600">Preguntas Populares</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Related Keywords */}
              {results.relatedKeywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Keywords Relacionadas</CardTitle>
                    <CardDescription>Términos relacionados con alta relevancia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {results.relatedKeywords.map((kw, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{kw.keyword}</span>
                          <div className="flex gap-2">
                            {kw.searchVolume && (
                              <Badge variant="secondary">{kw.searchVolume} búsquedas/mes</Badge>
                            )}
                            {kw.difficulty && (
                              <Badge variant={kw.difficulty > 70 ? 'destructive' : kw.difficulty > 40 ? 'default' : 'secondary'}>
                                Dificultad: {kw.difficulty}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Long-Tail Keywords */}
              {results.longTailKeywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Long-Tail Keywords</CardTitle>
                    <CardDescription>Frases largas con menor competencia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.longTailKeywords.map((kw, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span className="font-medium text-purple-900">{kw.keyword}</span>
                          {kw.relevance && (
                            <Badge variant="outline">Relevancia: {Math.round(kw.relevance * 100)}%</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Questions */}
              {results.questions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preguntas Populares</CardTitle>
                    <CardDescription>Preguntas que la gente busca sobre este tema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.questions.map((question, idx) => (
                        <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-blue-900">{question}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Features Info */}
          {!results && !isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>¿Cómo funciona?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      IA Avanzada
                    </h3>
                    <p className="text-sm text-gray-600">
                      Usa inteligencia artificial para descubrir keywords semánticamente relacionadas
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Search className="h-5 w-5 text-purple-600" />
                      Búsqueda Profunda
                    </h3>
                    <p className="text-sm text-gray-600">
                      Analiza múltiples fuentes para encontrar las mejores oportunidades
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      Long-Tail Focus
                    </h3>
                    <p className="text-sm text-gray-600">
                      Identifica keywords long-tail con menor competencia y alta conversión
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      Datos en Tiempo Real
                    </h3>
                    <p className="text-sm text-gray-600">
                      Obtén datos actualizados de volumen de búsqueda y tendencias
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
      <HomeFloatingButton />
    </div>
  );
}
