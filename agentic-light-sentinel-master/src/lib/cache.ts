/**
 * Simple caching system for improved performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(defaultTTL = 300000) { // 5 minutes default
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || 300000,
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    });
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cache decorator for functions
export function cached(ttl?: number, keyGenerator?: (...args: any[]) => string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyGenerator 
        ? keyGenerator(...args)
        : `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;

      // Try to get from cache first
      const cached = cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Store in cache
      cache.set(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

// Specific cache functions for common operations
export class DataCache {
  private static DISTRICT_TTL = 60 * 60 * 1000; // 1 hour
  private static HOTSPOT_TTL = 5 * 60 * 1000; // 5 minutes
  private static METRICS_TTL = 15 * 60 * 1000; // 15 minutes

  static getDistrictKey(id?: string): string {
    return id ? `district:${id}` : 'districts:all';
  }

  static getHotspotKey(filters?: any): string {
    return `hotspots:${JSON.stringify(filters || {})}`;
  }

  static getMetricsKey(districtId?: string, timeRange?: string): string {
    return `metrics:${districtId || 'all'}:${timeRange || 'default'}`;
  }

  static setDistrict(key: string, data: any): void {
    cache.set(key, data, this.DISTRICT_TTL);
  }

  static getDistrict(key: string): any | null {
    return cache.get(key);
  }

  static setHotspots(key: string, data: any): void {
    cache.set(key, data, this.HOTSPOT_TTL);
  }

  static getHotspots(key: string): any | null {
    return cache.get(key);
  }

  static setMetrics(key: string, data: any): void {
    cache.set(key, data, this.METRICS_TTL);
  }

  static getMetrics(key: string): any | null {
    return cache.get(key);
  }

  static invalidateDistrict(id?: string): void {
    const key = this.getDistrictKey(id);
    cache.delete(key);
    
    // Also invalidate the 'all districts' cache
    if (id) {
      cache.delete(this.getDistrictKey());
    }
  }

  static invalidateHotspots(): void {
    // This is a simple approach - in production you might want more sophisticated invalidation
    cache.clear();
  }

  static invalidateMetrics(districtId?: string): void {
    if (districtId) {
      // Invalidate specific district metrics
      cache.delete(this.getMetricsKey(districtId));
    } else {
      // Invalidate all metrics
      cache.clear();
    }
  }
}

// API Response cache helper
export function cacheApiResponse(handler: Function, ttl = 300000) { // 5 minutes default
  return async (req: any) => {
    const cacheKey = `api:${req.url}:${req.method}:${JSON.stringify(req.query || {})}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
        },
      });
    }

    const response = await handler(req);
    
    if (response.ok) {
      const data = await response.json();
      cache.set(cacheKey, data, ttl);
      
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'MISS',
        },
      });
    }

    return response;
  };
}

// Cache statistics
export function getCacheStats(): {
  size: number;
  entries: { key: string; timestamp: number; ttl: number }[];
} {
  const entries: { key: string; timestamp: number; ttl: number }[] = [];
  
  (cache as any).cache.forEach((entry: CacheEntry<any>, key: string) => {
    entries.push({
      key,
      timestamp: entry.timestamp,
      ttl: entry.ttl,
    });
  });

  return {
    size: cache.size(),
    entries,
  };
}