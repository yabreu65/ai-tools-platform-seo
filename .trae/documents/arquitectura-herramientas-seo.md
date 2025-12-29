# Arquitectura Técnica: Herramientas SEO Funcionales

## 1. Arquitectura General del Sistema

### 1.1 Diagrama de Arquitectura

```mermaid
graph TD
    A[Usuario Frontend] --> B[Next.js App Router]
    B --> C[API Routes]
    C --> D[SEO Services Layer]
    D --> E[External APIs]
    D --> F[Database Layer]
    D --> G[Cache Layer]
    D --> H[Queue System]
    
    subgraph "Frontend Layer"
        B1[Herramientas UI]
        B2[Dashboard]
        B3[Reportes]
        B --> B1
        B --> B2
        B --> B3
    end
    
    subgraph "API Layer"
        C1[/api/seo/title-generator]
        C2[/api/seo/keyword-research]
        C3[/api/seo/site-audit]
        C4[/api/seo/content-optimizer]
        C5[/api/seo/vitals-checker]
        C --> C1
        C --> C2
        C --> C3
        C --> C4
        C --> C5
    end
    
    subgraph "Services Layer"
        D1[Title Generator Service]
        D2[Keyword Research Service]
        D3[Site Audit Service]
        D4[Content Analysis Service]
        D5[Web Vitals Service]
        D6[Report Generator]
        D --> D1
        D --> D2
        D --> D3
        D --> D4
        D --> D5
        D --> D6
    end
    
    subgraph "External Services"
        E1[Google PageSpeed API]
        E2[OpenAI API]
        E3[Keyword APIs]
        E4[Web Scraping Services]
        E --> E1
        E --> E2
        E --> E3
        E --> E4
    end
    
    subgraph "Data Layer"
        F1[(MongoDB - Analyses)]
        F2[(MongoDB - Keywords)]
        F3[(MongoDB - Reports)]
        F --> F1
        F --> F2
        F --> F3
    end
    
    subgraph "Infrastructure"
        G1[Redis Cache]
        H1[Bull Queue]
        G --> G1
        H --> H1
    end
```

## 2. Tecnologías y Stack

### 2.1 Frontend
- **Framework**: Next.js 14 con App Router
- **UI Library**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts para visualización de datos
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand para estado global

### 2.2 Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes
- **Database**: MongoDB con Mongoose
- **Cache**: Redis para caching y sesiones
- **Queue**: Bull Queue para trabajos asíncronos
- **File Processing**: Sharp para imágenes, PDFKit para reportes

### 2.3 Servicios Externos
- **IA**: OpenAI GPT-4 para análisis de contenido
- **Performance**: Google PageSpeed Insights API
- **Keywords**: Ubersuggest API, DataForSEO API
- **Web Scraping**: Puppeteer para análisis de sitios

## 3. Estructura de Directorios

```
apps/web/
├── app/
│   ├── api/seo/
│   │   ├── title-generator/route.ts
│   │   ├── keyword-research/route.ts
│   │   ├── site-audit/route.ts
│   │   ├── content-optimizer/route.ts
│   │   ├── vitals-checker/route.ts
│   │   ├── duplicate-checker/route.ts
│   │   ├── robots-generator/route.ts
│   │   ├── sitemap-generator/route.ts
│   │   └── image-optimizer/route.ts
│   └── [tool-pages]/
├── components/seo/
│   ├── AnalysisProgress.tsx
│   ├── SEOScore.tsx
│   ├── RecommendationCard.tsx
│   ├── KeywordTable.tsx
│   ├── VitalsChart.tsx
│   └── ReportExporter.tsx
├── lib/seo/
│   ├── services/
│   │   ├── TitleGeneratorService.ts
│   │   ├── KeywordResearchService.ts
│   │   ├── SiteAuditService.ts
│   │   ├── ContentOptimizerService.ts
│   │   └── WebVitalsService.ts
│   ├── integrations/
│   │   ├── GooglePageSpeed.ts
│   │   ├── OpenAIService.ts
│   │   ├── UbersuggestAPI.ts
│   │   └── WebScraper.ts
│   ├── utils/
│   │   ├── seoAnalyzer.ts
│   │   ├── contentProcessor.ts
│   │   ├── reportGenerator.ts
│   │   └── cacheManager.ts
│   └── types/
│       ├── seo.ts
│       ├── keywords.ts
│       └── analysis.ts
└── hooks/seo/
    ├── useAnalysis.ts
    ├── useKeywordResearch.ts
    └── useSEOReports.ts
```

