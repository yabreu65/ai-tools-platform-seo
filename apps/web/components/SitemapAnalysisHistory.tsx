'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Map, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download, 
  Calendar,
  Clock,
  Globe,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface SitemapAnalysis {
  _id: string;
  userId: string;
  url: string;
  status: 'ok' | 'missing' | 'invalid' | 'error';
  message: string;
  sitemap?: string;
  downloadUrl?: string;
  metadata: {
    linksFound: number;
    sitemapSize: number;
    processingTime: number;
    userAgent: string;
    ipAddress: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AnalysisHistoryResponse {
  analyses: SitemapAnalysis[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface AnalysisStats {
  monthlyAnalyses: number;
  totalStats: {
    total: number;
    successful: number;
    failed: number;
    avgProcessingTime: number;
  };
}

export default function SitemapAnalysisHistory() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<SitemapAnalysis[]>([]);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    if (user) {
      loadAnalysisHistory();
      loadStats();
    }
  }, [user, currentPage]);

  const loadAnalysisHistory = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/generador-sitemap/history?page=${currentPage}&limit=10`, {
        headers: {
          'x-user-id': user?.id || '',
          'x-user-email': user?.email || '',
          'x-user-plan': user?.plan || 'free'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el historial');
      }

      const data: AnalysisHistoryResponse = await response.json();
      setAnalyses(data.analyses);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading analysis history:', error);
      toast.error('Error al cargar el historial de análisis');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/generador-sitemap/stats', {
        headers: {
          'x-user-id': user?.id || '',
          'x-user-email': user?.email || '',
          'x-user-plan': user?.plan || 'free'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las estadísticas');
      }

      const data: AnalysisStats = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'missing':
      case 'invalid':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'missing':
      case 'invalid':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ok':
        return 'Exitoso';
      case 'missing':
        return 'Faltante';
      case 'invalid':
        return 'Inválido';
      case 'error':
        return 'Error';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const handleDownload = (downloadUrl: string, url: string) => {
    const link = document.createElement('a');
    link.href = `http://localhost:3001${downloadUrl}`;
    link.download = `sitemap-${new URL(url).hostname}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Inicia sesión para ver tu historial de análisis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Este mes</p>
                  <p className="text-2xl font-bold">{stats.monthlyAnalyses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{stats.totalStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Exitosos</p>
                  <p className="text-2xl font-bold">{stats.totalStats.successful}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Tiempo promedio</p>
                  <p className="text-2xl font-bold">{formatProcessingTime(stats.totalStats.avgProcessingTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Historial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Historial de Análisis de Sitemap
          </CardTitle>
          <CardDescription>
            Revisa todos tus análisis de sitemap anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-8">
              <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tienes análisis de sitemap aún</p>
              <p className="text-sm text-muted-foreground mt-2">
                Usa el generador de sitemap para crear tu primer análisis
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div key={analysis._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(analysis.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium truncate">{analysis.url}</p>
                          <Badge className={getStatusColor(analysis.status)}>
                            {getStatusText(analysis.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{analysis.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(analysis.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {analysis.metadata.linksFound} enlaces
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatProcessingTime(analysis.metadata.processingTime)}
                          </div>
                        </div>
                      </div>
                    </div>
                    {analysis.downloadUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(analysis.downloadUrl!, analysis.url)}
                        className="ml-4"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} análisis
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={pagination.page === pagination.pages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}