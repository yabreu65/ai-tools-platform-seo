'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';

export type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'telegram' | 'email' | 'copy' | 'qr';
export type ShareContentType = 'url' | 'text' | 'image' | 'file' | 'analysis';

export interface ShareContent {
  id?: string;
  type: ShareContentType;
  title: string;
  description?: string;
  url?: string;
  text?: string;
  image?: string;
  file?: File;
  data?: any; // For analysis results or other structured data
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ShareOptions {
  platforms?: SharePlatform[];
  customMessage?: string;
  hashtags?: string[];
  via?: string; // Twitter via parameter
  trackShares?: boolean;
  generateQR?: boolean;
  shortUrl?: boolean;
  analytics?: boolean;
}

export interface ShareResult {
  platform: SharePlatform;
  success: boolean;
  url?: string;
  error?: string;
  timestamp: number;
  shareId?: string;
}

export interface ShareHistory {
  id: string;
  content: ShareContent;
  platform: SharePlatform;
  timestamp: number;
  success: boolean;
  url?: string;
  analytics?: {
    clicks: number;
    views: number;
    conversions: number;
  };
}

export interface ShareConfig {
  enabled: boolean;
  defaultPlatforms: SharePlatform[];
  trackingEnabled: boolean;
  analyticsEnabled: boolean;
  shortUrlService?: 'bitly' | 'tinyurl' | 'custom';
  customDomain?: string;
  socialMediaAccounts?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
}

interface ShareContextType {
  // Configuration
  config: ShareConfig;
  updateConfig: (newConfig: Partial<ShareConfig>) => void;
  
  // Core sharing functionality
  share: (content: ShareContent, options?: ShareOptions) => Promise<ShareResult[]>;
  shareToplatform: (content: ShareContent, platform: SharePlatform, options?: ShareOptions) => Promise<ShareResult>;
  
  // Quick share methods
  shareUrl: (url: string, title: string, options?: ShareOptions) => Promise<ShareResult[]>;
  shareText: (text: string, options?: ShareOptions) => Promise<ShareResult[]>;
  shareAnalysis: (analysisData: any, title: string, options?: ShareOptions) => Promise<ShareResult[]>;
  
  // URL utilities
  generateShareUrl: (content: ShareContent, platform: SharePlatform) => string;
  shortenUrl: (url: string) => Promise<string>;
  generateQRCode: (content: string) => Promise<string>;
  
  // Copy to clipboard
  copyToClipboard: (content: string) => Promise<boolean>;
  
  // Share history and analytics
  shareHistory: ShareHistory[];
  getShareHistory: (filters?: Partial<ShareHistory>) => ShareHistory[];
  clearShareHistory: () => void;
  
  // Share tracking
  trackShare: (shareId: string, event: 'click' | 'view' | 'conversion') => void;
  getShareAnalytics: (shareId: string) => ShareHistory['analytics'];
  
  // UI state
  isShareModalOpen: boolean;
  openShareModal: (content?: ShareContent) => void;
  closeShareModal: () => void;
  currentShareContent: ShareContent | null;
  
  // Platform availability
  getAvailablePlatforms: () => SharePlatform[];
  isPlatformAvailable: (platform: SharePlatform) => boolean;
}

const ShareContext = createContext<ShareContextType | undefined>(undefined);

export function ShareProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ShareConfig>({
    enabled: true,
    defaultPlatforms: ['twitter', 'facebook', 'linkedin', 'copy'],
    trackingEnabled: true,
    analyticsEnabled: true,
    shortUrlService: 'custom'
  });

  const [shareHistory, setShareHistory] = useState<ShareHistory[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentShareContent, setCurrentShareContent] = useState<ShareContent | null>(null);

