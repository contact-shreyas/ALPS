import Bull from 'bull';
import { Redis } from 'ioredis';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

// Redis configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis client
export const redis = new Redis(redisUrl);

// Create export queue
export const exportQueue = new Bull('export', {
  redis: redisUrl,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
});

// Create Bull Board
const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullAdapter(exportQueue)],
  serverAdapter,
});

// Configure queue error handling
exportQueue.on('error', (error) => {
  console.error('Export queue error:', error);
});

exportQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed:`, error);
});

// Export Bull Board middleware
export const bullBoardMiddleware = serverAdapter.getRouter();