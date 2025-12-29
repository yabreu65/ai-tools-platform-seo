'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

export interface ShareableResult {
  id: string;
  userId: string;
  toolName: string;
  title: string;
  description?: string;
  data: any; // Datos del análisis
  metadata: {
    createdAt: number;
    expiresAt?: number;
    isPublic: boolean;
    allowComments: boolean;
    password?: string;
  };
  stats: {
    views: number;
    shares: number;
    downloads: number;
  };
}

export interface ShareLink {
  id: string;
  resultId: string;
  shortUrl: string;
  fullUrl: string;
  expiresAt?: number;
  isActive: boolean;
  createdAt: number;
}

export interface ShareContextType {
  // Results
  sharedResults: ShareableResult[];
  
  // Actions
  createShareableResult: (toolName: string, title: string, data: any, options?: {
    description?: string;
    isPublic?: boolean;
    allowComments?: boolean;
    expiresIn?: number; // días
    password?: string;
  }) => Promise<ShareableResult>;
  
  updateShareableResult: (resultId: string, updates: Partial<ShareableResult>) => Promise<void>;
  deleteShareableResult: (resultId: string) => Promise<void>;
  
  // Share links
  generateShareLink: (resultId: string, options?: {
    expiresIn?: number; // días
    customSlug?: string;
  }) => Promise<ShareLink>;
  
  getShareLink: (linkId: string) => Promise<ShareableResult | null>;
  revokeShareLink: (linkId: string) => Promise<void>;
  
