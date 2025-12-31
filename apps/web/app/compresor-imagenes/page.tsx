'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import HomeFloatingButton from '@/components/inicio-comun/HomeFloatingButton';
import { getApiUrl } from '@/lib/api';
import { 
  Upload, 
  Download, 
  Image as ImageIcon, 
  Zap, 
  BarChart3, 
  FileImage, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { toast } from 'sonner';
import { ImagePreview } from '@/components/image-compressor/ImagePreview';
import { saveAs } from 'file-saver';

interface CompressedImage {
  originalName: string;
  compressedData: string;
  originalSize: number;
  compressedSize: number;
  format: string;
  quality: number;
  mimeType: string;
  compressionRatio: number;
}

interface CompressionStats {
  totalImages: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalSavings: number;
  averageCompressionRatio: number;
  spaceSavedPercentage: number;
}

export default function CompresorImagenesPage() {
  const { user } = useAuth();
  const { currentPlan, canCompressImages, incrementUsage } = usePlan();
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState([80]);
  const [format, setFormat] = useState<string>('original');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompressedImage[]>([]);
  const [stats, setStats] = useState<CompressionStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
    );
    
    if (imageFiles.length !== acceptedFiles.length) {
      toast.error('Algunos archivos no son imágenes válidas (JPEG, PNG, WebP)');
    }
    
    // Verificar límites del plan
    const totalFiles = files.length + imageFiles.length;
    
    if (!canCompressImages(imageFiles.length)) {
      setError('Has alcanzado el límite de tu plan. Actualiza para comprimir más imágenes.');
      return;
    }

    // Verificar tamaño de archivos
    const maxSize = currentPlan?.limits.maxImageSize || 2 * 1024 * 1024; // 2MB por defecto
    const oversizedFiles = imageFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setError(`Algunos archivos exceden el límite de ${Math.round(maxSize / (1024 * 1024))}MB de tu plan.`);
      return;
    }
    
    setFiles(prev => [...prev, ...imageFiles]);
    setError(null);
  }, [files.length, canCompressImages, currentPlan]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setStats(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressImages = async () => {
    if (files.length === 0) {
      toast.error('Selecciona al menos una imagen');
      return;
    }

    // Verificar límites antes de procesar
    if (!canCompressImages(files.length)) {
      setError('Has alcanzado el límite de tu plan. Actualiza para comprimir más imágenes.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setStats(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      formData.append('quality', quality[0].toString());
      if (format !== 'original') {
        formData.append('format', format);
      }
      formData.append('userPlan', user?.plan || 'free');

      const response = await fetch(getApiUrl('api/compresor-imagenes/compress'), {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al comprimir las imágenes');
      }

      setResults(data.data.images);
      setStats(data.data.statistics);
      
      toast.success(`${data.data.images.length} imágenes comprimidas exitosamente`);
      
      // Incrementar el uso después de una compresión exitosa
      incrementUsage('image-compression');
      
      // Tracking de uso
      await fetch('/api/analytics/tools', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "image compressor",
          slug: "compresor-imagenes",
          usedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          language: navigator.language
        }),
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (image: CompressedImage) => {
    try {
      const byteCharacters = atob(image.compressedData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: image.mimeType });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compressed_${image.originalName}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Descargando ${image.originalName}`);
    } catch (error) {
      toast.error('Error al descargar la imagen');
    }
  };

  const downloadAll = () => {
    results.forEach(image => {
      setTimeout(() => downloadImage(image), 100);
    });
  };

  const getPlanLimits = () => {
    if (!currentPlan) return { maxFiles: 3, maxSize: '2MB' };
    
    return {
      maxFiles: currentPlan.limits.maxImagesPerBatch,
      maxSize: `${Math.round(currentPlan.limits.maxImageSize / (1024 * 1024))}MB`
    };
  };

  const planLimits = getPlanLimits();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <HomeFloatingButton />
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Compresor de Imágenes SEO
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Optimiza tus imágenes para web reduciendo su tamaño sin perder calidad. Mejora la velocidad de carga de tu sitio.
            </p>
            <Card className="max-w-3xl mx-auto border bg-card">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Comprime imágenes JPEG, PNG y WebP con algoritmos avanzados.
                  <span className="font-medium text-primary ml-1">
                    Reduce hasta un 80% el tamaño</span> manteniendo la calidad visual.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Plan Limits Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="border-l-4 border-l-primary bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="font-medium">Plan {currentPlan?.name || 'Gratuito'}:</span>
                <span>Hasta {planLimits.maxFiles} imágenes por lote</span>
                <span>•</span>
                <span>Máximo {planLimits.maxSize} por imagen</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Compression Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-lg border bg-card">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Comprimir Imágenes
              </CardTitle>
              <CardDescription>
                Arrastra y suelta tus imágenes o haz clic para seleccionarlas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/10' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-primary font-medium">Suelta las imágenes aquí...</p>
                ) : (
                  <div>
                    <p className="text-foreground font-medium mb-2">
                      Arrastra imágenes aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Soporta JPEG, PNG y WebP • Máximo {planLimits.maxSize} por imagen
                    </p>
                  </div>
                )}
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Imágenes seleccionadas ({files.length})
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Limpiar todo
                    </Button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileImage className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium truncate max-w-xs">
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compression Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Calidad de compresión: {quality[0]}%
                  </Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mayor calidad = mayor tamaño de archivo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Formato de salida</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Mantener original</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="webp">WebP (más eficiente)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Card className="border-destructive bg-destructive/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Compress Button */}
              <Button
                onClick={compressImages}
                disabled={files.length === 0 || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Comprimiendo...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Comprimir {files.length} imagen{files.length !== 1 ? 'es' : ''}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        {stats && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mt-8 space-y-6"
          >
            {/* Statistics Card */}
            <Card className="border-success bg-success/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success-700">
                  <BarChart3 className="h-5 w-5" />
                  Estadísticas de Compresión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success-600">
                      {stats.totalImages}
                    </div>
                    <div className="text-sm text-muted-foreground">Imágenes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success-600">
                      {formatFileSize(stats.totalSavings)}
                    </div>
                    <div className="text-sm text-muted-foreground">Ahorrado</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success-600">
                      {stats.spaceSavedPercentage}%
                    </div>
                    <div className="text-sm text-muted-foreground">Reducción</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success-600">
                      {stats.averageCompressionRatio}%
                    </div>
                    <div className="text-sm text-muted-foreground">Promedio</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Imágenes Comprimidas
                  </CardTitle>
                  <Button onClick={downloadAll} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((image, index) => (
                    <ImagePreview
                      key={index}
                      image={image}
                      originalFile={files[index]}
                      onDownload={downloadImage}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}