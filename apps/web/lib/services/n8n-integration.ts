import { v4 as uuidv4 } from 'uuid';

export interface N8nWorkflowTrigger {
  workflowId: string;
  webhookPath: string;
  payload: any;
}

export interface AnalysisJob {
  id: string;
  type: 'competitor' | 'technical' | 'content' | 'backlinks';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  results?: any;
  error?: string;
}

export class N8nIntegrationService {
  private baseUrl: string;
  private apiKey?: string;
  private jobs: Map<string, AnalysisJob> = new Map();
  
  // Circuit breaker state
  private circuitBreakerState: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold = 5;
  private readonly recoveryTimeout = 60000; // 1 minute

  constructor() {
    this.baseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    this.apiKey = process.env.N8N_API_KEY;
  }

  /**
   * Trigger competitor analysis workflow
   */
  async triggerCompetitorAnalysis(
    analysisId: string,
    competitors: string[],
    analysisTypes: string[] = ['seo', 'technical', 'content'],
    userPlan: string = 'basic'
  ): Promise<string> {
    const jobId = `${analysisId}-competitor`;
    
    // Create job tracking
    this.jobs.set(jobId, {
      id: jobId,
      type: 'competitor',
      status: 'pending',
      progress: 0,
      startedAt: new Date()
    });

    const payload = {
      analysisId,
      competitors: competitors.map(url => ({
        url: this.normalizeUrl(url),
        name: this.extractDomainName(url)
      })),
      analysisTypes,
      userPlan
    };

    try {
      const response = await this.triggerWorkflow('competitor-analysis', payload);
      
      // Update job status
      const job = this.jobs.get(jobId);
      if (job) {
        job.status = 'processing';
        this.jobs.set(jobId, job);
      }

      return jobId;
    } catch (error) {
      // Update job with error
      const job = this.jobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
        this.jobs.set(jobId, job);
      }
      throw error;
    }
  }

  /**
   * Trigger technical SEO analysis workflow
   */
  async triggerTechnicalAnalysis(
    analysisId: string,
    url: string,
    depth: 'basic' | 'advanced' | 'complete' = 'basic'
  ): Promise<string> {
    const jobId = `${analysisId}-technical`;
    
    this.jobs.set(jobId, {
      id: jobId,
      type: 'technical',
      status: 'pending',
      progress: 0,
      startedAt: new Date()
    });

    const payload = {
      url: this.normalizeUrl(url),
      analysisId,
      depth
    };

    try {
      const response = await this.triggerWorkflow('seo-technical-analysis', payload);
      
      const job = this.jobs.get(jobId);
      if (job) {
        job.status = 'processing';
        this.jobs.set(jobId, job);
      }

      return jobId;
    } catch (error) {
      const job = this.jobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
        this.jobs.set(jobId, job);
      }
      throw error;
    }
  }

  /**
   * Trigger keyword and content analysis workflow
   */
  async triggerContentAnalysis(
    analysisId: string,
    url: string,
    targetKeywords: string[] = [],
    analysisDepth: 'basic' | 'standard' | 'advanced' = 'standard'
  ): Promise<string> {
    const jobId = `${analysisId}-content`;
    
    this.jobs.set(jobId, {
      id: jobId,
      type: 'content',
      status: 'pending',
      progress: 0,
      startedAt: new Date()
    });

    const payload = {
      url: this.normalizeUrl(url),
      analysisId,
      targetKeywords,
      analysisDepth
    };

    try {
      const response = await this.triggerWorkflow('keyword-content-analysis', payload);
      
      const job = this.jobs.get(jobId);
      if (job) {
        job.status = 'processing';
        this.jobs.set(jobId, job);
      }

      return jobId;
    } catch (error) {
      const job = this.jobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
        this.jobs.set(jobId, job);
      }
      throw error;
    }
  }

  /**
   * Trigger backlink analysis workflow
   */
  async triggerBacklinkAnalysis(
    analysisId: string,
    url: string,
    maxBacklinks: number = 1000
  ): Promise<string> {
    const jobId = `${analysisId}-backlinks`;
    
    this.jobs.set(jobId, {
      id: jobId,
      type: 'backlinks',
      status: 'pending',
      progress: 0,
      startedAt: new Date()
    });

    const payload = {
      url: this.normalizeUrl(url),
      analysisId,
      maxBacklinks
    };

    try {
      const response = await this.triggerWorkflow('backlink-analysis', payload);
      
      const job = this.jobs.get(jobId);
      if (job) {
        job.status = 'processing';
        this.jobs.set(jobId, job);
      }

      return jobId;
    } catch (error) {
      const job = this.jobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
        this.jobs.set(jobId, job);
      }
      throw error;
    }
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): AnalysisJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Update job status from webhook
   */
  updateJobStatus(
    jobId: string,
    status: 'processing' | 'completed' | 'failed',
    progress?: number,
    results?: any,
    error?: string
  ): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = status;
    if (progress !== undefined) job.progress = progress;
    if (results) job.results = results;
    if (error) job.error = error;
    if (status === 'completed' || status === 'failed') {
      job.completedAt = new Date();
    }

    this.jobs.set(jobId, job);
  }

  /**
   * Get all jobs for an analysis
   */
  getAnalysisJobs(analysisId: string): AnalysisJob[] {
    const jobs: AnalysisJob[] = [];
    for (const [jobId, job] of this.jobs.entries()) {
      if (jobId.startsWith(analysisId)) {
        jobs.push(job);
      }
    }
    return jobs;
  }

  /**
   * Check if analysis is complete
   */
  isAnalysisComplete(analysisId: string): boolean {
    const jobs = this.getAnalysisJobs(analysisId);
    if (jobs.length === 0) return false;
    
    return jobs.every(job => job.status === 'completed' || job.status === 'failed');
  }

  /**
   * Get analysis progress
   */
  getAnalysisProgress(analysisId: string): { completed: number; total: number; percentage: number } {
    const jobs = this.getAnalysisJobs(analysisId);
    const completed = jobs.filter(job => job.status === 'completed').length;
    const total = jobs.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  }

  /**
   * Trigger n8n workflow via webhook
   */
  private async triggerWorkflow(workflowPath: string, payload: any): Promise<any> {
    // Check circuit breaker
    if (!this.canMakeRequest()) {
      throw new Error('N8n service is currently unavailable (circuit breaker open)');
    }

    const maxRetries = parseInt(process.env.N8N_RETRY_ATTEMPTS || '3');
    const retryDelay = parseInt(process.env.N8N_RETRY_DELAY_MS || '5000');
    const timeout = parseInt(process.env.N8N_TIMEOUT_MS || '300000');
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const url = `${this.baseUrl}/webhook/${workflowPath}`;
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'SEO-Tools-Platform/1.0',
          'X-Request-ID': uuidv4(),
          'X-Attempt': attempt.toString(),
        };

        if (this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        // Add webhook secret if configured
        const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
        if (webhookSecret) {
          headers['X-Webhook-Secret'] = webhookSecret;
        }

        console.log(`Triggering n8n workflow: ${workflowPath} (attempt ${attempt}/${maxRetries})`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          const error = new Error(`N8n workflow trigger failed: ${response.status} - ${errorText}`);
          
          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            throw error;
          }
          
          lastError = error;
          console.warn(`Attempt ${attempt} failed:`, error.message);
          
          if (attempt < maxRetries) {
            console.log(`Retrying in ${retryDelay}ms...`);
            await this.sleep(retryDelay);
            continue;
          }
          
          throw error;
        }

        const result = await response.json();
        console.log(`N8n workflow triggered successfully: ${workflowPath}`);
        this.recordSuccess();
        return result;

      } catch (error) {
        lastError = error as Error;
        this.recordFailure();
        
        // Don't retry on abort errors or client errors
        if (error instanceof Error && 
            (error.name === 'AbortError' || 
             error.message.includes('400') || 
             error.message.includes('401') || 
             error.message.includes('403'))) {
          throw error;
        }
        
        console.warn(`Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`);
          await this.sleep(retryDelay);
        }
      }
    }
    
    throw new Error(`N8n workflow trigger failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if circuit breaker allows requests
   */
  private canMakeRequest(): boolean {
    const now = Date.now();
    
    switch (this.circuitBreakerState) {
      case 'closed':
        return true;
      case 'open':
        if (now - this.lastFailureTime >= this.recoveryTimeout) {
          this.circuitBreakerState = 'half-open';
          return true;
        }
        return false;
      case 'half-open':
        return true;
      default:
        return true;
    }
  }

  /**
   * Record successful request
   */
  private recordSuccess(): void {
    this.failureCount = 0;
    this.circuitBreakerState = 'closed';
  }

  /**
   * Record failed request
   */
  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.circuitBreakerState = 'open';
      console.warn(`N8n circuit breaker opened after ${this.failureCount} failures`);
    }
  }

  /**
   * Health check for n8n service
   */
  async healthCheck(): Promise<{ healthy: boolean; status: string; latency?: number }> {
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.baseUrl}/healthz`, {
        method: 'GET',
        headers: {
          'User-Agent': 'SEO-Tools-Platform/1.0',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        this.recordSuccess();
        return {
          healthy: true,
          status: 'N8n service is healthy',
          latency
        };
      } else {
        this.recordFailure();
        return {
          healthy: false,
          status: `N8n service returned ${response.status}`
        };
      }
    } catch (error) {
      this.recordFailure();
      return {
        healthy: false,
        status: `N8n service unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get service status including circuit breaker state
   */
  getServiceStatus(): {
    circuitBreakerState: string;
    failureCount: number;
    lastFailureTime: number;
    canMakeRequest: boolean;
  } {
    return {
      circuitBreakerState: this.circuitBreakerState,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      canMakeRequest: this.canMakeRequest()
    };
  }

  /**
   * Normalize URL format
   */
  private normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  /**
   * Extract domain name from URL
   */
  private extractDomainName(url: string): string {
    try {
      const domain = new URL(this.normalizeUrl(url)).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  }

  /**
   * Clean up old jobs (call periodically)
   */
  cleanupOldJobs(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.startedAt < cutoffTime && (job.status === 'completed' || job.status === 'failed')) {
        this.jobs.delete(jobId);
      }
    }
  }
}

// Singleton instance
let n8nService: N8nIntegrationService | null = null;

export function getN8nService(): N8nIntegrationService {
  if (!n8nService) {
    n8nService = new N8nIntegrationService();
  }
  return n8nService;
}