  // Social sharing
  shareToSocial: (resultId: string, platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => Promise<void>;
  
  // Export
  exportAsImage: (resultId: string, format?: 'png' | 'jpg' | 'svg') => Promise<Blob>;
  exportAsPDF: (resultId: string) => Promise<Blob>;
  exportAsJSON: (resultId: string) => Promise<Blob>;
  
  // Analytics
  trackView: (resultId: string, viewerInfo?: any) => Promise<void>;
  trackShare: (resultId: string, platform: string) => Promise<void>;
  trackDownload: (resultId: string, format: string) => Promise<void>;
  
  // Data fetching
  loadSharedResults: () => Promise<void>;
  getResultById: (resultId: string) => ShareableResult | null;
  
  // State
  isLoading: boolean;
  error: string | null;
}

const ShareContext = createContext<ShareContextType | undefined>(undefined);

export const ShareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  
  const [sharedResults, setSharedResults] = useState<ShareableResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Utilidades de almacenamiento
  const saveToStorage = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(`share_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }, []);

  const loadFromStorage = useCallback((key: string) => {
    try {
      const data = localStorage.getItem(`share_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from storage:', error);
      return null;
    }
  }, []);

  // Generar ID único
  const generateId = useCallback(() => {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  // Generar URL corta
  const generateShortUrl = useCallback((id: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yatools.com';
    return `${baseUrl}/share/${id}`;
  }, []);

  // Crear resultado compartible
  const createShareableResult = useCallback(async (
    toolName: string, 
    title: string, 
    data: any, 
    options: {
      description?: string;
      isPublic?: boolean;
      allowComments?: boolean;
      expiresIn?: number;
      password?: string;
    } = {}
  ): Promise<ShareableResult> => {
    if (!user) {
      throw new Error('Debes iniciar sesión para compartir resultados');
    }

    try {
      setIsLoading(true);
      
      const resultId = generateId();
      const now = Date.now();
      const expiresAt = options.expiresIn ? now + (options.expiresIn * 24 * 60 * 60 * 1000) : undefined;

      const result: ShareableResult = {
        id: resultId,
        userId: user.id,
        toolName,
        title,
        description: options.description,
        data,
        metadata: {
          createdAt: now,
          expiresAt,
          isPublic: options.isPublic ?? true,
          allowComments: options.allowComments ?? true,
          password: options.password
        },
        stats: {
          views: 0,
          shares: 0,
          downloads: 0
        }
      };

      // Guardar en storage
      const allResults = loadFromStorage('results') || [];
      allResults.push(result);
      saveToStorage('results', allResults);

      // Actualizar estado
      setSharedResults(prev => [...prev, result]);
      
      showSuccess('Resultado compartible creado exitosamente');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating shareable result';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, generateId, loadFromStorage, saveToStorage, showSuccess, showError]);

  // Actualizar resultado
  const updateShareableResult = useCallback(async (resultId: string, updates: Partial<ShareableResult>) => {
    if (!user) return;

    try {
      const allResults = loadFromStorage('results') || [];
      const resultIndex = allResults.findIndex((r: ShareableResult) => r.id === resultId && r.userId === user.id);

      if (resultIndex >= 0) {
        allResults[resultIndex] = { ...allResults[resultIndex], ...updates };
        saveToStorage('results', allResults);
        
        setSharedResults(prev => prev.map(r => r.id === resultId ? { ...r, ...updates } : r));
        showSuccess('Resultado actualizado');
      }
    } catch (err) {
      showError('Error al actualizar el resultado');
    }
  }, [user, loadFromStorage, saveToStorage, showSuccess, showError]);

  // Eliminar resultado
  const deleteShareableResult = useCallback(async (resultId: string) => {
    if (!user) return;

    try {
      const allResults = loadFromStorage('results') || [];
      const filteredResults = allResults.filter(
        (r: ShareableResult) => !(r.id === resultId && r.userId === user.id)
      );

      saveToStorage('results', filteredResults);
      setSharedResults(prev => prev.filter(r => r.id !== resultId));
      
      // También eliminar enlaces asociados
      const allLinks = loadFromStorage('links') || [];
      const filteredLinks = allLinks.filter((l: ShareLink) => l.resultId !== resultId);
      saveToStorage('links', filteredLinks);
      
      showSuccess('Resultado eliminado');
    } catch (err) {
      showError('Error al eliminar el resultado');
    }
  }, [user, loadFromStorage, saveToStorage, showSuccess, showError]);

  // Generar enlace de compartir
  const generateShareLink = useCallback(async (
    resultId: string, 
    options: { expiresIn?: number; customSlug?: string } = {}
  ): Promise<ShareLink> => {
    try {
      const linkId = options.customSlug || generateId();
      const now = Date.now();
      const expiresAt = options.expiresIn ? now + (options.expiresIn * 24 * 60 * 60 * 1000) : undefined;

      const shareLink: ShareLink = {
        id: linkId,
        resultId,
        shortUrl: generateShortUrl(linkId),
        fullUrl: generateShortUrl(linkId),
        expiresAt,
        isActive: true,
        createdAt: now
      };

      // Guardar enlace
      const allLinks = loadFromStorage('links') || [];
      allLinks.push(shareLink);
      saveToStorage('links', allLinks);

      return shareLink;
    } catch (err) {
      throw new Error('Error generating share link');
    }
  }, [generateId, generateShortUrl, loadFromStorage, saveToStorage]);

  // Obtener resultado por enlace
  const getShareLink = useCallback(async (linkId: string): Promise<ShareableResult | null> => {
    try {
      const allLinks = loadFromStorage('links') || [];
      const link = allLinks.find((l: ShareLink) => l.id === linkId && l.isActive);

      if (!link) return null;

      // Verificar expiración
      if (link.expiresAt && Date.now() > link.expiresAt) {
        return null;
      }

      const allResults = loadFromStorage('results') || [];
      const result = allResults.find((r: ShareableResult) => r.id === link.resultId);

      if (result) {
        // Incrementar vistas
        await trackView(result.id);
      }

      return result || null;
    } catch (err) {
      return null;
    }
  }, [loadFromStorage]);

  // Revocar enlace
  const revokeShareLink = useCallback(async (linkId: string) => {
    try {
      const allLinks = loadFromStorage('links') || [];
      const linkIndex = allLinks.findIndex((l: ShareLink) => l.id === linkId);

      if (linkIndex >= 0) {
        allLinks[linkIndex].isActive = false;
        saveToStorage('links', allLinks);
        showSuccess('Enlace revocado');
      }
    } catch (err) {
      showError('Error al revocar el enlace');
    }
  }, [loadFromStorage, saveToStorage, showSuccess, showError]);

  // Compartir en redes sociales
  const shareToSocial = useCallback(async (resultId: string, platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
    try {
      const result = sharedResults.find(r => r.id === resultId);
      if (!result) return;

      const shareLink = await generateShareLink(resultId);
      const text = `${result.title} - Análisis realizado con YA Tools`;
      const url = shareLink.shortUrl;

      let shareUrl = '';
      
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
          break;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        await trackShare(resultId, platform);
      }
    } catch (err) {
      showError('Error al compartir en redes sociales');
    }
  }, [sharedResults, generateShareLink, showError]);

  // Exportar como imagen
  const exportAsImage = useCallback(async (resultId: string, format: 'png' | 'jpg' | 'svg' = 'png'): Promise<Blob> => {
    try {
      const result = sharedResults.find(r => r.id === resultId);
      if (!result) throw new Error('Resultado no encontrado');

      // Crear canvas para generar imagen
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('No se pudo crear el contexto del canvas');

      canvas.width = 1200;
      canvas.height = 630;

      // Fondo
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Título
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(result.title, canvas.width / 2, 100);

      // Descripción
      if (result.description) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '24px Arial';
        ctx.fillText(result.description, canvas.width / 2, 150);
      }

      // Datos del análisis (simplificado)
      ctx.fillStyle = '#374151';
      ctx.font = '20px Arial';
      ctx.textAlign = 'left';
      
      const dataText = `Herramienta: ${result.toolName}`;
      ctx.fillText(dataText, 50, 250);
      
      const dateText = `Fecha: ${new Date(result.metadata.createdAt).toLocaleDateString()}`;
      ctx.fillText(dateText, 50, 280);

      // Logo/Marca
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('YA Tools', canvas.width / 2, canvas.height - 50);

      // Convertir a blob
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            trackDownload(resultId, format);
            resolve(blob);
          } else {
            reject(new Error('Error generating image'));
          }
        }, `image/${format}`, 0.9);
      });
    } catch (err) {
      throw new Error('Error exporting as image');
    }
  }, [sharedResults]);

  // Exportar como PDF
  const exportAsPDF = useCallback(async (resultId: string): Promise<Blob> => {
    try {
      const result = sharedResults.find(r => r.id === resultId);
      if (!result) throw new Error('Resultado no encontrado');

      // Simular generación de PDF (en producción usarías una librería como jsPDF)
      const pdfContent = `
        ${result.title}
        ${result.description || ''}
        
        Herramienta: ${result.toolName}
        Fecha: ${new Date(result.metadata.createdAt).toLocaleDateString()}
        
        Datos del análisis:
        ${JSON.stringify(result.data, null, 2)}
        
        Generado por YA Tools
      `;

      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      await trackDownload(resultId, 'pdf');
      return blob;
    } catch (err) {
      throw new Error('Error exporting as PDF');
    }
  }, [sharedResults]);

  // Exportar como JSON
  const exportAsJSON = useCallback(async (resultId: string): Promise<Blob> => {
    try {
      const result = sharedResults.find(r => r.id === resultId);
      if (!result) throw new Error('Resultado no encontrado');

      const jsonData = {
        ...result,
        exportedAt: new Date().toISOString(),
        exportedBy: 'YA Tools'
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      await trackDownload(resultId, 'json');
      return blob;
    } catch (err) {
      throw new Error('Error exporting as JSON');
    }
  }, [sharedResults]);

  // Tracking de vistas
  const trackView = useCallback(async (resultId: string, viewerInfo?: any) => {
    try {
      const allResults = loadFromStorage('results') || [];
      const resultIndex = allResults.findIndex((r: ShareableResult) => r.id === resultId);

      if (resultIndex >= 0) {
        allResults[resultIndex].stats.views += 1;
        saveToStorage('results', allResults);
        
        setSharedResults(prev => prev.map(r => 
          r.id === resultId 
            ? { ...r, stats: { ...r.stats, views: r.stats.views + 1 } }
            : r
        ));
      }
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  }, [loadFromStorage, saveToStorage]);

  // Tracking de compartir
  const trackShare = useCallback(async (resultId: string, platform: string) => {
    try {
      const allResults = loadFromStorage('results') || [];
      const resultIndex = allResults.findIndex((r: ShareableResult) => r.id === resultId);

      if (resultIndex >= 0) {
        allResults[resultIndex].stats.shares += 1;
        saveToStorage('results', allResults);
        
        setSharedResults(prev => prev.map(r => 
          r.id === resultId 
            ? { ...r, stats: { ...r.stats, shares: r.stats.shares + 1 } }
            : r
        ));
      }
    } catch (err) {
      console.error('Error tracking share:', err);
    }
  }, [loadFromStorage, saveToStorage]);

  // Tracking de descargas
  const trackDownload = useCallback(async (resultId: string, format: string) => {
    try {
      const allResults = loadFromStorage('results') || [];
      const resultIndex = allResults.findIndex((r: ShareableResult) => r.id === resultId);

      if (resultIndex >= 0) {
        allResults[resultIndex].stats.downloads += 1;
        saveToStorage('results', allResults);
        
        setSharedResults(prev => prev.map(r => 
          r.id === resultId 
            ? { ...r, stats: { ...r.stats, downloads: r.stats.downloads + 1 } }
            : r
        ));
      }
    } catch (err) {
      console.error('Error tracking download:', err);
    }
  }, [loadFromStorage, saveToStorage]);

  // Cargar resultados
  const loadSharedResults = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const allResults = loadFromStorage('results') || [];
      const userResults = allResults.filter((r: ShareableResult) => r.userId === user.id);
      setSharedResults(userResults);
    } catch (err) {
      setError('Error loading shared results');
    } finally {
      setIsLoading(false);
    }
  }, [user, loadFromStorage]);

  // Obtener resultado por ID
  const getResultById = useCallback((resultId: string): ShareableResult | null => {
    return sharedResults.find(r => r.id === resultId) || null;
  }, [sharedResults]);

  const value: ShareContextType = {
    sharedResults,
    createShareableResult,
    updateShareableResult,
    deleteShareableResult,
    generateShareLink,
    getShareLink,
    revokeShareLink,
    shareToSocial,
    exportAsImage,
    exportAsPDF,
    exportAsJSON,
    trackView,
    trackShare,
    trackDownload,
    loadSharedResults,
    getResultById,
    isLoading,
    error
  };

  return (
    <ShareContext.Provider value={value}>
      {children}
    </ShareContext.Provider>
  );
};

export const useShare = () => {
  const context = useContext(ShareContext);
  if (!context) {
    throw new Error('useShare must be used within a ShareProvider');
  }
  return context;
};

export default ShareContext;