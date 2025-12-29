'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  Download, 
  Calendar,
  Clock,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExportRecord {
  id: string;
  toolType: string;
  title: string;
  format: 'pdf' | 'csv' | 'json';
  createdAt: string;
  fileSize?: number;
  downloadUrl?: string;
  status: 'completed' | 'processing' | 'failed';
}

export function ExportHistory() {
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExportHistory();
  }, []);

  const loadExportHistory = async () => {
    setIsLoading(true);
    try {
      // Simular carga de historial (implementar API real)
      const mockExports: ExportRecord[] = [
        {
          id: '1',
          toolType: 'title-generator',
          title: 'Generador de Títulos SEO',
          format: 'pdf',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          fileSize: 245760, // 240 KB
          status: 'completed'
        },
        {
          id: '2',
          toolType: 'keyword-research',
          title: 'Investigación de Palabras Clave',
          format: 'csv',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          fileSize: 15360, // 15 KB
          status: 'completed'
        },
        {
          id: '3',
          toolType: 'seo-audit',
          title: 'Auditoría SEO',
          format: 'pdf',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          fileSize: 512000, // 500 KB
          status: 'completed'
        }
      ];
      
      setExports(mockExports);
    } catch (error) {
      console.error('Error loading export history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case 'json':
        return <FileJson className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getToolTypeLabel = (toolType: string) => {
    const labels: Record<string, string> = {
      'title-generator': 'Generador de Títulos',
      'keyword-research': 'Investigación de Keywords',
      'seo-audit': 'Auditoría SEO',
      'core-vitals': 'Core Web Vitals',
      'content-optimizer': 'Optimizador de Contenido',
      'duplicate-detector': 'Detector de Duplicados'
    };
    return labels[toolType] || toolType;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (exportRecord: ExportRecord) => {
    // Implementar descarga real
    console.log('Downloading:', exportRecord);
  };

  const handleDelete = (exportId: string) => {
    setExports(prev => prev.filter(exp => exp.id !== exportId));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historial de Exportaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historial de Exportaciones
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadExportHistory}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {exports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay exportaciones</h3>
            <p className="text-muted-foreground">
              Tus reportes exportados aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {exports.map((exportRecord) => (
              <div
                key={exportRecord.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getFormatIcon(exportRecord.format)}
                  <div>
                    <h4 className="font-medium">{exportRecord.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {getToolTypeLabel(exportRecord.toolType)}
                      </Badge>
                      <span>•</span>
                      <span>{exportRecord.format.toUpperCase()}</span>
                      {exportRecord.fileSize && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(exportRecord.fileSize)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(exportRecord.createdAt), {
                        addSuffix: true,
                        locale: es
                      })}
                    </div>
                    <Badge 
                      variant={exportRecord.status === 'completed' ? 'default' : 
                               exportRecord.status === 'processing' ? 'secondary' : 'destructive'}
                      className="text-xs mt-1"
                    >
                      {exportRecord.status === 'completed' ? 'Completado' :
                       exportRecord.status === 'processing' ? 'Procesando' : 'Error'}
                    </Badge>
                  </div>

                  <div className="flex gap-1">
                    {exportRecord.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(exportRecord)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(exportRecord.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}