'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Filter, 
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Star,
  BarChart3
} from 'lucide-react';

interface KeywordData {
  keyword: string;
  position?: number | null;
  positionChange?: number;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  trafficPotential: number;
  serpFeatures: string[];
  intent?: 'informational' | 'commercial' | 'transactional' | 'navigational';
  competition?: 'low' | 'medium' | 'high';
  trend?: 'up' | 'down' | 'stable';
}

interface KeywordTableProps {
  data: KeywordData[];
  title?: string;
  showSelection?: boolean;
  showFilters?: boolean;
  showExport?: boolean;
  onKeywordSelect?: (keywords: string[]) => void;
  onKeywordClick?: (keyword: string) => void;
  className?: string;
}

const KeywordTable: React.FC<KeywordTableProps> = ({
  data,
  title = 'Keywords',
  showSelection = false,
  showFilters = true,
  showExport = true,
  onKeywordSelect,
  onKeywordClick,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof KeywordData>('searchVolume');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    minVolume: '',
    maxVolume: '',
    minDifficulty: '',
    maxDifficulty: '',
    intent: 'all',
    competition: 'all',
    trend: 'all',
    hasFeatures: false
  });

  // Filtrar y ordenar datos
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      const matchesSearch = item.keyword.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMinVolume = !filters.minVolume || item.searchVolume >= parseInt(filters.minVolume);
      const matchesMaxVolume = !filters.maxVolume || item.searchVolume <= parseInt(filters.maxVolume);
      const matchesMinDifficulty = !filters.minDifficulty || item.difficulty >= parseInt(filters.minDifficulty);
      const matchesMaxDifficulty = !filters.maxDifficulty || item.difficulty <= parseInt(filters.maxDifficulty);
      const matchesIntent = filters.intent === 'all' || item.intent === filters.intent;
      const matchesCompetition = filters.competition === 'all' || item.competition === filters.competition;
      const matchesTrend = filters.trend === 'all' || item.trend === filters.trend;
      const matchesFeatures = !filters.hasFeatures || item.serpFeatures.length > 0;

      return matchesSearch && matchesMinVolume && matchesMaxVolume && 
             matchesMinDifficulty && matchesMaxDifficulty && matchesIntent && 
             matchesCompetition && matchesTrend && matchesFeatures;
    });

    // Ordenar
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection, filters]);

  const handleSort = (field: keyof KeywordData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleKeywordSelection = (keyword: string, checked: boolean) => {
    const newSelection = checked 
      ? [...selectedKeywords, keyword]
      : selectedKeywords.filter(k => k !== keyword);
    
    setSelectedKeywords(newSelection);
    onKeywordSelect?.(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? filteredAndSortedData.map(item => item.keyword) : [];
    setSelectedKeywords(newSelection);
    onKeywordSelect?.(newSelection);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'bg-green-100 text-green-800';
    if (difficulty < 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getVolumeColor = (volume: number) => {
    if (volume < 1000) return 'text-gray-600';
    if (volume < 10000) return 'text-blue-600';
    return 'text-green-600 font-semibold';
  };

  const getTrendIcon = (trend?: string, change?: number) => {
    if (change !== undefined) {
      if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
      if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
    
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Keyword', 'Position', 'Volume', 'Difficulty', 'CPC', 'Traffic Potential', 'SERP Features', 'Intent'].join(','),
      ...filteredAndSortedData.map(item => [
        item.keyword,
        item.position || 'N/A',
        item.searchVolume,
        item.difficulty,
        item.cpc,
        item.trafficPotential,
        item.serpFeatures.join(';'),
        item.intent || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keywords-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SortButton = ({ field, children }: { field: keyof KeywordData; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 px-2 text-left justify-start font-medium"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
      )}
      {sortField !== field && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
    </Button>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
            <Badge variant="secondary">{filteredAndSortedData.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {showExport && (
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
            {showSelection && selectedKeywords.length > 0 && (
              <Badge variant="default">
                {selectedKeywords.length} seleccionadas
              </Badge>
            )}
          </div>
        </div>
        
        {showFilters && (
          <div className="space-y-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtros */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              <Input
                placeholder="Vol. mín"
                value={filters.minVolume}
                onChange={(e) => setFilters(prev => ({ ...prev, minVolume: e.target.value }))}
                type="number"
              />
              <Input
                placeholder="Vol. máx"
                value={filters.maxVolume}
                onChange={(e) => setFilters(prev => ({ ...prev, maxVolume: e.target.value }))}
                type="number"
              />
              <Input
                placeholder="Dif. mín"
                value={filters.minDifficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, minDifficulty: e.target.value }))}
                type="number"
                max="100"
              />
              <Input
                placeholder="Dif. máx"
                value={filters.maxDifficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, maxDifficulty: e.target.value }))}
                type="number"
                max="100"
              />
              <Select value={filters.intent} onValueChange={(value) => setFilters(prev => ({ ...prev, intent: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Intención" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="informational">Informacional</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                  <SelectItem value="transactional">Transaccional</SelectItem>
                  <SelectItem value="navigational">Navegacional</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.competition} onValueChange={(value) => setFilters(prev => ({ ...prev, competition: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Competencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasFeatures"
                  checked={filters.hasFeatures}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasFeatures: checked as boolean }))}
                />
                <label htmlFor="hasFeatures" className="text-sm">Con features</label>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {showSelection && (
                  <th className="text-left p-2">
                    <Checkbox
                      checked={selectedKeywords.length === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                )}
                <th className="text-left p-2">
                  <SortButton field="keyword">Keyword</SortButton>
                </th>
                <th className="text-left p-2">
                  <SortButton field="position">Posición</SortButton>
                </th>
                <th className="text-left p-2">
                  <SortButton field="searchVolume">Volumen</SortButton>
                </th>
                <th className="text-left p-2">
                  <SortButton field="difficulty">Dificultad</SortButton>
                </th>
                <th className="text-left p-2">
                  <SortButton field="cpc">CPC</SortButton>
                </th>
                <th className="text-left p-2">
                  <SortButton field="trafficPotential">Tráfico</SortButton>
                </th>
                <th className="text-left p-2">Features</th>
                <th className="text-left p-2">Tendencia</th>
                <th className="text-left p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  {showSelection && (
                    <td className="p-2">
                      <Checkbox
                        checked={selectedKeywords.includes(item.keyword)}
                        onCheckedChange={(checked) => handleKeywordSelection(item.keyword, checked as boolean)}
                      />
                    </td>
                  )}
                  <td className="p-2">
                    <div className="flex flex-col">
                      <span 
                        className={`font-medium ${onKeywordClick ? 'cursor-pointer hover:text-blue-600' : ''}`}
                        onClick={() => onKeywordClick?.(item.keyword)}
                      >
                        {item.keyword}
                      </span>
                      {item.intent && (
                        <Badge variant="outline" className="w-fit mt-1 text-xs">
                          {item.intent}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {item.position ? (
                        <span className={`font-medium ${item.position <= 10 ? 'text-green-600' : item.position <= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                          #{item.position}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                      {item.positionChange !== undefined && getTrendIcon(undefined, item.positionChange)}
                    </div>
                  </td>
                  <td className="p-2">
                    <span className={getVolumeColor(item.searchVolume)}>
                      {item.searchVolume.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-2">
                    <Badge className={getDifficultyColor(item.difficulty)}>
                      {item.difficulty}%
                    </Badge>
                  </td>
                  <td className="p-2">
                    <span className="text-green-600 font-medium">
                      ${item.cpc.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className="font-medium">
                      {item.trafficPotential.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      {item.serpFeatures.slice(0, 2).map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {item.serpFeatures.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.serpFeatures.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    {getTrendIcon(item.trend, item.positionChange)}
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onKeywordClick?.(item.keyword)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAndSortedData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron keywords que coincidan con los filtros</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KeywordTable;