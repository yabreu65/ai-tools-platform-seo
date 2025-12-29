'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Layers, Loader2, Tag } from 'lucide-react';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';

interface KeywordCluster {
  name: string;
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
  keywords: string[];
  avgVolume: number;
  difficulty: number;
}

interface ClusterResults {
  clusters: KeywordCluster[];
  totalKeywords: number;
  avgClusterSize: number;
}

export default function KeywordClustering() {
  const [keywordList, setKeywordList] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ClusterResults | null>(null);
  const [error, setError] = useState('');

  const generateClusters = async () => {
    const keywords = keywordList.split('\n').filter(k => k.trim());
    if (keywords.length === 0) {
      setError('Ingresa al menos una keyword (una por línea)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/keyword-research/clustering/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords }),
      });

      if (!response.ok) throw new Error('Error al generar clusters');

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar clusters');
    } finally {
      setIsLoading(false);
    }
  };

  const getIntentColor = (intent: string) => {
    const colors: Record<string, string> = {
      informational: 'bg-blue-100 text-blue-800',
      navigational: 'bg-purple-100 text-purple-800',
      transactional: 'bg-green-100 text-green-800',
      commercial: 'bg-orange-100 text-orange-800',
    };
    return colors[intent] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Layers className="h-10 w-10 text-purple-600" />
              Agrupación de Keywords
            </h1>
            <p className="text-xl text-gray-600">
              Agrupa keywords por intención y similitud semántica usando IA
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Lista de Keywords</CardTitle>
              <CardDescription>Ingresa tus keywords (una por línea)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={'marketing digital\nseo optimization\ndigital marketing services\nwhat is seo\nhow to do seo\nbuy seo tools\nseo software comparison\n...'}
                value={keywordList}
                onChange={(e) => setKeywordList(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{keywordList.split('\n').filter(k => k.trim()).length} keywords ingresadas</span>
                <Button variant="outline" size="sm" onClick={() => setKeywordList('')}>
                  Limpiar
                </Button>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              <Button onClick={generateClusters} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generando clusters...
                  </>
                ) : (
                  <>
                    <Layers className="h-5 w-5 mr-2" />
                    Generar Clusters
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {results && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-3xl font-bold text-purple-900">{results.clusters.length}</p>
                      <p className="text-sm text-gray-600">Clusters Creados</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-900">{results.totalKeywords}</p>
                      <p className="text-sm text-gray-600">Total Keywords</p>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <p className="text-3xl font-bold text-pink-900">{Math.round(results.avgClusterSize)}</p>
                      <p className="text-sm text-gray-600">Promedio por Cluster</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {results.clusters.map((cluster, idx) => (
                  <Card key={idx} className="border-2">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-purple-600" />
                            {cluster.name}
                          </CardTitle>
                          <CardDescription>
                            {cluster.keywords.length} keywords en este cluster
                          </CardDescription>
                        </div>
                        <Badge className={getIntentColor(cluster.intent)}>
                          {cluster.intent}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Volumen Promedio</p>
                          <p className="text-lg font-bold">{cluster.avgVolume.toLocaleString()}/mes</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Dificultad Promedio</p>
                          <p className="text-lg font-bold">{cluster.difficulty}/100</p>
                        </div>
                      </div>

                      <div>
                        <p className="font-semibold mb-3">Keywords en este cluster:</p>
                        <div className="flex flex-wrap gap-2">
                          {cluster.keywords.map((kw, kidx) => (
                            <Badge key={kidx} variant="outline" className="text-sm">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!results && !isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>¿Cómo funciona el clustering?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Análisis Semántico</h3>
                    <p className="text-sm text-gray-600">
                      Usa IA para entender el significado y contexto de cada keyword
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Agrupación Inteligente</h3>
                    <p className="text-sm text-gray-600">
                      Agrupa keywords similares por tema e intención de búsqueda
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Clasificación por Intención</h3>
                    <p className="text-sm text-gray-600">
                      Identifica si son informacionales, transaccionales, comerciales o de navegación
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Optimización de Contenido</h3>
                    <p className="text-sm text-gray-600">
                      Crea contenido específico para cada cluster y maximiza tu SEO
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
