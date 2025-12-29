import Bull, { Queue, Job, JobOptions } from 'bull';
import Redis from 'ioredis';
import ScrapingService from './scraping-service';
import AIAnalysisService from './ai-analysis-service';
import CompetitorAnalysisModel from '../db/models/CompetitorAnalysis';

export interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  concurrency: {
    scraping: number;
    analysis: number;
  };
  retries: {
    scraping: number;
    analysis: number;
  };
}

export interface AnalysisJobData {
  analysisId: string;
  userId: string;
  competitors: string[];
  config: {
    analysisType: 'basic' | 'detailed' | 'comprehensive';
    includeKeywords: boolean;
    includeBacklinks: boolean;
    includeContent: boolean;
    includeTechnical: boolean;
    depth: 'shallow' | 'medium' | 'deep';
  };
}

export interface ScrapingJobData {
  analysisId: string;
  domain: string;
  config: any;
}

export interface AIAnalysisJobData {
  analysisId: string;
  competitorData: any;
  analysisType: string;
}

export class QueueService {
  private scrapingQueue: Queue<ScrapingJobData>;
  private analysisQueue: Queue<AnalysisJobData>;
  private aiAnalysisQueue: Queue<AIAnalysisJobData>;
  private redis: Redis;
  private config: QueueConfig;
  private scrapingService: ScrapingService;
  private aiAnalysisService: AIAnalysisService;

