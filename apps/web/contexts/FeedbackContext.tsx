'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';

export type FeedbackType = 'bug' | 'feature' | 'improvement' | 'general' | 'rating';
export type FeedbackStatus = 'pending' | 'submitted' | 'acknowledged' | 'resolved' | 'closed';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  rating?: number; // 1-5 stars
  email?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  screenshot?: string;
  attachments?: File[];
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  response?: string;
  responseAt?: number;
}

export interface FeedbackConfig {
  enabled: boolean;
  allowAnonymous: boolean;
  requireEmail: boolean;
  allowAttachments: boolean;
  maxAttachmentSize: number; // in MB
  allowedFileTypes: string[];
  autoScreenshot: boolean;
  collectSystemInfo: boolean;
}

export interface FeedbackStats {
  total: number;
  byType: Record<FeedbackType, number>;
  byStatus: Record<FeedbackStatus, number>;
  averageRating: number;
  responseTime: number; // average in hours
}

interface FeedbackContextType {
  // Configuration
  config: FeedbackConfig;
  updateConfig: (newConfig: Partial<FeedbackConfig>) => void;
  
  // Feedback management
  feedbackItems: FeedbackItem[];
  submitFeedback: (feedback: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<string>;
  updateFeedback: (id: string, updates: Partial<FeedbackItem>) => void;
  deleteFeedback: (id: string) => void;
  getFeedback: (id: string) => FeedbackItem | undefined;
  
  // Filtering and search
  filterFeedback: (filters: Partial<Pick<FeedbackItem, 'type' | 'status' | 'priority'>>) => FeedbackItem[];
  searchFeedback: (query: string) => FeedbackItem[];
  
  // Quick actions
  submitBugReport: (title: string, description: string, options?: Partial<FeedbackItem>) => Promise<string>;
  submitFeatureRequest: (title: string, description: string, options?: Partial<FeedbackItem>) => Promise<string>;
  submitRating: (rating: number, comment?: string, options?: Partial<FeedbackItem>) => Promise<string>;
  
  // UI state
  isModalOpen: boolean;
  openModal: (type?: FeedbackType) => void;
  closeModal: () => void;
  
  // Statistics
  getStats: () => FeedbackStats;
  
  // Export/Import
  exportFeedback: () => Promise<Blob>;
  
  // System info collection
  collectSystemInfo: () => Record<string, any>;
  takeScreenshot: () => Promise<string | null>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<FeedbackConfig>({
    enabled: true,
    allowAnonymous: true,
    requireEmail: false,
    allowAttachments: true,
    maxAttachmentSize: 10, // 10MB
    allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.log'],
    autoScreenshot: false,
    collectSystemInfo: true
  });

  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<FeedbackType>('general');

  // Load feedback from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('feedback_items');
    if (stored) {
      try {
        setFeedbackItems(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load feedback from localStorage:', error);
      }
    }
  }, []);

