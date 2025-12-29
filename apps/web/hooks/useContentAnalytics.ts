'use client';

import { useCallback } from 'react';
import { useAnalytics } from '@/src/contexts/AnalyticsContext';

export interface ContentAnalyticsData {
  contentId: string;
  contentType: 'blog' | 'case-study' | 'testimonial' | 'newsletter';
  title: string;
  category?: string;
  author?: string;
  tags?: string[];
}

export const useContentAnalytics = () => {
  const { trackEvent, trackPageView, trackConversion } = useAnalytics();

  // Tracking para contenido de blog
  const trackBlogView = useCallback((post: ContentAnalyticsData) => {
    trackEvent('content', 'blog', 'view', post.title, undefined, {
      contentId: post.contentId,
      category: post.category,
      author: post.author,
      tags: post.tags
    });
    
    trackPageView(`/blog/${post.contentId}`, post.title);
  }, [trackEvent, trackPageView]);

  const trackBlogEngagement = useCallback((
    postId: string, 
    action: 'like' | 'share' | 'comment' | 'read_time',
    value?: number,
    metadata?: Record<string, any>
  ) => {
    trackEvent('content', 'blog', action, postId, value, {
      contentId: postId,
      ...metadata
    });
  }, [trackEvent]);

  // Tracking para casos de uso
  const trackCaseStudyView = useCallback((caseStudy: ContentAnalyticsData) => {
    trackEvent('content', 'case-study', 'view', caseStudy.title, undefined, {
      contentId: caseStudy.contentId,
      category: caseStudy.category,
      tags: caseStudy.tags
    });
    
    trackPageView(`/casos-de-uso/${caseStudy.contentId}`, caseStudy.title);
  }, [trackEvent, trackPageView]);

  const trackCaseStudyDownload = useCallback((caseStudyId: string, format: string) => {
    trackEvent('content', 'case-study', 'download', caseStudyId, undefined, {
      contentId: caseStudyId,
      format
    });
    
    trackConversion('export', undefined, {
      contentType: 'case-study',
      contentId: caseStudyId,
      format
    });
  }, [trackEvent, trackConversion]);

  // Tracking para testimonios
  const trackTestimonialView = useCallback((testimonial: ContentAnalyticsData) => {
    trackEvent('content', 'testimonial', 'view', testimonial.title, undefined, {
      contentId: testimonial.contentId,
      category: testimonial.category
    });
  }, [trackEvent]);

  const trackTestimonialInteraction = useCallback((
    testimonialId: string,
    action: 'helpful' | 'share' | 'report',
    metadata?: Record<string, any>
  ) => {
    trackEvent('content', 'testimonial', action, testimonialId, undefined, {
      contentId: testimonialId,
      ...metadata
    });
  }, [trackEvent]);

  const trackTestimonialSubmission = useCallback((testimonialData: any) => {
    trackEvent('content', 'testimonial', 'submit', 'new_testimonial', undefined, testimonialData);
    trackConversion('share', undefined, {
      contentType: 'testimonial',
      ...testimonialData
    });
  }, [trackEvent, trackConversion]);

  // Tracking para newsletter
  const trackNewsletterSubscription = useCallback((
    email: string,
    preferences: Record<string, boolean>,
    source?: string
  ) => {
    trackEvent('content', 'newsletter', 'subscribe', email, undefined, {
      preferences,
      source
    });
    
    trackConversion('signup', undefined, {
      contentType: 'newsletter',
      email,
      preferences,
      source
    });
  }, [trackEvent, trackConversion]);

  const trackNewsletterUnsubscribe = useCallback((email: string, reason?: string) => {
    trackEvent('content', 'newsletter', 'unsubscribe', email, undefined, {
      reason
    });
  }, [trackEvent]);

  const trackNewsletterOpen = useCallback((campaignId: string, subscriberId: string) => {
    trackEvent('content', 'newsletter', 'open', campaignId, undefined, {
      campaignId,
      subscriberId
    });
  }, [trackEvent]);

  const trackNewsletterClick = useCallback((
    campaignId: string,
    subscriberId: string,
    linkUrl: string
  ) => {
    trackEvent('content', 'newsletter', 'click', campaignId, undefined, {
      campaignId,
      subscriberId,
      linkUrl
    });
  }, [trackEvent]);

  // Tracking para búsquedas y filtros
  const trackContentSearch = useCallback((
    query: string,
    contentType: string,
    resultsCount: number,
    filters?: Record<string, any>
  ) => {
    trackEvent('content', 'search', contentType, query, resultsCount, {
      query,
      contentType,
      resultsCount,
      filters
    });
  }, [trackEvent]);

  const trackContentFilter = useCallback((
    contentType: string,
    filterType: string,
    filterValue: string,
    resultsCount: number
  ) => {
    trackEvent('content', 'filter', contentType, `${filterType}:${filterValue}`, resultsCount, {
      contentType,
      filterType,
      filterValue,
      resultsCount
    });
  }, [trackEvent]);

  // Tracking para navegación de contenido
  const trackContentNavigation = useCallback((
    from: string,
    to: string,
    navigationMethod: 'link' | 'search' | 'filter' | 'related' | 'category'
  ) => {
    trackEvent('content', 'navigation', navigationMethod, `${from} -> ${to}`, undefined, {
      from,
      to,
      navigationMethod
    });
  }, [trackEvent]);

  // Tracking para tiempo de lectura
  const trackReadingTime = useCallback((
    contentId: string,
    contentType: string,
    timeSpent: number,
    scrollPercentage: number
  ) => {
    trackEvent('content', 'engagement', 'reading_time', contentId, timeSpent, {
      contentId,
      contentType,
      timeSpent,
      scrollPercentage
    });
  }, [trackEvent]);

  // Tracking para compartir contenido
  const trackContentShare = useCallback((
    contentId: string,
    contentType: string,
    platform: 'twitter' | 'linkedin' | 'facebook' | 'email' | 'copy_link',
    title: string
  ) => {
    trackEvent('content', 'share', platform, contentId, undefined, {
      contentId,
      contentType,
      platform,
      title
    });
    
    trackConversion('share', undefined, {
      contentType,
      contentId,
      platform,
      title
    });
  }, [trackEvent, trackConversion]);

  // Tracking para errores de contenido
  const trackContentError = useCallback((
    contentId: string,
    contentType: string,
    errorType: string,
    errorMessage: string
  ) => {
    trackEvent('content', 'error', errorType, contentId, undefined, {
      contentId,
      contentType,
      errorType,
      errorMessage
    });
  }, [trackEvent]);

  return {
    // Blog tracking
    trackBlogView,
    trackBlogEngagement,
    
    // Case study tracking
    trackCaseStudyView,
    trackCaseStudyDownload,
    
    // Testimonial tracking
    trackTestimonialView,
    trackTestimonialInteraction,
    trackTestimonialSubmission,
    
    // Newsletter tracking
    trackNewsletterSubscription,
    trackNewsletterUnsubscribe,
    trackNewsletterOpen,
    trackNewsletterClick,
    
    // General content tracking
    trackContentSearch,
    trackContentFilter,
    trackContentNavigation,
    trackReadingTime,
    trackContentShare,
    trackContentError
  };
};