/**
 * API Middleware for rate limiting, logging, and authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private storage = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.storage.get(identifier);

    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.storage.set(identifier, newEntry);
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    this.storage.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  cleanup(): void {
    const now = Date.now();
    this.storage.forEach((entry, key) => {
      if (now > entry.resetTime) {
        this.storage.delete(key);
      }
    });
  }
}

const rateLimiter = new RateLimiter();

// Cleanup expired entries every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

export function withRateLimit(handler: Function, options?: { windowMs?: number; maxRequests?: number }) {
  const limiter = options ? new RateLimiter(options.windowMs, options.maxRequests) : rateLimiter;

  return async (req: NextRequest) => {
    const identifier = getClientIdentifier(req);
    const { allowed, remaining, resetTime } = limiter.check(identifier);

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          resetTime: new Date(resetTime).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limiter['maxRequests'].toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const response = await handler(req);

    // Add rate limit headers to successful responses
    if (response instanceof NextResponse) {
      response.headers.set('X-RateLimit-Limit', limiter['maxRequests'].toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
    }

    return response;
  };
}

export function withRequestLogging(handler: Function) {
  return async (req: NextRequest) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    
    console.log(`[${requestId}] ${req.method} ${req.url} - Started`);

    try {
      const response = await handler(req);
      const duration = Date.now() - startTime;
      const status = response instanceof NextResponse ? response.status : 200;
      
      console.log(`[${requestId}] ${req.method} ${req.url} - ${status} (${duration}ms)`);
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[${requestId}] ${req.method} ${req.url} - ERROR (${duration}ms):`, error);
      throw error;
    }
  };
}

export function withCORS(handler: Function, options?: { 
  origin?: string | string[]; 
  methods?: string[]; 
  headers?: string[] 
}) {
  const defaultOptions = {
    origin: ['http://localhost:3000', 'https://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization'],
  };

  const config = { ...defaultOptions, ...options };

  return async (req: NextRequest) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': Array.isArray(config.origin) ? config.origin.join(', ') : config.origin,
          'Access-Control-Allow-Methods': config.methods.join(', '),
          'Access-Control-Allow-Headers': config.headers.join(', '),
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = await handler(req);

    if (response instanceof NextResponse) {
      response.headers.set('Access-Control-Allow-Origin', Array.isArray(config.origin) ? config.origin[0] : config.origin);
      response.headers.set('Access-Control-Allow-Methods', config.methods.join(', '));
      response.headers.set('Access-Control-Allow-Headers', config.headers.join(', '));
    }

    return response;
  };
}

export function withErrorHandling(handler: Function) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof Error) {
        return NextResponse.json(
          {
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
        },
        { status: 500 }
      );
    }
  };
}

export function withAuth(handler: Function, options?: { optional?: boolean }) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get('authorization');
    const apiKey = process.env.API_KEY;

    if (!authHeader && !options?.optional) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing authorization header' },
        { status: 401 }
      );
    }

    if (authHeader && apiKey) {
      const token = authHeader.replace('Bearer ', '');
      if (token !== apiKey) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid API key' },
          { status: 401 }
        );
      }
    }

    return handler(req);
  };
}

// Utility function to compose multiple middlewares
export function compose(...middlewares: Function[]) {
  return (handler: Function) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}

// Helper functions
function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip || 'unknown';
  return ip;
}

function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Example usage patterns
export const apiMiddleware = compose(
  withErrorHandling,
  withRequestLogging,
  withCORS,
  withRateLimit
);

export const protectedApiMiddleware = compose(
  withErrorHandling,
  withRequestLogging,
  withAuth,
  withCORS,
  withRateLimit
);