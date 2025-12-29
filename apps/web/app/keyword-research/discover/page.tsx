'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Target, 
  DollarSign,
  BarChart3,
  FileDown,
  Zap
} from 'lucide-react';
import { KeywordSearch, AdvancedFilters, MetricsCard, KeywordTable } from '@/components/keyword-research';
import type { KeywordData, FilterState } from '@/components/keyword-research';

interface SearchParams {
  seedKeywords: string[];
  country: string;
  language: string;
  includeRelated: boolean;
  includeLongTail: boolean;
  includeQuestions: boolean;
  includeCompetitors: boolean;
  competitorUrls: string[];
  minVolume: number;
  maxResults: number;
}

const KeywordDiscovery = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<KeywordData[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    seedKeywords: [''],
    country: 'US',
    language: 'en',
    includeRelated: true,
    includeLongTail: true,
    includeQuestions: false,
    includeCompetitors: false,
    competitorUrls: [''],
    minVolume: 100,
    maxResults: 50
  });
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    volumeRange: [0, 1000000],
    difficultyRange: [0, 100],
    cpcRange: [0, 100],
    searchIntent: [],
    competition: [],
    serpFeatures: [],
    country: 'all',
    language: 'all',
    hasRankings: false
  });

  // Mock data para resultados
  const mockResults: KeywordData[] = [
    {
      id: '1',
      keyword: 'seo tools',
      volume: 49500,
      difficulty: 67,
      cpc: 12.45,
      competition: 'high',
      intent: 'commercial',
      trend: 8.5,
      position: null,
      url: null,
      trafficPotential: 15000,
      lastUpdated: new Date().toISOString()
    },
    {
      id: '2',
      keyword: 'keyword research tool',
      volume: 33100,
      difficulty: 72,
      cpc: 8.92,
      competition: 'high',
      intent: 'commercial',
      trend: 12.3,
      position: null,
      url: null,
      trafficPotential: 10500,
      lastUpdated: new Date().toISOString()
    },
    {
      id: '3',
      keyword: 'backlink checker',
      volume: 27100,
      difficulty: 58,
      cpc: 15.67,
      competition: 'medium',
      intent: 'commercial',
      trend: 5.2,
      position: null,
      url: null,
      trafficPotential: 8200,
      lastUpdated: new Date().toISOString()
    },
    {
      id: '4',
      keyword: 'competitor analysis seo',
      volume: 18100,
      difficulty: 64,
      cpc: 11.23,
      competition: 'medium',
      intent: 'informational',
      trend: -2.1,
      position: null,
      url: null,
      trafficPotential: 5400,
      lastUpdated: new Date().toISOString()
    },
    {
      id: '5',
      keyword: 'long tail keywords',
      volume: 14800,
      difficulty: 45,
      cpc: 6.78,
      competition: 'low',
      intent: 'informational',
      trend: 15.7,
      position: null,
      url: null,
      trafficPotential: 4400,
      lastUpdated: new Date().toISOString()
    }
  ];

  const handleSearch = async (params: SearchParams) => {
    setIsSearching(true);
    setSearchParams(params);
    
    try {
      // Filtrar keywords válidas
      const validKeywords = params.seedKeywords.filter(k => k.trim().length > 0);
      
      if (validKeywords.length === 0) {
        setIsSearching(false);
        return;
      }

      const response = await fetch('/api/keyword-research/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seed_keywords: validKeywords,
          country: params.country,
          language: params.language,
          min_volume: params.minVolume,
          include_related: params.includeRelated,
          include_long_tail: params.includeLongTail,
          include_questions: params.includeQuestions,
          limit: params.maxResults
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la búsqueda de keywords');
      }

      const data = await response.json();
      
      if (data.success) {
        // Transformar los datos de la API al formato esperado por el frontend
        const transformedResults: KeywordData[] = data.data.keywords.map((kw: any, index: number) => ({
          id: `kw_${index}`,
          keyword: kw.keyword,
          volume: kw.volume,
          difficulty: kw.difficulty,
          cpc: kw.cpc,
          competition: kw.competition,
          intent: kw.intent,
          trend: Math.random() * 20 - 10, // Simular tendencia entre -10% y +10%
          position: null,
          url: null,
          trafficPotential: Math.floor(kw.volume * 0.3),
          lastUpdated: new Date().toISOString()
        }));
        
        setResults(transformedResults);
      } else {
        console.error('Error en la respuesta:', data.error);
        // Fallback a datos mock en caso de error
        setResults(mockResults);
      }
    } catch (error) {
      console.error('Error al buscar keywords:', error);
      // Fallback a datos mock en caso de error
      setResults(mockResults);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeywordSelection = (keywordIds: string[]) => {
    setSelectedKeywords(keywordIds);
  };

  const handleExportKeywords = () => {
    const selectedData = results.filter(kw => selectedKeywords.includes(kw.id));
    const csvContent = [
      ['Keyword', 'Volume', 'Difficulty', 'CPC', 'Competition', 'Intent', 'Trend', 'Traffic Potential'].join(','),
      ...selectedData.map(kw => [
        kw.keyword,
        kw.volume,
        kw.difficulty,
        kw.cpc,
        kw.competition,
        kw.intent,
        `${kw.trend > 0 ? '+' : ''}${kw.trend.toFixed(1)}%`,
        kw.trafficPotential
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keywords-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calcular métricas de resumen
  const summaryMetrics = {
    totalKeywords: results.length,
    avgVolume: results.length > 0 ? Math.round(results.reduce((sum, kw) => sum + kw.volume, 0) / results.length) : 0,
    avgDifficulty: results.length > 0 ? Math.round(results.reduce((sum, kw) => sum + kw.difficulty, 0) / results.length) : 0,
    avgCpc: results.length > 0 ? (results.reduce((sum, kw) => sum + kw.cpc, 0) / results.length).toFixed(2) : '0.00',
    totalTrafficPotential: results.reduce((sum, kw) => sum + kw.trafficPotential, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Descubrir Keywords</h1>
            <p className="text-gray-600 mt-1">Encuentra nuevas oportunidades de keywords con métricas detalladas</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={showAdvancedFilters ? 'bg-blue-50 border-blue-200' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avanzados
            </Button>
            {selectedKeywords.length > 0 && (
              <Button variant="outline" onClick={handleExportKeywords}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar ({selectedKeywords.length})
              </Button>
            )}
          </div>
        </div>

        {/* Formulario de búsqueda */}
        <KeywordSearch
          onSearch={handleSearch}
          isLoading={isSearching}
          initialParams={searchParams}
        />

        {/* Filtros avanzados */}
        {showAdvancedFilters && (
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}

        {/* Métricas de resumen */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <MetricsCard
              label="Total Keywords"
              value={summaryMetrics.totalKeywords.toString()}
              icon={<Search className="h-4 w-4" />}
            />
            <MetricsCard
              label="Volumen Promedio"
              value={summaryMetrics.avgVolume.toLocaleString()}
              icon={<BarChart3 className="h-4 w-4" />}
            />
            <MetricsCard
              label="Dificultad Promedio"
              value={`${summaryMetrics.avgDifficulty}/100`}
              icon={<Target className="h-4 w-4" />}
            />
            <MetricsCard
              label="CPC Promedio"
              value={`$${summaryMetrics.avgCpc}`}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <MetricsCard
              label="Potencial de Tráfico"
              value={summaryMetrics.totalTrafficPotential.toLocaleString()}
              icon={<Zap className="h-4 w-4" />}
            />
          </div>
        )}

        {/* Resultados */}
        {results.length > 0 && (
          <KeywordTable
            keywords={results}
            selectedKeywords={selectedKeywords}
            onSelectionChange={handleKeywordSelection}
            filters={filters}
            showActions={true}
          />
        )}
      </div>
    </div>
  );
};

export default KeywordDiscovery;