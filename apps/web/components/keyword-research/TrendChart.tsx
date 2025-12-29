'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Target,
  Eye
} from 'lucide-react';

interface TrendDataPoint {
  date: string;
  volume: number;
  difficulty?: number;
  cpc?: number;
  competition?: number;
  interest?: number;
}

interface SeasonalityData {
  month: string;
  avgVolume: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  seasonalityData?: SeasonalityData[];
  keyword?: string;
  title?: string;
  showSeasonality?: boolean;
  showMultipleMetrics?: boolean;
  timeRange?: '7d' | '30d' | '90d' | '1y' | '2y';
  onTimeRangeChange?: (range: string) => void;
  className?: string;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  seasonalityData = [],
  keyword,
  title,
  showSeasonality = false,
  showMultipleMetrics = false,
  timeRange = '90d',
  onTimeRangeChange,
  className = ''
}) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'difficulty' | 'cpc' | 'competition'>('volume');
  const [showComparison, setShowComparison] = useState(false);

  // Calcular estadísticas
  const stats = React.useMemo(() => {
    if (data.length === 0) return null;

    const currentValue = data[data.length - 1]?.[selectedMetric] || 0;
    const previousValue = data[data.length - 2]?.[selectedMetric] || 0;
    const change = currentValue - previousValue;
    const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;
    
    const maxValue = Math.max(...data.map(d => d[selectedMetric] || 0));
    const minValue = Math.min(...data.map(d => d[selectedMetric] || 0));
    const avgValue = data.reduce((sum, d) => sum + (d[selectedMetric] || 0), 0) / data.length;

    return {
      current: currentValue,
      change,
      changePercent,
      max: maxValue,
      min: minValue,
      avg: avgValue,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }, [data, selectedMetric]);

  // Formatear datos para el tooltip
  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'volume':
        return [value.toLocaleString(), 'Volumen'];
      case 'difficulty':
        return [`${value}%`, 'Dificultad'];
      case 'cpc':
        return [`$${value.toFixed(2)}`, 'CPC'];
      case 'competition':
        return [`${value}%`, 'Competencia'];
      case 'interest':
        return [`${value}%`, 'Interés'];
      default:
        return [value, name];
    }
  };

  // Colores para las métricas
  const metricColors = {
    volume: '#3b82f6',
    difficulty: '#ef4444',
    cpc: '#10b981',
    competition: '#f59e0b',
    interest: '#8b5cf6'
  };

  // Datos para el gráfico de estacionalidad
  const seasonalityChartData = seasonalityData.map(item => ({
    ...item,
    color: item.trend === 'up' ? '#10b981' : item.trend === 'down' ? '#ef4444' : '#6b7280'
  }));

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={formatTooltipValue}
              labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
            />
            <Legend />
            {showMultipleMetrics ? (
              <>
                <Area type="monotone" dataKey="volume" stackId="1" stroke={metricColors.volume} fill={metricColors.volume} fillOpacity={0.6} />
                <Area type="monotone" dataKey="difficulty" stackId="2" stroke={metricColors.difficulty} fill={metricColors.difficulty} fillOpacity={0.6} />
                <Area type="monotone" dataKey="cpc" stackId="3" stroke={metricColors.cpc} fill={metricColors.cpc} fillOpacity={0.6} />
              </>
            ) : (
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={metricColors[selectedMetric]} 
                fill={metricColors[selectedMetric]} 
                fillOpacity={0.6} 
              />
            )}
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={formatTooltipValue}
              labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
            />
            <Legend />
            {showMultipleMetrics ? (
              <>
                <Bar dataKey="volume" fill={metricColors.volume} />
                <Bar dataKey="difficulty" fill={metricColors.difficulty} />
                <Bar dataKey="cpc" fill={metricColors.cpc} />
              </>
            ) : (
              <Bar dataKey={selectedMetric} fill={metricColors[selectedMetric]} />
            )}
          </BarChart>
        );
      
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={formatTooltipValue}
              labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
            />
            <Legend />
            {showMultipleMetrics ? (
              <>
                <Line type="monotone" dataKey="volume" stroke={metricColors.volume} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="difficulty" stroke={metricColors.difficulty} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="cpc" stroke={metricColors.cpc} strokeWidth={2} dot={{ r: 4 }} />
              </>
            ) : (
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={metricColors[selectedMetric]} 
                strokeWidth={2} 
                dot={{ r: 4 }} 
              />
            )}
          </LineChart>
        );
    }
  };

  const renderSeasonalityChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={seasonalityChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value, name) => [`${value.toLocaleString()}`, 'Volumen Promedio']}
        />
        <Bar dataKey="avgVolume" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Estadísticas principales */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actual</p>
                  <p className="text-2xl font-bold">
                    {selectedMetric === 'volume' && stats.current.toLocaleString()}
                    {selectedMetric === 'difficulty' && `${stats.current}%`}
                    {selectedMetric === 'cpc' && `$${stats.current.toFixed(2)}`}
                    {selectedMetric === 'competition' && `${stats.current}%`}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex items-center mt-2">
                {stats.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : stats.trend === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                ) : null}
                <span className={`text-sm ${stats.changePercent > 0 ? 'text-green-600' : stats.changePercent < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {stats.changePercent > 0 ? '+' : ''}{stats.changePercent.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Máximo</p>
                  <p className="text-xl font-semibold text-green-600">
                    {selectedMetric === 'volume' && stats.max.toLocaleString()}
                    {selectedMetric === 'difficulty' && `${stats.max}%`}
                    {selectedMetric === 'cpc' && `$${stats.max.toFixed(2)}`}
                    {selectedMetric === 'competition' && `${stats.max}%`}
                  </p>
                </div>
                <Target className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Promedio</p>
                  <p className="text-xl font-semibold text-blue-600">
                    {selectedMetric === 'volume' && Math.round(stats.avg).toLocaleString()}
                    {selectedMetric === 'difficulty' && `${Math.round(stats.avg)}%`}
                    {selectedMetric === 'cpc' && `$${stats.avg.toFixed(2)}`}
                    {selectedMetric === 'competition' && `${Math.round(stats.avg)}%`}
                  </p>
                </div>
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mínimo</p>
                  <p className="text-xl font-semibold text-red-600">
                    {selectedMetric === 'volume' && stats.min.toLocaleString()}
                    {selectedMetric === 'difficulty' && `${stats.min}%`}
                    {selectedMetric === 'cpc' && `$${stats.min.toFixed(2)}`}
                    {selectedMetric === 'competition' && `${stats.min}%`}
                  </p>
                </div>
                <Zap className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {title || `Tendencias${keyword ? ` - ${keyword}` : ''}`}
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Selector de rango de tiempo */}
              <Select value={timeRange} onValueChange={onTimeRangeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 días</SelectItem>
                  <SelectItem value="30d">30 días</SelectItem>
                  <SelectItem value="90d">90 días</SelectItem>
                  <SelectItem value="1y">1 año</SelectItem>
                  <SelectItem value="2y">2 años</SelectItem>
                </SelectContent>
              </Select>

              {/* Selector de tipo de gráfico */}
              <Select value={chartType} onValueChange={(value: 'line' | 'area' | 'bar') => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Línea</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                  <SelectItem value="bar">Barras</SelectItem>
                </SelectContent>
              </Select>

              {/* Selector de métrica */}
              {!showMultipleMetrics && (
                <Select value={selectedMetric} onValueChange={(value: 'volume' | 'difficulty' | 'cpc' | 'competition') => setSelectedMetric(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volume">Volumen</SelectItem>
                    <SelectItem value="difficulty">Dificultad</SelectItem>
                    <SelectItem value="cpc">CPC</SelectItem>
                    <SelectItem value="competition">Competencia</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Toggle para múltiples métricas */}
              <Button
                variant={showMultipleMetrics ? "default" : "outline"}
                size="sm"
                onClick={() => setShowMultipleMetrics(!showMultipleMetrics)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Multi
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            {renderChart()}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de estacionalidad */}
      {showSeasonality && seasonalityData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Análisis de Estacionalidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderSeasonalityChart()}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2">
              {seasonalityData.map((item, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm font-medium">{item.month}</p>
                  <p className="text-xs text-gray-600">{item.avgVolume.toLocaleString()}</p>
                  <Badge 
                    variant={item.trend === 'up' ? 'default' : item.trend === 'down' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {item.percentage > 0 ? '+' : ''}{item.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrendChart;