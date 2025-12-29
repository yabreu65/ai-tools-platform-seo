'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';

interface TrendData {
  keyword: string;
  trend: 'rising' | 'stable' | 'declining';
  searchVolume: number;
  monthlyData: { month: string; volume: number }[];
  yearOverYear: number;
  seasonality: string;
  forecast: string;
}

export default function KeywordTrends() {
  const [keyword, setKeyword] = useState('');
  const [timeframe, setTimeframe] = useState('12');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TrendData | null>(null);
  const [error, setError] = useState('');

  const analyzeTrends = async () => {
    if (!keyword.trim()) {
      setError('Ingresa una keyword');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/keyword-research/trends/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, timeframe: parseInt(timeframe) }),
      });

      if (!response.ok) throw new Error('Error al analizar tendencias');

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar');
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'rising') return <TrendingUp className="h-6 w-6 text-green-600" />;
    if (trend === 'declining') return <TrendingDown className="h-6 w-6 text-red-600" />;
    return <Minus className="h-6 w-6 text-gray-600" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'rising') return 'text-green-600';
    if (trend === 'declining') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <TrendingUp className="h-10 w-10 text-green-600" />
              Análisis de Tendencias de Keywords
            </h1>
            <p className="text-xl text-gray-600">
              Descubre keywords en tendencia y analiza su volumen de búsqueda a lo largo del tiempo
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Analizar Tendencias</CardTitle>
              <CardDescription>Ingresa una keyword para ver su tendencia histórica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Palabra Clave</label>
                  <Input
                    placeholder="Ej: inteligencia artificial"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && analyzeTrends()}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Período</label>
                  <select className="w-full px-3 py-2 border rounded-md" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                    <option value="3">3 meses</option>
                    <option value="6">6 meses</option>
                    <option value="12">12 meses</option>
                    <option value="24">24 meses</option>
                  </select>
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

              <Button onClick={analyzeTrends} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analizando tendencias...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Analizar Tendencias
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {results && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Tendencia General</span>
                    <Badge className={getTrendColor(results.trend)}>
                      {results.trend === 'rising' && 'En Alza'}
                      {results.trend === 'declining' && 'En Declive'}
                      {results.trend === 'stable' && 'Estable'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      {getTrendIcon(results.trend)}
                      <p className="text-2xl font-bold mt-2">{results.searchVolume.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Búsquedas/mes</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      {results.yearOverYear >= 0 ? (
                        <ArrowUp className="h-6 w-6 text-green-600 mx-auto" />
                      ) : (
                        <ArrowDown className="h-6 w-6 text-red-600 mx-auto" />
                      )}
                      <p className="text-2xl font-bold mt-2">{results.yearOverYear > 0 ? '+' : ''}{results.yearOverYear}%</p>
                      <p className="text-sm text-gray-600">vs año anterior</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Estacionalidad</p>
                      <p className="font-semibold">{results.seasonality}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Datos Mensuales</CardTitle>
                  <CardDescription>Volumen de búsqueda por mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.monthlyData.map((data, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{data.month}</span>
                        <span className="text-blue-600 font-bold">{data.volume.toLocaleString()} búsquedas</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle>Pronóstico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{results.forecast}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
      <HomeFloatingButton />
    </div>
  );
}
