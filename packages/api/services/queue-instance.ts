import QueueService from './queue-service';

let queueServiceInstance: QueueService | null = null;

export function getQueueService(): QueueService {
  if (!queueServiceInstance) {
    // Initialize with default configuration
    // In production, these should come from environment variables
    queueServiceInstance = new QueueService({
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
      }
    });
  }
  
  return queueServiceInstance;
}

export function closeQueueService(): Promise<void> {
  if (queueServiceInstance) {
    const promise = queueServiceInstance.close();
    queueServiceInstance = null;
    return promise;
  }
  return Promise.resolve();
}