## 4. Modelos de Datos

### 4.1 SEO Analysis Schema

```typescript
// MongoDB Schema para análisis SEO
interface SEOAnalysis {
  _id: ObjectId;
  userId: ObjectId;
  type: 'site_audit' | 'keyword_research' | 'content_analysis' | 'title_generation' | 'vitals_check';
  
  // Datos de entrada
  input: {
    url?: string;
    keyword?: string;
    content?: string;
    options: Record<string, any>;
  };
  
  // Estado del análisis
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  
  // Resultados
  results: {
    overall_score?: number;
    categories: Record<string, CategoryResult>;
    recommendations: Recommendation[];
    raw_data: any;
    metadata: {
      analysis_time: number;
      pages_analyzed?: number;
      keywords_found?: number;
      issues_detected?: number;
    };
  };
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  
  // Plan restrictions
  plan_used: 'free' | 'premium' | 'trial';
  credits_consumed: number;
}

interface CategoryResult {
  score: number;
  status: 'good' | 'needs_improvement' | 'poor';
  issues: Issue[];
  opportunities: Opportunity[];
}

interface Recommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  resources?: string[];
  fix_guide?: string;
}
```

### 4.2 Keyword Research Schema

```typescript
interface KeywordResearch {
  _id: ObjectId;
  userId: ObjectId;
  seed_keyword: string;
  country: string;
  language: string;
  
  results: {
    primary_keywords: KeywordData[];
    related_keywords: KeywordData[];
    questions: QuestionKeyword[];
    longtail_keywords: KeywordData[];
    competitor_keywords: CompetitorKeyword[];
  };
  
  metadata: {
    total_keywords: number;
    avg_volume: number;
    avg_difficulty: number;
    search_time: number;
  };
  
  created_at: Date;
  plan_used: string;
  credits_consumed: number;
}

interface KeywordData {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  trend: 'rising' | 'stable' | 'declining';
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
  related_keywords: string[];
  serp_features: string[];
}
```

## 5. Servicios Principales

### 5.1 Title Generator Service

