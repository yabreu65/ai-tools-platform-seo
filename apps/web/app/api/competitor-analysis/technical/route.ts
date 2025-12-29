import { NextRequest, NextResponse } from 'next/server';
import { getSEOScraper } from '../../../../lib/services/seo-scraper';
import { getCoreWebVitalsAnalyzer } from '../../../../lib/services/core-web-vitals';
import { getCacheService } from '../../../../lib/services/cache-service';

interface TechnicalAnalysisRequest {
  url: string;
  device?: 'mobile' | 'desktop' | 'both';
  includeWebVitals?: boolean;
  includeAccessibility?: boolean;
  includeSecurity?: boolean;
  includePerformance?: boolean;
}

interface TechnicalAnalysisResponse {
  url: string;
  timestamp: number;
  device: string;
  
  // Core Web Vitals
  webVitals?: {
    lcp: number | null;
    fid: number | null;
    cls: number | null;
    fcp: number | null;
    tti: number | null;
    grades: {
      lcp: 'good' | 'needs-improvement' | 'poor';
      fid: 'good' | 'needs-improvement' | 'poor';
      cls: 'good' | 'needs-improvement' | 'poor';
      overall: 'good' | 'needs-improvement' | 'poor';
    };
  };
  
  // Technical SEO
  technical: {
    ssl: boolean;
    httpStatus: number;
    redirects: number;
    loadTime: number;
    pageSize: number;
    technologies: string[];
    mobileFriendly: boolean;
    hasRobotsTxt: boolean;
    hasSitemap: boolean;
    hasStructuredData: boolean;
    charset: string;
    viewport: string;
  };
  
  // Accessibility
  accessibility?: {
    score: number;
    issues: {
      type: 'error' | 'warning' | 'notice';
      message: string;
      element?: string;
      impact: 'critical' | 'serious' | 'moderate' | 'minor';
    }[];
    altTexts: number;
    ariaLabels: number;
    headingStructure: boolean;
    colorContrast: 'good' | 'poor' | 'unknown';
  };
  
  // Security
  security?: {
    score: number;
    https: boolean;
    hsts: boolean;
    contentSecurityPolicy: boolean;
    xFrameOptions: boolean;
    xContentTypeOptions: boolean;
    referrerPolicy: boolean;
    mixedContent: boolean;
    vulnerabilities: string[];
  };
  
  // Performance
  performance?: {
    score: number;
    resourceOptimization: {
      images: {
        total: number;
        optimized: number;
        unoptimized: number;
        formats: string[];
        lazyLoading: boolean;
      };
      scripts: {
        total: number;
        minified: number;
        compressed: number;
        blocking: number;
      };
      stylesheets: {
        total: number;
        minified: number;
        compressed: number;
        critical: boolean;
      };
    };
    caching: {
      enabled: boolean;
      strategy: string;
      maxAge: number;
    };
    compression: {
      enabled: boolean;
      type: string;
      ratio: number;
    };
  };
  
  // Recommendations
  recommendations: {
    category: 'performance' | 'accessibility' | 'security' | 'seo';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    effort: 'high' | 'medium' | 'low';
  }[];
  
  // Overall Score
  overallScore: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: TechnicalAnalysisRequest = await request.json();
    
