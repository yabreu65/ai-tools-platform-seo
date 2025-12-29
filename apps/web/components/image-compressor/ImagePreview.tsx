'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, EyeOff } from 'lucide-react';

interface CompressedImage {
  originalName: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  quality: number;
  mimeType: string;
  compressedData: string;
}

interface ImagePreviewProps {
  image: CompressedImage;
  originalFile: File;
  onDownload: (image: CompressedImage) => void;
}

export function ImagePreview({ image, originalFile, onDownload }: ImagePreviewProps) {
  const [showComparison, setShowComparison] = useState(false);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [compressedPreview, setCompressedPreview] = useState<string>('');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const loadPreviews = async () => {
    if (!showComparison && !originalPreview) {
      // Cargar preview original
      const originalUrl = URL.createObjectURL(originalFile);
      setOriginalPreview(originalUrl);

      // Cargar preview comprimido
      const byteCharacters = atob(image.compressedData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: image.mimeType });
      const compressedUrl = URL.createObjectURL(blob);
      setCompressedPreview(compressedUrl);
    }
    setShowComparison(!showComparison);
  };

  const getCompressionColor = (ratio: number) => {
    if (ratio >= 50) return 'bg-success-500';
    if (ratio >= 30) return 'bg-warning-500';
    return 'bg-primary';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium truncate max-w-xs">
            {image.originalName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              className={`${getCompressionColor(image.compressionRatio)} text-white`}
            >
              -{image.compressionRatio}%
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPreviews}
            >
              {showComparison ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(image)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Original</div>
            <div className="text-sm font-medium">{formatFileSize(image.originalSize)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Comprimido</div>
            <div className="text-sm font-medium">{formatFileSize(image.compressedSize)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Ahorrado</div>
            <div className="text-sm font-medium text-success-600">
              {formatFileSize(image.originalSize - image.compressedSize)}
            </div>
          </div>
        </div>

        {/* Comparación visual */}
        {showComparison && originalPreview && compressedPreview && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Original</div>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={originalPreview}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Comprimido ({image.format.toUpperCase()}, {image.quality}%)
                </div>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={compressedPreview}
                    alt="Comprimido"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
            
            {/* Barra de progreso de compresión */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Reducción de tamaño</span>
                <span className="font-medium">{image.compressionRatio}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getCompressionColor(image.compressionRatio)}`}
                  style={{ width: `${Math.min(image.compressionRatio, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}