  // Save feedback to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('feedback_items', JSON.stringify(feedbackItems));
  }, [feedbackItems]);

  const updateConfig = useCallback((newConfig: Partial<FeedbackConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const generateId = () => {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const collectSystemInfo = useCallback(() => {
    if (!config.collectSystemInfo) return {};

    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  }, [config.collectSystemInfo]);

  const takeScreenshot = useCallback(async (): Promise<string | null> => {
    if (!config.autoScreenshot) return null;

    try {
      // This would require additional setup with html2canvas or similar library
      // For now, return null as placeholder
      console.log('Screenshot functionality would be implemented here');
      return null;
    } catch (error) {
      console.error('Failed to take screenshot:', error);
      return null;
    }
  }, [config.autoScreenshot]);

  const submitFeedback = useCallback(async (
    feedback: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<string> => {
    if (!config.enabled) {
      throw new Error('Feedback is currently disabled');
    }

    const systemInfo = collectSystemInfo();
    const screenshot = await takeScreenshot();

    const newFeedback: FeedbackItem = {
      ...feedback,
      id: generateId(),
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userAgent: systemInfo.userAgent,
      url: systemInfo.url,
      screenshot: screenshot || undefined
    };

    setFeedbackItems(prev => [...prev, newFeedback]);

    // In a real implementation, this would send to a backend service
    console.log('Feedback submitted:', newFeedback);

    return newFeedback.id;
  }, [config.enabled, collectSystemInfo, takeScreenshot]);

  const updateFeedback = useCallback((id: string, updates: Partial<FeedbackItem>) => {
    setFeedbackItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, updatedAt: Date.now() }
        : item
    ));
  }, []);

  const deleteFeedback = useCallback((id: string) => {
    setFeedbackItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const getFeedback = useCallback((id: string) => {
    return feedbackItems.find(item => item.id === id);
  }, [feedbackItems]);

  const filterFeedback = useCallback((
    filters: Partial<Pick<FeedbackItem, 'type' | 'status' | 'priority'>>
  ) => {
    return feedbackItems.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        return item[key as keyof FeedbackItem] === value;
      });
    });
  }, [feedbackItems]);

  const searchFeedback = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return feedbackItems.filter(item => 
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery) ||
      item.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [feedbackItems]);

  const submitBugReport = useCallback(async (
    title: string, 
    description: string, 
    options?: Partial<FeedbackItem>
  ) => {
    return submitFeedback({
      type: 'bug',
      title,
      description,
      priority: 'medium',
      ...options
    });
  }, [submitFeedback]);

  const submitFeatureRequest = useCallback(async (
    title: string, 
    description: string, 
    options?: Partial<FeedbackItem>
  ) => {
    return submitFeedback({
      type: 'feature',
      title,
      description,
      priority: 'low',
      ...options
    });
  }, [submitFeedback]);

  const submitRating = useCallback(async (
    rating: number, 
    comment?: string, 
    options?: Partial<FeedbackItem>
  ) => {
    return submitFeedback({
      type: 'rating',
      title: `Rating: ${rating}/5`,
      description: comment || '',
      rating,
      priority: 'low',
      ...options
    });
  }, [submitFeedback]);

  const openModal = useCallback((type: FeedbackType = 'general') => {
    setModalType(type);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const getStats = useCallback((): FeedbackStats => {
    const total = feedbackItems.length;
    
    const byType = feedbackItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<FeedbackType, number>);

    const byStatus = feedbackItems.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<FeedbackStatus, number>);

    const ratings = feedbackItems
      .filter(item => item.rating)
      .map(item => item.rating!);
    
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    const resolvedItems = feedbackItems.filter(item => 
      item.status === 'resolved' && item.responseAt
    );
    
    const responseTime = resolvedItems.length > 0
      ? resolvedItems.reduce((sum, item) => 
          sum + (item.responseAt! - item.createdAt), 0
        ) / resolvedItems.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      total,
      byType,
      byStatus,
      averageRating,
      responseTime
    };
  }, [feedbackItems]);

  const exportFeedback = useCallback(async () => {
    const data = {
      config,
      feedbackItems,
      stats: getStats(),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    return blob;
  }, [config, feedbackItems, getStats]);

  const value: FeedbackContextType = {
    config,
    updateConfig,
    feedbackItems,
    submitFeedback,
    updateFeedback,
    deleteFeedback,
    getFeedback,
    filterFeedback,
    searchFeedback,
    submitBugReport,
    submitFeatureRequest,
    submitRating,
    isModalOpen,
    openModal,
    closeModal,
    getStats,
    exportFeedback,
    collectSystemInfo,
    takeScreenshot
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}

export function useFeedbackModal() {
  const { isModalOpen, openModal, closeModal } = useFeedback();
  return { isModalOpen, openModal, closeModal };
}

export function useFeedbackSubmission() {
  const { submitFeedback, submitBugReport, submitFeatureRequest, submitRating } = useFeedback();
  return { submitFeedback, submitBugReport, submitFeatureRequest, submitRating };
}

export function useFeedbackStats() {
  const { getStats, feedbackItems } = useFeedback();
  return { getStats, feedbackItems };
}