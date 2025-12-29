'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Search,
  Target,
  DollarSign,
  BarChart3,
  Users,
  Eye,
  MousePointer
} from 'lucide-react';

interface MetricData {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  color?: 'default' | 'green' | 'red' | 'blue' | 'yellow';
  format?: 'number' | 'currency' | 'percentage';
}

interface MetricsCardProps {
  title: string;
  metrics: MetricData[];
  className?: string;
  layout?: 'grid' | 'list';
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  metrics,
  className = '',
  layout = 'grid'
}) => {
  const formatValue = (value: string | number, format?: string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value.toLocaleString();
    }
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

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'red':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'blue':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'yellow':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={layout === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getColorClasses(metric.color)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {metric.icon}
                  <span className="text-sm font-medium text-gray-600">
                    {metric.label}
                  </span>
                </div>
                {(metric.trend || metric.change !== undefined) && (
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend, metric.change)}
                    {metric.change !== undefined && (
                      <span className={`text-xs font-medium ${
                        metric.change > 0 ? 'text-green-600' : 
                        metric.change < 0 ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {formatValue(metric.value, metric.format)}
                </span>
                {metric.changeLabel && (
                  <Badge variant="secondary" className="text-xs">
                    {metric.changeLabel}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente específico para métricas de keywords
export const KeywordMetrics: React.FC<{
  totalKeywords: number;
  avgVolume: number;
  avgDifficulty: number;
  avgCpc: number;
  totalTraffic: number;
  className?: string;
}> = ({
  totalKeywords,
  avgVolume,
  avgDifficulty,
  avgCpc,
  totalTraffic,
  className
}) => {
  const metrics: MetricData[] = [
    {
      label: 'Total Keywords',
      value: totalKeywords,
      icon: <Search className="h-4 w-4" />,
      color: 'blue',
      format: 'number'
    },
    {
      label: 'Avg. Search Volume',
      value: avgVolume,
      icon: <BarChart3 className="h-4 w-4" />,
      color: 'green',
      format: 'number'
    },
    {
      label: 'Avg. Difficulty',
      value: avgDifficulty,
      icon: <Target className="h-4 w-4" />,
      color: avgDifficulty > 60 ? 'red' : avgDifficulty > 30 ? 'yellow' : 'green',
      format: 'number'
    },
    {
      label: 'Avg. CPC',
      value: avgCpc,
      icon: <DollarSign className="h-4 w-4" />,
      color: 'blue',
      format: 'currency'
    },
    {
      label: 'Traffic Potential',
      value: totalTraffic,
      icon: <Users className="h-4 w-4" />,
      color: 'green',
      format: 'number'
    },
    {
      label: 'Opportunities',
      value: Math.floor(totalKeywords * 0.3),
      icon: <Eye className="h-4 w-4" />,
      color: 'yellow',
      format: 'number'
    }
  ];

  return (
    <MetricsCard
      title="Keyword Overview"
      metrics={metrics}
      className={className}
      layout="grid"
    />
  );
};

export default MetricsCard;