    if (!body.url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let fullUrl: string;
    try {
      fullUrl = body.url.startsWith('http') ? body.url : `https://${body.url}`;
      new URL(fullUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const device = body.device || 'desktop';
    const includeWebVitals = body.includeWebVitals !== false;
    const includeAccessibility = body.includeAccessibility !== false;
    const includeSecurity = body.includeSecurity !== false;
    const includePerformance = body.includePerformance !== false;

    // Check cache
    const cacheService = getCacheService();
    const cacheKey = `technical:${fullUrl}:${device}:${includeWebVitals}:${includeAccessibility}:${includeSecurity}:${includePerformance}`;
    const cachedResult = cacheService.get<TechnicalAnalysisResponse>(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    // Initialize services
    const seoScraper = getSEOScraper();
    const webVitalsAnalyzer = getCoreWebVitalsAnalyzer();

    try {
      // Perform SEO analysis
      const seoMetrics = await seoScraper.scrapeURL(fullUrl);
      
      // Perform Web Vitals analysis if requested
      let webVitals = null;
      if (includeWebVitals) {
        try {
          const vitalsResult = await webVitalsAnalyzer.analyzeWebVitals(fullUrl, {
            device: device === 'both' ? 'desktop' : device as 'mobile' | 'desktop',
            throttling: '4g',
            timeout: 30000
          });
          
          webVitals = {
            lcp: vitalsResult.metrics.largestContentfulPaint,
            fid: vitalsResult.metrics.firstInputDelay,
            cls: vitalsResult.metrics.cumulativeLayoutShift,
            fcp: vitalsResult.metrics.firstContentfulPaint,
            tti: vitalsResult.metrics.timeToInteractive,
            grades: vitalsResult.grades
          };
        } catch (error) {
          console.warn('Web Vitals analysis failed:', error);
        }
      }

      // Accessibility analysis
      let accessibility = null;
      if (includeAccessibility) {
        accessibility = {
          score: calculateAccessibilityScore(seoMetrics),
          issues: generateAccessibilityIssues(seoMetrics),
          altTexts: seoMetrics.images.withAlt,
          ariaLabels: 0, // Would need additional analysis
          headingStructure: seoMetrics.headings.h1.length === 1,
          colorContrast: 'unknown' as const
        };
      }

      // Security analysis
      let security = null;
      if (includeSecurity) {
        security = {
          score: calculateSecurityScore(seoMetrics),
          https: seoMetrics.url.startsWith('https://'),
          hsts: false, // Would need header analysis
          contentSecurityPolicy: false,
          xFrameOptions: false,
          xContentTypeOptions: false,
          referrerPolicy: false,
          mixedContent: false,
          vulnerabilities: []
        };
      }

      // Performance analysis
      let performance = null;
      if (includePerformance) {
        performance = {
          score: calculatePerformanceScore(seoMetrics, webVitals),
          resourceOptimization: {
            images: {
              total: seoMetrics.images.total,
              optimized: seoMetrics.images.optimized || 0,
              unoptimized: seoMetrics.images.total - (seoMetrics.images.optimized || 0),
              formats: ['jpg', 'png', 'webp'], // Would need detailed analysis
              lazyLoading: false // Would need detailed analysis
            },
            scripts: {
              total: 0, // Would need resource analysis
              minified: 0,
              compressed: 0,
              blocking: 0
            },
            stylesheets: {
              total: 0, // Would need resource analysis
              minified: 0,
              compressed: 0,
              critical: false
            }
          },
          caching: {
            enabled: false, // Would need header analysis
            strategy: 'unknown',
            maxAge: 0
          },
          compression: {
            enabled: false, // Would need header analysis
            type: 'unknown',
            ratio: 0
          }
        };
      }

      // Generate recommendations
      const recommendations = generateRecommendations(seoMetrics, webVitals, accessibility, security, performance);

      // Calculate overall score
      const overallScore = calculateOverallScore(seoMetrics, webVitals, accessibility, security, performance);

      const result: TechnicalAnalysisResponse = {
        url: fullUrl,
        timestamp: Date.now(),
        device,
        webVitals: webVitals || undefined,
        technical: {
          ssl: seoMetrics.url.startsWith('https://'),
          httpStatus: seoMetrics.technical.statusCode,
          redirects: 0, // Would need additional analysis
          loadTime: seoMetrics.performance.loadTime,
          pageSize: 0, // Would need additional analysis
          technologies: seoMetrics.technical.technologies?.map((tech: any) => tech.name || tech) || [],
          mobileFriendly: !!seoMetrics.technical.viewport,
          hasRobotsTxt: seoMetrics.technical.hasRobotsTxt,
          hasSitemap: seoMetrics.technical.hasSitemap,
          hasStructuredData: seoMetrics.technical.hasStructuredData,
          charset: seoMetrics.technical.charset,
          viewport: seoMetrics.technical.viewport
        },
        accessibility: accessibility || undefined,
        security: security || undefined,
        performance: performance || undefined,
        recommendations,
        overallScore
      };

      // Cache the result
      const ttl = cacheService.getAdaptiveTTL('seo', 'basic');
      cacheService.set(cacheKey, result, ttl);

      return NextResponse.json({
        success: true,
        data: result,
        cached: false
      });

    } finally {
      await seoScraper.close();
      await webVitalsAnalyzer.close();
    }

  } catch (error) {
    console.error('Technical analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateAccessibilityScore(seoMetrics: any): number {
  let score = 100;
  
  // Deduct points for missing alt texts
  if (seoMetrics.images.withoutAlt > 0) {
    score -= Math.min(30, seoMetrics.images.withoutAlt * 5);
  }
  
  // Deduct points for missing H1 or multiple H1s
  if (seoMetrics.headings.h1.length !== 1) {
    score -= 15;
  }
  
  // Deduct points for missing viewport
  if (!seoMetrics.technical.viewport) {
    score -= 20;
  }
  
  return Math.max(0, score);
}

function generateAccessibilityIssues(seoMetrics: any) {
  const issues = [];
  
  if (seoMetrics.images.withoutAlt > 0) {
    issues.push({
      type: 'error' as const,
      message: `${seoMetrics.images.withoutAlt} images missing alt text`,
      impact: 'serious' as const
    });
  }
  
  if (seoMetrics.headings.h1.length === 0) {
    issues.push({
      type: 'error' as const,
      message: 'Page missing H1 heading',
      impact: 'serious' as const
    });
  }
  
  if (seoMetrics.headings.h1.length > 1) {
    issues.push({
      type: 'warning' as const,
      message: 'Multiple H1 headings found',
      impact: 'moderate' as const
    });
  }
  
  return issues;
}

function calculateSecurityScore(seoMetrics: any): number {
  let score = 100;
  
  if (!seoMetrics.url.startsWith('https://')) {
    score -= 50;
  }
  
  return Math.max(0, score);
}

function calculatePerformanceScore(seoMetrics: any, webVitals: any): number {
  let score = 100;
  
  // Deduct based on load time
  if (seoMetrics.performance.loadTime > 3000) {
    score -= 30;
  } else if (seoMetrics.performance.loadTime > 1500) {
    score -= 15;
  }
  
  // Deduct based on Web Vitals if available
  if (webVitals) {
    if (webVitals.grades.lcp === 'poor') score -= 20;
    else if (webVitals.grades.lcp === 'needs-improvement') score -= 10;
    
    if (webVitals.grades.fid === 'poor') score -= 20;
    else if (webVitals.grades.fid === 'needs-improvement') score -= 10;
    
    if (webVitals.grades.cls === 'poor') score -= 20;
    else if (webVitals.grades.cls === 'needs-improvement') score -= 10;
  }
  
  return Math.max(0, score);
}

function generateRecommendations(seoMetrics: any, webVitals: any, accessibility: any, security: any, performance: any) {
  const recommendations = [];
  
  // Performance recommendations
  if (seoMetrics.performance.loadTime > 3000) {
    recommendations.push({
      category: 'performance' as const,
      priority: 'high' as const,
      title: 'Improve Page Load Time',
      description: 'Page takes more than 3 seconds to load. Consider optimizing images, minifying CSS/JS, and using a CDN.',
      impact: 'High impact on user experience and SEO rankings',
      effort: 'medium' as const
    });
  }
  
  // Accessibility recommendations
  if (accessibility && accessibility.issues.length > 0) {
    recommendations.push({
      category: 'accessibility' as const,
      priority: 'high' as const,
      title: 'Fix Accessibility Issues',
      description: `Found ${accessibility.issues.length} accessibility issues that need attention.`,
      impact: 'Improves user experience for disabled users and SEO',
      effort: 'low' as const
    });
  }
  
  // Security recommendations
  if (security && !security.https) {
    recommendations.push({
      category: 'security' as const,
      priority: 'high' as const,
      title: 'Enable HTTPS',
      description: 'Site is not using HTTPS. This is required for security and SEO.',
      impact: 'Critical for security and search rankings',
      effort: 'medium' as const
    });
  }
  
  // SEO recommendations
  if (!seoMetrics.technical.hasStructuredData) {
    recommendations.push({
      category: 'seo' as const,
      priority: 'medium' as const,
      title: 'Add Structured Data',
      description: 'Implement JSON-LD structured data to help search engines understand your content.',
      impact: 'Improves search result appearance and click-through rates',
      effort: 'medium' as const
    });
  }
  
  return recommendations;
}

function calculateOverallScore(seoMetrics: any, webVitals: any, accessibility: any, security: any, performance: any): number {
  const scores = [];
  
  // Technical SEO score (always included)
  let technicalScore = 100;
  if (!seoMetrics.url.startsWith('https://')) technicalScore -= 20;
  if (!seoMetrics.technical.isMobileFriendly) technicalScore -= 15;
  if (!seoMetrics.technical.hasStructuredData) technicalScore -= 10;
  if (seoMetrics.technical.statusCode !== 200) technicalScore -= 25;
  scores.push(Math.max(0, technicalScore));
  
  if (accessibility) scores.push(accessibility.score);
  if (security) scores.push(security.score);
  if (performance) scores.push(performance.score);
  
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}