interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  memoryUsage: number;
}

export class IntelligentCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    entries: 0,
    memoryUsage: 0
  };
  private maxEntries: number;
  private defaultTTL: number;

  constructor(maxEntries = 1000, defaultTTL = 24 * 60 * 60 * 1000) { // 24 hours default
    this.maxEntries = maxEntries;
    this.defaultTTL = defaultTTL;
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.defaultTTL,
      accessCount: 0,
      lastAccessed: now
    };

    // If cache is full, remove least recently used entry
    if (this.cache.size >= this.maxEntries) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.updateStats();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    
    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.stats.hits++;
    
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.updateStats();
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateStats();
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.updateStats();
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Generate cache key for SEO analysis
  generateSEOKey(domain: string, analysisType: string, depth: number): string {
    return `seo:${domain}:${analysisType}:${depth}`;
  }

  // Generate cache key for competitor analysis
  generateCompetitorKey(competitors: string[], analysisType: string): string {
    const sortedCompetitors = competitors.sort().join(',');
    return `competitor:${Buffer.from(sortedCompetitors).toString('base64')}:${analysisType}`;
  }

  // Generate cache key for keyword analysis
  generateKeywordKey(domain: string, keywords: string[]): string {
    const sortedKeywords = keywords.sort().join(',');
    return `keyword:${domain}:${Buffer.from(sortedKeywords).toString('base64')}`;
  }

  // Adaptive TTL based on data type and user plan
  getAdaptiveTTL(dataType: 'seo' | 'competitor' | 'keyword', userPlan: string): number {
    const baseTTL = {
      seo: 6 * 60 * 60 * 1000,      // 6 hours for SEO data
      competitor: 12 * 60 * 60 * 1000, // 12 hours for competitor data
      keyword: 4 * 60 * 60 * 1000    // 4 hours for keyword data
    };

    const planMultiplier = {
      basic: 1,
      premium: 0.5,  // Premium users get fresher data
      enterprise: 0.25 // Enterprise gets the freshest data
    };

    return baseTTL[dataType] * (planMultiplier[userPlan as keyof typeof planMultiplier] || 1);
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      this.updateStats();
    }
  }

  private updateStats(): void {
    this.stats.entries = this.cache.size;
    
    // Estimate memory usage (rough calculation)
    let memoryUsage = 0;
    for (const [key, entry] of this.cache.entries()) {
      memoryUsage += key.length * 2; // String characters are 2 bytes
      memoryUsage += JSON.stringify(entry.data).length * 2;
      memoryUsage += 64; // Overhead for entry metadata
    }
    this.stats.memoryUsage = memoryUsage;
  }
}

// Plan-based limits
export const PLAN_LIMITS = {
  basic: {
    maxCompetitors: 2,
    maxAnalysesPerDay: 1,
    maxKeywords: 50,
    cacheEnabled: true,
    cacheTTL: 24 * 60 * 60 * 1000 // 24 hours
  },
  premium: {
    maxCompetitors: 10,
    maxAnalysesPerDay: 10,
    maxKeywords: 500,
    cacheEnabled: true,
    cacheTTL: 12 * 60 * 60 * 1000 // 12 hours
  },
  enterprise: {
    maxCompetitors: -1, // Unlimited
    maxAnalysesPerDay: -1, // Unlimited
    maxKeywords: -1, // Unlimited
    cacheEnabled: true,
    cacheTTL: 6 * 60 * 60 * 1000 // 6 hours
  }
};

export const validatePlanLimits = (userPlan: string, requestData: any): { valid: boolean; error?: string } => {
  const limits = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS];
  
  if (!limits) {
    return { valid: false, error: 'Invalid user plan' };
  }

  // Check competitor limit
  if (limits.maxCompetitors !== -1 && requestData.competitors?.length > limits.maxCompetitors) {
    return { 
      valid: false, 
      error: `Plan allows maximum ${limits.maxCompetitors} competitors. Upgrade to analyze more.` 
    };
  }

  // Check keyword limit
  if (limits.maxKeywords !== -1 && requestData.keywordLimit > limits.maxKeywords) {
    return { 
      valid: false, 
      error: `Plan allows maximum ${limits.maxKeywords} keywords. Upgrade for more keywords.` 
    };
  }

  return { valid: true };
};

// Singleton instance
let cacheInstance: IntelligentCacheService | null = null;

export const getCacheService = (): IntelligentCacheService => {
  if (!cacheInstance) {
    cacheInstance = new IntelligentCacheService();
  }
  return cacheInstance;
};

export default getCacheService;