'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Activity, Users, TrendingUp, Clock, Eye, MousePointer,
  Calendar, Filter, Download, RefreshCw, AlertCircle
} from 'lucide-react';
import { useAnalytics, useRealTimeMetrics } from '@/hooks/useAnalytics';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, value, change, icon, color, loading 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
          {loading ? (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded"></div>
          ) : (
            value
          )}
        </p>
        {change !== undefined && (
          <p className={`text-sm mt-2 flex items-center ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {change >= 0 ? '+' : ''}{change}%
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, actions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      {actions}
    </div>
    {children}
  </motion.div>
);

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const AnalyticsDashboard: React.FC = () => {
  const { currentMetrics, getMetrics } = useAnalytics();
  const { metrics, isLoading, error, refresh } = useRealTimeMetrics();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [selectedTool, setSelectedTool] = useState<string>('all');

  useEffect(() => {
    getMetrics(timeRange);
  }, [timeRange, getMetrics]);

  const handleTimeRangeChange = (range: 'day' | 'week' | 'month') => {
    setTimeRange(range);
  };

  const handleExport = () => {
    // Implementar exportación de datos
    const dataStr = JSON.stringify(currentMetrics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Error cargando analytics</p>
          <button
            onClick={refresh}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const toolUsageData = currentMetrics?.toolUsage ? Object.entries(currentMetrics.toolUsage).map(([tool, data]) => ({
    name: tool,
    usage: Array.isArray(data) ? data.length : 0,
    success: Array.isArray(data) ? data.filter(d => d.action === 'complete').length : 0
  })) : [];

  const pageViewsData = currentMetrics?.pageViews ? Object.entries(currentMetrics.pageViews).map(([page, views]) => ({
    name: page.replace('/', '') || 'home',
    views: Array.isArray(views) ? views.length : views
  })) : [];

  const eventsData = currentMetrics?.events ? Object.entries(
    currentMetrics.events.reduce((acc: any, event) => {
      const key = event.category;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([category, count]) => ({
    name: category,
    value: count
  })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Seguimiento de uso y métricas de rendimiento
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['day', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {range === 'day' ? 'Hoy' : range === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          
          {/* Actions */}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleExport}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Usuarios Activos"
          value={currentMetrics?.sessions?.length || 0}
          change={12}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          loading={isLoading}
        />
        
        <MetricCard
          title="Páginas Vistas"
          value={Object.values(currentMetrics?.pageViews || {}).reduce((acc: number, views) => 
            acc + (Array.isArray(views) ? views.length : views), 0
          )}
          change={8}
          icon={<Eye className="w-6 h-6 text-white" />}
          color="bg-green-500"
          loading={isLoading}
        />
        
        <MetricCard
          title="Herramientas Usadas"
          value={Object.keys(currentMetrics?.toolUsage || {}).length}
          change={-3}
          icon={<Activity className="w-6 h-6 text-white" />}
          color="bg-yellow-500"
          loading={isLoading}
        />
        
        <MetricCard
          title="Conversiones"
          value={currentMetrics?.conversions?.length || 0}
          change={25}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="bg-purple-500"
          loading={isLoading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool Usage Chart */}
        <ChartContainer title="Uso de Herramientas">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={toolUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usage" fill="#3B82F6" />
              <Bar dataKey="success" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Page Views Chart */}
        <ChartContainer title="Páginas Más Visitadas">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={pageViewsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Events Distribution */}
        <ChartContainer title="Distribución de Eventos">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {eventsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Real-time Activity */}
        <ChartContainer 
          title="Actividad en Tiempo Real"
          actions={
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">En vivo</span>
            </div>
          }
        >
          <div className="space-y-4">
            {currentMetrics?.events?.slice(-5).map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.action} - {event.category}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {event.label}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </motion.div>
            )) || (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No hay actividad reciente
              </div>
            )}
          </div>
        </ChartContainer>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tools */}
        <ChartContainer title="Herramientas Más Populares">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Herramienta</th>
                  <th className="text-right py-2 text-gray-600 dark:text-gray-400">Usos</th>
                  <th className="text-right py-2 text-gray-600 dark:text-gray-400">Éxito</th>
                </tr>
              </thead>
              <tbody>
                {toolUsageData.slice(0, 5).map((tool, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 text-gray-900 dark:text-white">{tool.name}</td>
                    <td className="py-2 text-right text-gray-600 dark:text-gray-400">{tool.usage}</td>
                    <td className="py-2 text-right">
                      <span className="text-green-600 dark:text-green-400">
                        {tool.usage > 0 ? Math.round((tool.success / tool.usage) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>

        {/* Recent Conversions */}
        <ChartContainer title="Conversiones Recientes">
          <div className="space-y-3">
            {currentMetrics?.conversions?.slice(-5).map((conversion, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {conversion.type}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(conversion.timestamp).toLocaleString()}
                  </p>
                </div>
                {conversion.value && (
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    ${conversion.value}
                  </span>
                )}
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No hay conversiones recientes
              </div>
            )}
          </div>
        </ChartContainer>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;