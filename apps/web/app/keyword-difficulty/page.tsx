'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Target, AlertTriangle, CheckCircle, Loader2, Plus, X } from 'lucide-react';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';

interface DifficultyResult {
  keyword: string;
  difficulty: number;
  competition: 'low' | 'medium' | 'high';
  estimatedTime: string;
  topCompetitors: number;
  recommendation: string;
}

export default function KeywordDifficulty() {
  const [keywords, setKeywords] = useState(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DifficultyResult[]>([]);
  const [error, setError] = useState('');

  const addKeyword = () => setKeywords([...keywords, '']);
  const removeKeyword = (index: number) => setKeywords(keywords.filter((_, i) => i !== index));
  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const analyzeKeywords = async () => {
    const validKeywords = keywords.filter(k => k.trim());
    if (validKeywords.length === 0) {
      setError('Ingresa al menos una keyword');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/keyword-research/difficulty/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: validKeywords }),
      });

      if (!response.ok) throw new Error('Error al analizar dificultad');

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-600';
    if (difficulty < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyBg = (difficulty: number) => {
    if (difficulty < 30) return 'bg-green-50 border-green-200';
    if (difficulty < 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Target className="h-10 w-10 text-orange-600" />
              Análisis de Dificultad de Keywords
            </h1>
            <p className="text-xl text-gray-600">
              Descubre qué tan difícil es posicionar para tus keywords objetivo
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Keywords a Analizar</CardTitle>
              <CardDescription>Agrega las keywords que quieres evaluar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {keywords.map((kw, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder="Ej: marketing digital"
                    value={kw}
                    onChange={(e) => updateKeyword(idx, e.target.value)}
                  />
                  {keywords.length > 1 && (
                    <Button variant="outline" size="icon" onClick={() => removeKeyword(idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addKeyword} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Keyword
              </Button>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              <Button onClick={analyzeKeywords} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Target className="h-5 w-5 mr-2" />
                    Analizar Dificultad
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Resultados del Análisis</h2>
              {results.map((result, idx) => (
                <Card key={idx} className={`border-2 ${getDifficultyBg(result.difficulty)}`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{result.keyword}</h3>
                        <Badge variant={result.competition === 'low' ? 'secondary' : result.competition === 'medium' ? 'default' : 'destructive'}>
                          Competencia: {result.competition}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className={`text-4xl font-bold ${getDifficultyColor(result.difficulty)}`}>
                          {result.difficulty}
                        </p>
                        <p className="text-sm text-gray-600">Dificultad</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Progress value={result.difficulty} className="h-3" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Tiempo Estimado</p>
                        <p className="font-semibold">{result.estimatedTime}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Competidores Top</p>
                        <p className="font-semibold">{result.topCompetitors} dominios</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <p className="font-semibold mb-2 flex items-center gap-2">
                        {result.difficulty < 30 ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        )}
                        Recomendación
                      </p>
                      <p className="text-gray-700">{result.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!results.length && !isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>¿Qué es la dificultad de keywords?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    La dificultad de keyword es una métrica que indica qué tan difícil es posicionar en las primeras posiciones de Google para una palabra clave específica.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="font-semibold text-green-900 mb-2">Baja (0-30)</p>
                      <p className="text-sm text-green-800">Fácil de posicionar, ideal para comenzar</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="font-semibold text-yellow-900 mb-2">Media (31-60)</p>
                      <p className="text-sm text-yellow-800">Requiere esfuerzo moderado y contenido de calidad</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="font-semibold text-red-900 mb-2">Alta (61-100)</p>
                      <p className="text-sm text-red-800">Muy competitiva, requiere autoridad de dominio</p>
                    </div>
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