```typescript
export class TitleGeneratorService {
  private openai: OpenAI;
  private cache: CacheManager;
  
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.cache = new CacheManager();
  }
  
  async generateTitles(params: TitleGenerationParams): Promise<TitleResult[]> {
    const cacheKey = `titles:${params.keyword}:${params.tone}:${params.industry}`;
    
    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    // Analyze competitors
    const competitorTitles = await this.analyzeCompetitorTitles(params.keyword);
    
    // Generate titles with AI
    const prompt = this.buildTitlePrompt(params, competitorTitles);
    const aiResponse = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    // Process and score titles
    const titles = this.processTitleResponse(aiResponse.choices[0].message.content);
    const scoredTitles = await this.scoreTitles(titles, params.keyword);
    
    // Cache results
    await this.cache.set(cacheKey, scoredTitles, 7 * 24 * 60 * 60); // 7 days
    
    return scoredTitles;
  }
  
  private async scoreTitles(titles: string[], keyword: string): Promise<TitleResult[]> {
    return titles.map(title => ({
      title,
      score: this.calculateTitleScore(title, keyword),
      length: title.length,
      analysis: {
        keyword_placement: this.analyzeKeywordPlacement(title, keyword),
        readability: this.analyzeReadability(title),
        ctr_potential: this.analyzeCTRPotential(title),
        emotional_impact: this.analyzeEmotionalImpact(title)
      },
      recommendations: this.generateTitleRecommendations(title, keyword)
    }));
  }
  
  private calculateTitleScore(title: string, keyword: string): number {
    let score = 0;
    
    // Length optimization (50-60 characters ideal)
    const length = title.length;
    if (length >= 50 && length <= 60) score += 25;
    else if (length >= 40 && length <= 70) score += 15;
    else score += 5;
    
    // Keyword placement
    const keywordIndex = title.toLowerCase().indexOf(keyword.toLowerCase());
    if (keywordIndex === 0) score += 25; // Keyword at start
    else if (keywordIndex > 0 && keywordIndex < 20) score += 20;
    else if (keywordIndex > 0) score += 10;
    
    // Power words and emotional triggers
    const powerWords = ['best', 'ultimate', 'complete', 'essential', 'proven', 'secret'];
    const hasPowerWords = powerWords.some(word => 
      title.toLowerCase().includes(word.toLowerCase())
    );
    if (hasPowerWords) score += 15;
    
    // Numbers and specificity
    if (/\d+/.test(title)) score += 15;
    
    // Year relevance
    const currentYear = new Date().getFullYear();
    if (title.includes(currentYear.toString())) score += 10;
    
    // Readability (avoid complex words)
    const words = title.split(' ');
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    if (avgWordLength <= 6) score += 10;
    
    return Math.min(score, 100);
  }
}
```

### 5.2 Site Audit Service

```typescript
export class SiteAuditService {
  private scraper: WebScraper;
  private pageSpeed: GooglePageSpeedService;
  private queue: Queue;
  
  async auditSite(url: string, options: AuditOptions): Promise<string> {
    // Create analysis job
    const analysisId = await this.createAnalysis(url, options);
    
    // Add to queue for processing
    await this.queue.add('site-audit', {
      analysisId,
      url,
      options
    }, {
      attempts: 3,
      backoff: 'exponential'
    });
    
    return analysisId;
  }
  
  async processSiteAudit(job: Job): Promise<void> {
    const { analysisId, url, options } = job.data;
    
    try {
      // Update status
      await this.updateAnalysisStatus(analysisId, 'processing', 10);
      
      // 1. Basic site crawling
      job.progress(20);
      const crawlResults = await this.scraper.crawlSite(url, {
        maxPages: options.pages_limit || 100,
        includeImages: options.include_images,
        followExternalLinks: false
      });
      
      // 2. Technical SEO analysis
      job.progress(40);
      const technicalAnalysis = await this.analyzeTechnicalSEO(crawlResults);
      
      // 3. Content analysis
      job.progress(60);
      const contentAnalysis = await this.analyzeContent(crawlResults);
      
      // 4. Performance analysis
      job.progress(80);
      const performanceAnalysis = await this.pageSpeed.analyzeUrl(url, 'mobile');
      
      // 5. Generate recommendations
      job.progress(90);
      const recommendations = await this.generateRecommendations({
        technical: technicalAnalysis,
        content: contentAnalysis,
        performance: performanceAnalysis
      });
      
      // 6. Calculate overall score
      const overallScore = this.calculateOverallScore({
        technical: technicalAnalysis,
        content: contentAnalysis,
        performance: performanceAnalysis
      });
      
      // Save results
      await this.saveAnalysisResults(analysisId, {
        overall_score: overallScore,
        categories: {
          technical: technicalAnalysis,
          content: contentAnalysis,
          performance: performanceAnalysis
        },
        recommendations,
        metadata: {
          pages_analyzed: crawlResults.pages.length,
          analysis_time: Date.now() - job.timestamp,
          issues_detected: recommendations.filter(r => r.priority === 'high' || r.priority === 'critical').length
        }
      });
      
      job.progress(100);
      
    } catch (error) {
      await this.updateAnalysisStatus(analysisId, 'failed');
      throw error;
    }
  }
  
  private async analyzeTechnicalSEO(crawlResults: CrawlResults): Promise<CategoryResult> {
    const issues: Issue[] = [];
    const opportunities: Opportunity[] = [];
    
    // Check for missing meta descriptions
    const pagesWithoutMeta = crawlResults.pages.filter(page => !page.metaDescription);
    if (pagesWithoutMeta.length > 0) {
      issues.push({
        type: 'warning',
        title: 'Páginas sin meta description',
        count: pagesWithoutMeta.length,
        impact: 'medium',
        pages: pagesWithoutMeta.map(p => p.url),
        fix: 'Agregar meta descriptions únicas y descriptivas'
      });
    }
    
    // Check for duplicate titles
    const titleCounts = new Map();
    crawlResults.pages.forEach(page => {
      const count = titleCounts.get(page.title) || 0;
      titleCounts.set(page.title, count + 1);
    });
    
    const duplicateTitles = Array.from(titleCounts.entries())
      .filter(([title, count]) => count > 1);
    
    if (duplicateTitles.length > 0) {
      issues.push({
        type: 'error',
        title: 'Títulos duplicados',
        count: duplicateTitles.length,
        impact: 'high',
        fix: 'Crear títulos únicos para cada página'
      });
    }
    
    // Check for images without alt text
    const imagesWithoutAlt = crawlResults.images.filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'warning',
        title: 'Imágenes sin texto alternativo',
        count: imagesWithoutAlt.length,
        impact: 'medium',
        fix: 'Agregar atributos alt descriptivos a las imágenes'
      });
    }
    
    // Calculate score based on issues
    let score = 100;
    issues.forEach(issue => {
      if (issue.type === 'error') score -= 15;
      else if (issue.type === 'warning') score -= 5;
    });
    
    return {
      score: Math.max(score, 0),
      status: score >= 80 ? 'good' : score >= 60 ? 'needs_improvement' : 'poor',
      issues,
      opportunities
    };
  }
}
```

