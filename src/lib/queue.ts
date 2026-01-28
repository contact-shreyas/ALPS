// Queue system disabled for serverless deployment
// Bull and Redis are not compatible with Vercel's serverless environment

export const redis = null;
export const exportQueue = null;
export const bullBoardMiddleware = null;

// Placeholder for potential future queue implementation using Vercel-compatible solutions
// Consider using: Vercel's Queue, Upstash QStash, or other serverless queue services