  // Load share history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('share_history');
    if (stored) {
      try {
        setShareHistory(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load share history from localStorage:', error);
      }
    }
  }, []);

  // Save share history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('share_history', JSON.stringify(shareHistory));
  }, [shareHistory]);

  const updateConfig = useCallback((newConfig: Partial<ShareConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const generateShareId = () => {
    return `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateShareUrl = useCallback((content: ShareContent, platform: SharePlatform): string => {
    const baseUrl = content.url || window.location.href;
    const title = encodeURIComponent(content.title);
    const description = encodeURIComponent(content.description || '');
    const text = encodeURIComponent(content.text || content.title);

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(baseUrl)}`;
      
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}&quote=${text}`;
      
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}&title=${title}&summary=${description}`;
      
      case 'whatsapp':
        return `https://wa.me/?text=${text}%20${encodeURIComponent(baseUrl)}`;
      
      case 'telegram':
        return `https://t.me/share/url?url=${encodeURIComponent(baseUrl)}&text=${text}`;
      
      case 'email':
        return `mailto:?subject=${title}&body=${description}%0A%0A${encodeURIComponent(baseUrl)}`;
      
      default:
        return baseUrl;
    }
  }, []);

  const shortenUrl = useCallback(async (url: string): Promise<string> => {
    if (!config.shortUrlService) return url;

    try {
      // In a real implementation, this would call a URL shortening service
      // For now, return the original URL
      console.log('URL shortening would be implemented here for:', url);
      return url;
    } catch (error) {
      console.error('Failed to shorten URL:', error);
      return url;
    }
  }, [config.shortUrlService]);

  const generateQRCode = useCallback(async (content: string): Promise<string> => {
    try {
      // In a real implementation, this would generate a QR code
      // For now, return a placeholder data URL
      console.log('QR code generation would be implemented here for:', content);
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y5ZjlmOSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UVIgQ29kZTwvdGV4dD48L3N2Zz4=';
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw error;
    }
  }, []);

  const copyToClipboard = useCallback(async (content: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, []);

  const shareToplatform = useCallback(async (
    content: ShareContent, 
    platform: SharePlatform, 
    options?: ShareOptions
  ): Promise<ShareResult> => {
    const shareId = generateShareId();
    const timestamp = Date.now();

    try {
      let success = false;
      let url: string | undefined;

      if (platform === 'copy') {
        const textToCopy = content.url || content.text || content.title;
        success = await copyToClipboard(textToCopy);
        url = textToCopy;
      } else if (platform === 'qr') {
        const qrContent = content.url || content.text || content.title;
        url = await generateQRCode(qrContent);
        success = true;
      } else {
        url = generateShareUrl(content, platform);
        
        // Open share URL in new window
        if (url) {
          window.open(url, '_blank', 'width=600,height=400');
          success = true;
        }
      }

      const result: ShareResult = {
        platform,
        success,
        url,
        timestamp,
        shareId
      };

      // Add to history if tracking is enabled
      if (config.trackingEnabled && success) {
        const historyItem: ShareHistory = {
          id: shareId,
          content,
          platform,
          timestamp,
          success,
          url,
          analytics: {
            clicks: 0,
            views: 0,
            conversions: 0
          }
        };

        setShareHistory(prev => [historyItem, ...prev]);
      }

      return result;
    } catch (error) {
      return {
        platform,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp,
        shareId
      };
    }
  }, [config.trackingEnabled, copyToClipboard, generateQRCode, generateShareUrl]);

  const share = useCallback(async (
    content: ShareContent, 
    options?: ShareOptions
  ): Promise<ShareResult[]> => {
    if (!config.enabled) {
      throw new Error('Sharing is currently disabled');
    }

    const platforms = options?.platforms || config.defaultPlatforms;
    const results: ShareResult[] = [];

    for (const platform of platforms) {
      const result = await shareToplatform(content, platform, options);
      results.push(result);
    }

    return results;
  }, [config.enabled, config.defaultPlatforms, shareToplatform]);

  const shareUrl = useCallback(async (
    url: string, 
    title: string, 
    options?: ShareOptions
  ) => {
    const content: ShareContent = {
      type: 'url',
      title,
      url: options?.shortUrl ? await shortenUrl(url) : url
    };

    return share(content, options);
  }, [share, shortenUrl]);

  const shareText = useCallback(async (
    text: string, 
    options?: ShareOptions
  ) => {
    const content: ShareContent = {
      type: 'text',
      title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      text
    };

    return share(content, options);
  }, [share]);

  const shareAnalysis = useCallback(async (
    analysisData: any, 
    title: string, 
    options?: ShareOptions
  ) => {
    const content: ShareContent = {
      type: 'analysis',
      title,
      description: 'Análisis generado con YA Tools',
      data: analysisData,
      url: window.location.href
    };

    return share(content, options);
  }, [share]);

  const getShareHistory = useCallback((filters?: Partial<ShareHistory>) => {
    if (!filters) return shareHistory;

    return shareHistory.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        return item[key as keyof ShareHistory] === value;
      });
    });
  }, [shareHistory]);

  const clearShareHistory = useCallback(() => {
    setShareHistory([]);
  }, []);

  const trackShare = useCallback((shareId: string, event: 'click' | 'view' | 'conversion') => {
    setShareHistory(prev => prev.map(item => {
      if (item.id === shareId && item.analytics) {
        return {
          ...item,
          analytics: {
            ...item.analytics,
            [event === 'click' ? 'clicks' : event === 'view' ? 'views' : 'conversions']: 
              item.analytics[event === 'click' ? 'clicks' : event === 'view' ? 'views' : 'conversions'] + 1
          }
        };
      }
      return item;
    }));
  }, []);

  const getShareAnalytics = useCallback((shareId: string) => {
    const item = shareHistory.find(h => h.id === shareId);
    return item?.analytics;
  }, [shareHistory]);

  const openShareModal = useCallback((content?: ShareContent) => {
    if (content) {
      setCurrentShareContent(content);
    }
    setIsShareModalOpen(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setIsShareModalOpen(false);
    setCurrentShareContent(null);
  }, []);

  const getAvailablePlatforms = useCallback((): SharePlatform[] => {
    const allPlatforms: SharePlatform[] = ['twitter', 'facebook', 'linkedin', 'whatsapp', 'telegram', 'email', 'copy', 'qr'];
    
    // Filter based on device capabilities and configuration
    return allPlatforms.filter(platform => isPlatformAvailable(platform));
  }, []);

  const isPlatformAvailable = useCallback((platform: SharePlatform): boolean => {
    switch (platform) {
      case 'copy':
        return !!navigator.clipboard;
      case 'email':
        return true; // Always available
      case 'qr':
        return true; // Always available (we generate SVG)
      default:
        return true; // Social platforms are always available via web URLs
    }
  }, []);

  const value: ShareContextType = {
    config,
    updateConfig,
    share,
    shareToplatform,
    shareUrl,
    shareText,
    shareAnalysis,
    generateShareUrl,
    shortenUrl,
    generateQRCode,
    copyToClipboard,
    shareHistory,
    getShareHistory,
    clearShareHistory,
    trackShare,
    getShareAnalytics,
    isShareModalOpen,
    openShareModal,
    closeShareModal,
    currentShareContent,
    getAvailablePlatforms,
    isPlatformAvailable
  };

  return (
    <ShareContext.Provider value={value}>
      {children}
    </ShareContext.Provider>
  );
}

export function useShare() {
  const context = useContext(ShareContext);
  if (context === undefined) {
    throw new Error('useShare must be used within a ShareProvider');
  }
  return context;
}

export function useShareModal() {
  const { isShareModalOpen, openShareModal, closeShareModal, currentShareContent } = useShare();
  return { isShareModalOpen, openShareModal, closeShareModal, currentShareContent };
}

export function useShareHistory() {
  const { shareHistory, getShareHistory, clearShareHistory, trackShare, getShareAnalytics } = useShare();
  return { shareHistory, getShareHistory, clearShareHistory, trackShare, getShareAnalytics };
}

export function useQuickShare() {
  const { shareUrl, shareText, shareAnalysis, copyToClipboard } = useShare();
  return { shareUrl, shareText, shareAnalysis, copyToClipboard };
}