### 5.3 Keyword Research Service

```typescript
export class KeywordResearchService {
  private ubersuggest: UbersuggestAPI;
  private dataForSEO: DataForSEOAPI;
  private cache: CacheManager;
  
  async researchKeywords(params: KeywordResearchParams): Promise<KeywordResearchResult> {
    const cacheKey = `keywords:${params.seed_keyword}:${params.country}:${params.language}`;
    
    // Check cache
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    // Parallel API calls for better performance
    const [
      primaryKeywords,
      relatedKeywords,
      questionKeywords,
      competitorKeywords
    ] = await Promise.all([
      this.getPrimaryKeywords(params.seed_keyword, params.country),
      this.getRelatedKeywords(params.seed_keyword, params.country),
      this.getQuestionKeywords(params.seed_keyword, params.country),
      this.getCompetitorKeywords(params.seed_keyword, params.country)
    ]);
    
    // Generate long-tail variations
    const longtailKeywords = await this.generateLongtailKeywords(
      params.seed_keyword,
      relatedKeywords
    );
    
    const result = {
      primary_keywords: primaryKeywords,
      related_keywords: relatedKeywords,
      questions: questionKeywords,
      longtail_keywords: longtailKeywords,
      competitor_keywords: competitorKeywords,
      metadata: {
        total_keywords: primaryKeywords.length + relatedKeywords.length + longtailKeywords.length,
        avg_volume: this.calculateAverageVolume([...primaryKeywords, ...relatedKeywords]),
        avg_difficulty: this.calculateAverageDifficulty([...primaryKeywords, ...relatedKeywords]),
        search_time: Date.now()
      }
    };
    
    // Cache for 24 hours
    await this.cache.set(cacheKey, result, 24 * 60 * 60);
    
    return result;
  }
  
  private async getPrimaryKeywords(seed: string, country: string): Promise<KeywordData[]> {
    // Use multiple sources and merge results
    const [ubersuggestData, dataForSEOData] = await Promise.all([
      this.ubersuggest.getKeywordData(seed, country),
      this.dataForSEO.getKeywordData(seed, country)
    ]);
    
    // Merge and deduplicate
    return this.mergeKeywordData([ubersuggestData, dataForSEOData]);
  }
  
  private async analyzeKeywordIntent(keyword: string): Promise<KeywordIntent> {
    // Use AI to analyze search intent
    const prompt = `Analyze the search intent for the keyword "${keyword}". 
    Classify it as: informational, navigational, transactional, or commercial.
    Consider the user's likely goal when searching for this term.`;
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 50
    });
    
    const intent = response.choices[0].message.content?.toLowerCase();
    
    if (intent?.includes('informational')) return 'informational';
    if (intent?.includes('navigational')) return 'navigational';
    if (intent?.includes('transactional')) return 'transactional';
    if (intent?.includes('commercial')) return 'commercial';
    
    return 'informational'; // default
  }
}
```

## 6. Integración con APIs Externas

### 6.1 Google PageSpeed Insights

```typescript
export class GooglePageSpeedService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  
  constructor() {
    this.apiKey = process.env.GOOGLE_PAGESPEED_API_KEY!;
  }
  
  async analyzeUrl(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedResult> {
    const params = new URLSearchParams({
      url,
      key: this.apiKey,
      strategy,
      category: 'performance,accessibility,best-practices,seo'
    });
    
    const response = await fetch(`${this.baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return this.processPageSpeedData(data);
  }
  
  private processPageSpeedData(data: any): PageSpeedResult {
    const lighthouse = data.lighthouseResult;
    
    return {
      score: Math.round(lighthouse.categories.performance.score * 100),
      vitals: {
        lcp: {
          value: lighthouse.audits['largest-contentful-paint'].numericValue,
          rating: this.getVitalRating(lighthouse.audits['largest-contentful-paint'].numericValue, 'lcp')
        },
        fid: {
          value: lighthouse.audits['max-potential-fid'].numericValue,
          rating: this.getVitalRating(lighthouse.audits['max-potential-fid'].numericValue, 'fid')
        },
        cls: {
          value: lighthouse.audits['cumulative-layout-shift'].numericValue,
          rating: this.getVitalRating(lighthouse.audits['cumulative-layout-shift'].numericValue, 'cls')
        }
      },
      opportunities: this.extractOpportunities(lighthouse.audits),
      diagnostics: this.extractDiagnostics(lighthouse.audits),
      categories: {
        performance: lighthouse.categories.performance.score * 100,
        accessibility: lighthouse.categories.accessibility.score * 100,
        bestPractices: lighthouse.categories['best-practices'].score * 100,
        seo: lighthouse.categories.seo.score * 100
      }
    };
  }
  
  private getVitalRating(value: number, metric: 'lcp' | 'fid' | 'cls'): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 }
    };
    
    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }
}
```

### 6.2 OpenAI Integration

```typescript
export class OpenAIService {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async generateSEOTitles(params: {
    keyword: string;
    description: string;
    tone: string;
    industry: string;
    competitors?: string[];
  }): Promise<string[]> {
    const competitorContext = params.competitors?.length 
      ? `\nCompetitor titles for reference: ${params.competitors.join(', ')}`
      : '';
    
    const prompt = `Generate 8 SEO-optimized titles for a ${params.industry} website.
    
    Primary keyword: "${params.keyword}"
    Content description: "${params.description}"
    Tone: ${params.tone}
    ${competitorContext}
    
    Requirements:
    - Include the primary keyword naturally
    - 50-60 characters optimal length
    - Compelling and click-worthy
    - Unique and creative
    - Include power words when appropriate
    - Consider current year (${new Date().getFullYear()})
    
    Return only the titles, one per line, without numbering.`;
    
    const response = await this.client.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    });
    
    return response.choices[0].message.content
      ?.split('\n')
      .filter(title => title.trim().length > 0)
      .map(title => title.trim()) || [];
  }
  
  async analyzeContent(content: string, targetKeyword: string): Promise<ContentAnalysis> {
    const prompt = `Analyze this content for SEO optimization:
    
    Target keyword: "${targetKeyword}"
    Content: "${content.substring(0, 2000)}..."
    
    Provide analysis on:
    1. Keyword density and placement
    2. Content structure (headings, paragraphs)
    3. Readability and flow
    4. Missing elements (meta description, internal links, etc.)
    5. Suggestions for improvement
    
    Return a JSON object with scores (0-100) and specific recommendations.`;
    
    const response = await this.client.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000
    });
    
    try {
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      throw new Error('Failed to parse content analysis response');
    }
  }
  
  async generateMetaDescription(title: string, content: string, keyword: string): Promise<string> {
    const prompt = `Generate an SEO-optimized meta description for:
    
    Title: "${title}"
    Primary keyword: "${keyword}"
    Content preview: "${content.substring(0, 500)}..."
    
    Requirements:
    - 150-160 characters
    - Include the primary keyword naturally
    - Compelling and descriptive
    - Encourage clicks
    - Summarize the page content
    
    Return only the meta description.`;
    
    const response = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 100
    });
    
    return response.choices[0].message.content?.trim() || '';
  }
}
```

## 7. Sistema de Cache y Performance

### 7.1 Cache Manager

```typescript
export class CacheManager {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key: string, value: any, ttl: number): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
  
  // Cache warming for popular keywords
  async warmCache(): Promise<void> {
    const popularKeywords = [
      'seo tools', 'keyword research', 'content optimization',
      'site audit', 'meta tags', 'backlinks'
    ];
    
    for (const keyword of popularKeywords) {
      // Pre-generate and cache common searches
      await this.preGenerateKeywordData(keyword);
    }
  }
}
```

### 7.2 Queue System

```typescript
import Queue from 'bull';

export class SEOQueue {
  private queue: Queue.Queue;
  
  constructor() {
    this.queue = new Queue('SEO Analysis', {
      redis: {
        port: parseInt(process.env.REDIS_PORT || '6379'),
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD
      }
    });
    
    this.setupProcessors();
  }
  
  private setupProcessors(): void {
    // Site audit processor
    this.queue.process('site-audit', 3, async (job) => {
      const siteAuditService = new SiteAuditService();
      return await siteAuditService.processSiteAudit(job);
    });
    
    // Keyword research processor
    this.queue.process('keyword-research', 5, async (job) => {
      const keywordService = new KeywordResearchService();
      return await keywordService.processKeywordResearch(job);
    });
    
    // Content analysis processor
    this.queue.process('content-analysis', 10, async (job) => {
      const contentService = new ContentOptimizerService();
      return await contentService.processContentAnalysis(job);
    });
  }
  
  async addSiteAudit(data: SiteAuditJobData): Promise<string> {
    const job = await this.queue.add('site-audit', data, {
      attempts: 3,
      backoff: 'exponential',
      removeOnComplete: 10,
      removeOnFail: 5
    });
    
    return job.id.toString();
  }
  
  async getJobStatus(jobId: string): Promise<JobStatus> {
    const job = await this.queue.getJob(jobId);
    
    if (!job) {
      return { status: 'not_found' };
    }
    
    return {
      status: await job.getState(),
      progress: job.progress(),
      data: job.returnvalue,
      error: job.failedReason
    };
  }
}
```

## 8. Monitoreo y Métricas

### 8.1 Performance Monitoring

```typescript
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  startTimer(operation: string): () => void {
    const start = Date.now();
    
    return () => {
      const duration = Date.now() - start;
      this.recordMetric(operation, duration);
    };
  }
  
  recordMetric(operation: string, value: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const values = this.metrics.get(operation)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }
  
  getMetrics(operation: string): MetricsSummary {
    const values = this.metrics.get(operation) || [];
    
    if (values.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p95: 0 };
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    
    return {
      count: values.length,
      avg: sum / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)]
    };
  }
  
  async logMetrics(): Promise<void> {
    const allMetrics = {};
    
    for (const [operation, values] of this.metrics.entries()) {
      allMetrics[operation] = this.getMetrics(operation);
    }
    
    console.log('Performance Metrics:', JSON.stringify(allMetrics, null, 2));
    
    // Send to monitoring service (DataDog, New Relic, etc.)
    // await this.sendToMonitoringService(allMetrics);
  }
}
```

## 9. Seguridad y Rate Limiting

### 9.1 Rate Limiting

```typescript
export class RateLimiter {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  async checkLimit(
    userId: string, 
    action: string, 
    limit: number, 
    window: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `rate_limit:${userId}:${action}`;
    const now = Date.now();
    const windowStart = now - window * 1000;
    
    // Remove old entries
    await this.redis.zremrangebyscore(key, 0, windowStart);
    
    // Count current requests
    const current = await this.redis.zcard(key);
    
    if (current >= limit) {
      const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
      const resetTime = oldest.length > 0 ? parseInt(oldest[1]) + window * 1000 : now + window * 1000;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime
      };
    }
    
    // Add current request
    await this.redis.zadd(key, now, `${now}-${Math.random()}`);
    await this.redis.expire(key, window);
    
    return {
      allowed: true,
      remaining: limit - current - 1,
      resetTime: now + window * 1000
    };
  }
}
```

## 10. Testing Strategy

### 10.1 Unit Tests

```typescript
// Example test for TitleGeneratorService
describe('TitleGeneratorService', () => {
  let service: TitleGeneratorService;
  
  beforeEach(() => {
    service = new TitleGeneratorService();
  });
  
  describe('calculateTitleScore', () => {
    it('should give high score for optimal title', () => {
      const title = 'Best SEO Tools for 2024: Complete Guide';
      const keyword = 'seo tools';
      
      const score = service.calculateTitleScore(title, keyword);
      
      expect(score).toBeGreaterThan(80);
    });
    
    it('should penalize titles without keyword', () => {
      const title = 'Complete Guide to Digital Marketing';
      const keyword = 'seo tools';
      
      const score = service.calculateTitleScore(title, keyword);
      
      expect(score).toBeLessThan(50);
    });
  });
});
```

### 10.2 Integration Tests

```typescript
describe('SEO API Integration', () => {
  it('should generate titles via API', async () => {
    const response = await request(app)
      .post('/api/seo/title-generator')
      .send({
        keyword: 'seo tools',
        description: 'Guide about SEO tools',
        tone: 'professional',
        industry: 'marketing'
      })
      .expect(200);
    
    expect(response.body.titles).toHaveLength(8);
    expect(response.body.titles[0]).toHaveProperty('score');
    expect(response.body.titles[0]).toHaveProperty('analysis');
  });
});
```

## 11. Deployment y DevOps

### 11.1 Docker Configuration

```dockerfile
# Dockerfile for SEO services
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### 11.2 Environment Configuration

```bash
# .env.production
NODE_ENV=production

# Database
MONGODB_URI=mongodb://mongo:27017/seo_tools
REDIS_URL=redis://redis:6379

# External APIs
OPENAI_API_KEY=sk-...
GOOGLE_PAGESPEED_API_KEY=AIza...
UBERSUGGEST_API_KEY=...

# Security
JWT_SECRET=...
ENCRYPTION_KEY=...

# Monitoring
SENTRY_DSN=...
DATADOG_API_KEY=...
```

## 12. Conclusión

Esta arquitectura técnica proporciona:

1. **Escalabilidad**: Sistema de colas y cache para manejar carga
2. **Confiabilidad**: Manejo de errores y reintentos automáticos
3. **Performance**: Cache inteligente y optimizaciones
4. **Mantenibilidad**: Código modular y bien estructurado
5. **Monitoreo**: Métricas y logging comprehensivo
6. **Seguridad**: Rate limiting y validación de datos

La implementación seguirá un enfoque iterativo, comenzando con las herramientas de mayor valor y expandiendo gradualmente las funcionalidades avanzadas.