  constructor(config?: Partial<QueueConfig>) {
    this.config = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      },
      concurrency: {
        scraping: 3,
        analysis: 2
      },
      retries: {
        scraping: 3,
        analysis: 2
      },
      ...config
    };

    // Initialize Redis connection
    this.redis = new Redis({
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password,
      maxRetriesPerRequest: 3
    });

    // Initialize queues
    this.scrapingQueue = new Bull<ScrapingJobData>('scraping', {
      redis: this.config.redis,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: this.config.retries.scraping,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    });

    this.analysisQueue = new Bull<AnalysisJobData>('analysis', {
      redis: this.config.redis,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: this.config.retries.analysis,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    });

    this.aiAnalysisQueue = new Bull<AIAnalysisJobData>('ai-analysis', {
      redis: this.config.redis,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 3000
        }
      }
    });

    // Initialize services
    this.scrapingService = new ScrapingService();
    this.aiAnalysisService = new AIAnalysisService();

    this.setupProcessors();
    this.setupEventHandlers();
  }

  private setupProcessors(): void {
    // Scraping processor
    this.scrapingQueue.process(this.config.concurrency.scraping, async (job: Job<ScrapingJobData>) => {
      const { analysisId, domain, config } = job.data;
      
      try {
        await this.updateAnalysisStatus(analysisId, 'processing', `Scraping ${domain}...`);
        
        const result = await this.scrapingService.scrapeCompetitorData(domain);
        
        if (!result.success) {
          throw new Error(result.error || 'Scraping failed');
        }

        // Store scraped data
        await this.storeScrapedData(analysisId, domain, result.data);
        
        return result;
      } catch (error) {
        await this.updateAnalysisStatus(analysisId, 'error', `Scraping failed: ${error}`);
        throw error;
      }
    });

    // Main analysis processor
    this.analysisQueue.process(this.config.concurrency.analysis, async (job: Job<AnalysisJobData>) => {
      const { analysisId, userId, competitors, config } = job.data;
      
      try {
        await this.updateAnalysisStatus(analysisId, 'processing', 'Starting competitor analysis...');
        
        // Create scraping jobs for each competitor
        const scrapingJobs = competitors.map(domain => ({
          analysisId,
          domain,
          config
        }));

        // Add scraping jobs to queue
        const scrapingJobPromises = scrapingJobs.map(jobData => 
          this.scrapingQueue.add('scrape-competitor', jobData, {
            priority: 10,
            delay: Math.random() * 2000 // Random delay to avoid overwhelming servers
          })
        );

        await Promise.all(scrapingJobPromises);
        
        // Wait for all scraping jobs to complete
        await this.waitForScrapingCompletion(analysisId, competitors.length);
        
        // Trigger AI analysis
        await this.aiAnalysisQueue.add('analyze-competitors', {
          analysisId,
          competitorData: await this.getScrapedData(analysisId),
          analysisType: config.analysisType
        });

        return { success: true, message: 'Analysis pipeline started' };
      } catch (error) {
        await this.updateAnalysisStatus(analysisId, 'error', `Analysis failed: ${error}`);
        throw error;
      }
    });

    // AI Analysis processor
    this.aiAnalysisQueue.process(1, async (job: Job<AIAnalysisJobData>) => {
      const { analysisId, competitorData, analysisType } = job.data;
      
      try {
        await this.updateAnalysisStatus(analysisId, 'processing', 'Analyzing with AI...');
        
        const insights = await this.aiAnalysisService.analyzeCompetitor(competitorData);
        
        // Store AI insights
        await this.storeAIInsights(analysisId, insights);
        
        await this.updateAnalysisStatus(analysisId, 'completed', 'Analysis completed successfully');
        
        return insights;
      } catch (error) {
        await this.updateAnalysisStatus(analysisId, 'error', `AI analysis failed: ${error}`);
        throw error;
      }
    });
  }

  private setupEventHandlers(): void {
    // Scraping queue events
    this.scrapingQueue.on('completed', (job, result) => {
      console.log(`Scraping job ${job.id} completed for domain: ${job.data.domain}`);
    });

    this.scrapingQueue.on('failed', (job, err) => {
      console.error(`Scraping job ${job.id} failed:`, err);
    });

    // Analysis queue events
    this.analysisQueue.on('completed', (job, result) => {
      console.log(`Analysis job ${job.id} completed`);
    });

    this.analysisQueue.on('failed', (job, err) => {
      console.error(`Analysis job ${job.id} failed:`, err);
    });

    // AI Analysis queue events
    this.aiAnalysisQueue.on('completed', (job, result) => {
      console.log(`AI Analysis job ${job.id} completed`);
    });

    this.aiAnalysisQueue.on('failed', (job, err) => {
      console.error(`AI Analysis job ${job.id} failed:`, err);
    });
  }

  async addAnalysisJob(jobData: AnalysisJobData, options?: JobOptions): Promise<Job<AnalysisJobData>> {
    return this.analysisQueue.add('analyze-competitors', jobData, {
      priority: 5,
      ...options
    });
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.analysisQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      data: job.data,
      progress: job.progress(),
      state: await job.getState(),
      createdAt: job.timestamp,
      processedAt: job.processedOn,
      finishedAt: job.finishedOn,
      failedReason: job.failedReason
    };
  }

  async getQueueStats(): Promise<any> {
    const [
      scrapingWaiting,
      scrapingActive,
      scrapingCompleted,
      scrapingFailed,
      analysisWaiting,
      analysisActive,
      analysisCompleted,
      analysisFailed,
      aiWaiting,
      aiActive,
      aiCompleted,
      aiFailed
    ] = await Promise.all([
      this.scrapingQueue.getWaiting(),
      this.scrapingQueue.getActive(),
      this.scrapingQueue.getCompleted(),
      this.scrapingQueue.getFailed(),
      this.analysisQueue.getWaiting(),
      this.analysisQueue.getActive(),
      this.analysisQueue.getCompleted(),
      this.analysisQueue.getFailed(),
      this.aiAnalysisQueue.getWaiting(),
      this.aiAnalysisQueue.getActive(),
      this.aiAnalysisQueue.getCompleted(),
      this.aiAnalysisQueue.getFailed()
    ]);

    return {
      scraping: {
        waiting: scrapingWaiting.length,
        active: scrapingActive.length,
        completed: scrapingCompleted.length,
        failed: scrapingFailed.length
      },
      analysis: {
        waiting: analysisWaiting.length,
        active: analysisActive.length,
        completed: analysisCompleted.length,
        failed: analysisFailed.length
      },
      aiAnalysis: {
        waiting: aiWaiting.length,
        active: aiActive.length,
        completed: aiCompleted.length,
        failed: aiFailed.length
      }
    };
  }

  private async updateAnalysisStatus(
    analysisId: string, 
    status: 'pending' | 'processing' | 'completed' | 'error',
    message?: string
  ): Promise<void> {
    try {
      await CompetitorAnalysisModel.findOneAndUpdate(
        { analysisId },
        { 
          status,
          ...(message && { 'progress.message': message }),
          updatedAt: new Date()
        }
      );
    } catch (error) {
      console.error('Failed to update analysis status:', error);
    }
  }

  private async storeScrapedData(analysisId: string, domain: string, data: any): Promise<void> {
    try {
      await CompetitorAnalysisModel.findOneAndUpdate(
        { analysisId },
        {
          $push: {
            'results.competitors': {
              domain,
              ...data,
              scrapedAt: new Date()
            }
          }
        }
      );
    } catch (error) {
      console.error('Failed to store scraped data:', error);
    }
  }

  private async storeAIInsights(analysisId: string, insights: any): Promise<void> {
    try {
      await CompetitorAnalysisModel.findOneAndUpdate(
        { analysisId },
        {
          'results.insights': insights,
          'results.generatedAt': new Date()
        }
      );
    } catch (error) {
      console.error('Failed to store AI insights:', error);
    }
  }

  private async waitForScrapingCompletion(analysisId: string, expectedCount: number): Promise<void> {
    const maxWaitTime = 300000; // 5 minutes
    const checkInterval = 5000; // 5 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const analysis = await CompetitorAnalysisModel.findOne({ analysisId });
      
      if (analysis && analysis.results && analysis.results.competitors && analysis.results.competitors.length >= expectedCount) {
        return;
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    throw new Error('Scraping jobs did not complete within expected time');
  }

  private async getScrapedData(analysisId: string): Promise<any> {
    const analysis = await CompetitorAnalysisModel.findOne({ analysisId });
    return (analysis && analysis.results && analysis.results.competitors) ? analysis.results.competitors : [];
  }

  async close(): Promise<void> {
    await Promise.all([
      this.scrapingQueue.close(),
      this.analysisQueue.close(),
      this.aiAnalysisQueue.close(),
      this.scrapingService.close(),
      this.redis.disconnect()
    ]);
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; queues: any; redis: boolean }> {
    try {
      const stats = await this.getQueueStats();
      const redisStatus = this.redis.status === 'ready';

      return {
        status: 'healthy',
        queues: stats,
        redis: redisStatus
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        queues: null,
        redis: false
      };
    }
  }
}

export default QueueService;