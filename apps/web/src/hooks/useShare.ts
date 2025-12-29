'use client';

import { useCallback, useState, useEffect } from 'react';
import { useShare } from '@/contexts/ShareContext';
import { useNotifications } from '@/hooks/useNotifications';

// Hook para compartir resultados
export const useShareResult = () => {
  const { 
    createShareableResult, 
    generateShareLink, 
    shareToSocial,
    exportAsImage,
    exportAsPDF,
    exportAsJSON
  } = useShare();
  const { showSuccess, showError, showLoading } = useNotifications();

  const [isSharing, setIsSharing] = useState(false);

  const shareResult = useCallback(async (
    toolName: string,
    title: string,
    data: any,
    options?: {
      description?: string;
      isPublic?: boolean;
      allowComments?: boolean;
      expiresIn?: number;
      password?: string;
    }
  ) => {
    try {
      setIsSharing(true);
      const loadingId = showLoading('Creando resultado compartible...');
      
      const result = await createShareableResult(toolName, title, data, options);
      const shareLink = await generateShareLink(result.id);
      
      // Copiar al portapapeles
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareLink.shortUrl);
        showSuccess('Enlace copiado al portapapeles');
      }
      
      return { result, shareLink };
    } catch (error) {
      showError('Error al compartir resultado');
      throw error;
    } finally {
      setIsSharing(false);
    }
  }, [createShareableResult, generateShareLink, showSuccess, showError, showLoading]);

  const shareToSocialMedia = useCallback(async (
    resultId: string,
    platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp'
  ) => {
    try {
      await shareToSocial(resultId, platform);
      showSuccess(`Compartido en ${platform}`);
    } catch (error) {
      showError(`Error al compartir en ${platform}`);
    }
  }, [shareToSocial, showSuccess, showError]);

  return {
    shareResult,
    shareToSocialMedia,
    isSharing
  };
};

// Hook para exportar resultados
export const useExportResult = () => {
  const { exportAsImage, exportAsPDF, exportAsJSON } = useShare();
  const { showSuccess, showError, showLoading } = useNotifications();

  const [isExporting, setIsExporting] = useState(false);

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const exportImage = useCallback(async (
    resultId: string,
    format: 'png' | 'jpg' | 'svg' = 'png',
    filename?: string
  ) => {
    try {
      setIsExporting(true);
      const loadingId = showLoading('Exportando imagen...');
      
      const blob = await exportAsImage(resultId, format);
      const finalFilename = filename || `resultado-${resultId}.${format}`;
      
      downloadBlob(blob, finalFilename);
      showSuccess('Imagen exportada exitosamente');
    } catch (error) {
      showError('Error al exportar imagen');
    } finally {
      setIsExporting(false);
    }
  }, [exportAsImage, downloadBlob, showSuccess, showError, showLoading]);

  const exportPDF = useCallback(async (resultId: string, filename?: string) => {
    try {
      setIsExporting(true);
      const loadingId = showLoading('Exportando PDF...');
      
      const blob = await exportAsPDF(resultId);
      const finalFilename = filename || `resultado-${resultId}.pdf`;
      
      downloadBlob(blob, finalFilename);
      showSuccess('PDF exportado exitosamente');
    } catch (error) {
      showError('Error al exportar PDF');
    } finally {
      setIsExporting(false);
    }
  }, [exportAsPDF, downloadBlob, showSuccess, showError, showLoading]);

  const exportJSON = useCallback(async (resultId: string, filename?: string) => {
    try {
      setIsExporting(true);
      const loadingId = showLoading('Exportando JSON...');
      
      const blob = await exportAsJSON(resultId);
      const finalFilename = filename || `resultado-${resultId}.json`;
      
      downloadBlob(blob, finalFilename);
      showSuccess('JSON exportado exitosamente');
    } catch (error) {
      showError('Error al exportar JSON');
    } finally {
      setIsExporting(false);
    }
  }, [exportAsJSON, downloadBlob, showSuccess, showError, showLoading]);

  return {
    exportImage,
    exportPDF,
    exportJSON,
    isExporting
  };
};

