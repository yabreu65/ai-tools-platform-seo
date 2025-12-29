'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Globe, Loader2, ExternalLink, Star } from 'lucide-react';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';

interface SerpResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  description: string;
  domainAuthority: number;
  estimatedTraffic: number;
  hasRichSnippet: boolean;
  contentType: string;
}

interface SerpAnalysis {
  keyword: string;
  totalResults: number;
  topResults: SerpResult[];
  averageDA: number;
  featuredSnippet?: {
    url: string;
    content: string;
  };
  peopleAlsoAsk: string[];
  relatedSearches: string[];
}

export default function SerpAnalyzer() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SerpAnalysis | null>(null);
  const [error, setError] = useState('');

  const analyzeSERP = async () => {
    if (!keyword.trim()) {
      setError('Ingresa una keyword');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/keyword-research/serp/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, location }),
      });

      if (!response.ok) throw new Error('Error al analizar SERP');

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Globe className="h-10 w-10 text-indigo-600" />
              Análisis SERP
            </h1>
            <p className="text-xl text-gray-600">
              Analiza los resultados de búsqueda de Google en profundidad
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Analizar Resultados de Búsqueda</CardTitle>
              <CardDescription>Obtén insights de las SERPs de Google</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Palabra Clave</label>
                  <Input
                    placeholder="Ej: marketing digital"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && analyzeSERP()}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Ubicación (Opcional)</label>
                  <Input
                    placeholder="Ej: España, México..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              <Button onClick={analyzeSERP} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analizando SERP...
                  </>
                ) : (
                  <>
                    <Globe className="h-5 w-5 mr-2" />
                    Analizar SERP
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {results && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Resultados</CardTitle>
                  <CardDescription>Para: {results.keyword}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <p className="text-3xl font-bold text-indigo-900">{results.totalResults.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Resultados Totales</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-3xl font-bold text-purple-900">{results.topResults.length}</p>
                      <p className="text-sm text-gray-600">Top Resultados Analizados</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-900">{Math.round(results.averageDA)}</p>
                      <p className="text-sm text-gray-600">DA Promedio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {results.featuredSnippet && (
                <Card className="border-2 border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      Featured Snippet
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{results.featuredSnippet.url}</p>
                    <p className="bg-white p-4 rounded-lg">{results.featuredSnippet.content}</p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                <h3 className="text-xl font-bold">Top Resultados</h3>
                {results.topResults.map((result, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                            {result.position}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-semibold text-blue-600 hover:underline">
                              <a href={result.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                {result.title}
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </h4>
                            {result.hasRichSnippet && (
                              <Badge variant="secondary">Rich Snippet</Badge>
                            )}
                          </div>
                          <p className="text-sm text-green-700 mb-2">{result.domain}</p>
                          <p className="text-sm text-gray-600 mb-3">{result.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">DA: {result.domainAuthority}</Badge>
                            <Badge variant="outline">{result.estimatedTraffic.toLocaleString()} visitas/mes</Badge>
                            <Badge variant="outline">{result.contentType}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {results.peopleAlsoAsk.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>People Also Ask</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.peopleAlsoAsk.map((question, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium">{question}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {results.relatedSearches.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Búsquedas Relacionadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {results.relatedSearches.map((search, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm">
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </div>
      <HomeFloatingButton />
    </div>
  );
}
