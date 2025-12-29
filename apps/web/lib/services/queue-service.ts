export interface AnalysisJobData {
  analysisId: string;
  userId: string;
  competitors: string[];
  config: {
    analysisType: 'basic' | 'advanced' | 'comprehensive';
    includeKeywords: boolean;
    includeBacklinks: boolean;
    includeContent: boolean;
    includeTechnical: boolean;
    depth: 'shallow' | 'medium' | 'deep';
  };
}

export interface Job {
  id: string;
  data: AnalysisJobData;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

export class QueueService {
  private jobs: Map<string, Job> = new Map();
  
  async addAnalysisJob(jobData: AnalysisJobData): Promise<Job> {
    const job: Job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: jobData,
      status: 'pending',
      createdAt: new Date()
    };
    
    this.jobs.set(job.id, job);
    
    // Simulate async processing
    setTimeout(() => {
      this.processJob(job.id);
    }, 1000);
    
    return job;
  }
  
  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;
    
    job.status = 'processing';
    
    // Simulate processing time based on number of competitors
    const processingTime = job.data.competitors.length * 2000; // 2 seconds per competitor
    
    setTimeout(async () => {
      try {
        // Here would be the actual analysis processing
        // For now, we'll simulate completion
        job.status = 'completed';
        
        // Cache the results when completed
        const { getCacheService } = await import('./cache-service');
        const cacheService = getCacheService();
        
        // Generate cache key
        const cacheKey = cacheService.generateCompetitorKey(
          job.data.competitors, 
          job.data.config.analysisType
        );
        
        // Simulate analysis results
        const analysisResults = {
          analysisId: job.data.analysisId,
          data: {
            competitors: job.data.competitors.map(domain => ({
              domain,
              status: 'completed',
              metrics: {
                domainRating: Math.floor(Math.random() * 100),
                organicKeywords: Math.floor(Math.random() * 10000),
                organicTraffic: Math.floor(Math.random() * 100000)
              }
            }))
          }
        };
        
        // Cache results with adaptive TTL
        const ttl = cacheService.getAdaptiveTTL('competitor', 'basic');
        cacheService.set(cacheKey, analysisResults, ttl);
        
      } catch (error) {
        console.error('Error processing job:', error);
        job.status = 'failed';
      }
    }, processingTime);
  }
  
  async getJobStatus(jobId: string): Promise<Job | null> {
    return this.jobs.get(jobId) || null;
  }
}

let queueServiceInstance: QueueService | null = null;

export const getQueueService = (): QueueService => {
  if (!queueServiceInstance) {
    queueServiceInstance = new QueueService();
  }
  return queueServiceInstance;
};