// Hook para gestionar enlaces de compartir
export const useShareLinks = () => {
  const { 
    generateShareLink, 
    revokeShareLink, 
    getShareLink,
    sharedResults 
  } = useShare();
  const { showSuccess, showError } = useNotifications();

  const [links, setLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createLink = useCallback(async (
    resultId: string,
    options?: { expiresIn?: number; customSlug?: string }
  ) => {
    try {
      setIsLoading(true);
      const link = await generateShareLink(resultId, options);
      
      // Copiar al portapapeles
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(link.shortUrl);
        showSuccess('Enlace copiado al portapapeles');
      }
      
      return link;
    } catch (error) {
      showError('Error al crear enlace');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [generateShareLink, showSuccess, showError]);

  const revokeLink = useCallback(async (linkId: string) => {
    try {
      await revokeShareLink(linkId);
      showSuccess('Enlace revocado');
    } catch (error) {
      showError('Error al revocar enlace');
    }
  }, [revokeShareLink, showSuccess, showError]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showSuccess('Copiado al portapapeles');
      } else {
        // Fallback para navegadores sin soporte
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccess('Copiado al portapapeles');
      }
    } catch (error) {
      showError('Error al copiar al portapapeles');
    }
  }, [showSuccess, showError]);

  return {
    createLink,
    revokeLink,
    copyToClipboard,
    isLoading
  };
};

// Hook para estadísticas de compartir
export const useShareStats = (resultId?: string) => {
  const { sharedResults, getResultById } = useShare();
  const [stats, setStats] = useState({
    totalViews: 0,
    totalShares: 0,
    totalDownloads: 0,
    results: 0
  });

  useEffect(() => {
    if (resultId) {
      // Estadísticas de un resultado específico
      const result = getResultById(resultId);
      if (result) {
        setStats({
          totalViews: result.stats.views,
          totalShares: result.stats.shares,
          totalDownloads: result.stats.downloads,
          results: 1
        });
      }
    } else {
      // Estadísticas globales
      const globalStats = sharedResults.reduce(
        (acc, result) => ({
          totalViews: acc.totalViews + result.stats.views,
          totalShares: acc.totalShares + result.stats.shares,
          totalDownloads: acc.totalDownloads + result.stats.downloads,
          results: acc.results + 1
        }),
        { totalViews: 0, totalShares: 0, totalDownloads: 0, results: 0 }
      );
      setStats(globalStats);
    }
  }, [sharedResults, resultId, getResultById]);

  return stats;
};

// Hook para validar URLs de compartir
export const useShareValidation = () => {
  const validateShareOptions = useCallback((options: {
    title?: string;
    description?: string;
    expiresIn?: number;
    password?: string;
  }) => {
    const errors: string[] = [];

    if (options.title && options.title.length < 3) {
      errors.push('El título debe tener al menos 3 caracteres');
    }

    if (options.title && options.title.length > 100) {
      errors.push('El título no puede exceder 100 caracteres');
    }

    if (options.description && options.description.length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }

    if (options.expiresIn && (options.expiresIn < 1 || options.expiresIn > 365)) {
      errors.push('La expiración debe estar entre 1 y 365 días');
    }

    if (options.password && options.password.length < 4) {
      errors.push('La contraseña debe tener al menos 4 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateUrl = useCallback((url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    validateShareOptions,
    validateUrl
  };
};

// Hook para compartir con QR
export const useQRShare = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQR = useCallback(async (url: string) => {
    try {
      setIsGenerating(true);
      
      // Generar QR usando una API pública (en producción usarías una librería como qrcode)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      setQrCode(qrUrl);
      
      return qrUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadQR = useCallback(async (url: string, filename?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename || 'qr-code.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  }, []);

  return {
    generateQR,
    downloadQR,
    qrCode,
    isGenerating
  };
};