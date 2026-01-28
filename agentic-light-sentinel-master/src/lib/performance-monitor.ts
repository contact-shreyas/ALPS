/**
 * Performance monitoring and metrics collection
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();

  startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  endTimer(name: string, tags?: Record<string, string>): PerformanceMetric | null {
    const startTime = this.timers.get(name);
    if (!startTime) return null;

    const duration = Date.now() - startTime;
    this.timers.delete(name);

    const metric: PerformanceMetric = {
      name,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      tags,
    };

    this.addMetric(metric);
    return metric;
  }

  addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to avoid memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageTime(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, metric) => sum + metric.value, 0);
    return total / metrics.length;
  }

  clear(): void {
    this.metrics = [];
    this.timers.clear();
  }

  getMemoryUsage(): PerformanceMetric {
    const usage = process.memoryUsage();
    return {
      name: 'memory.heap.used',
      value: usage.heapUsed,
      unit: 'bytes',
      timestamp: new Date(),
      tags: {
        heapTotal: usage.heapTotal.toString(),
        external: usage.external.toString(),
        rss: usage.rss.toString(),
      },
    };
  }

  getCPUUsage(): PerformanceMetric {
    const usage = process.cpuUsage();
    return {
      name: 'cpu.usage',
      value: usage.user + usage.system,
      unit: 'microseconds',
      timestamp: new Date(),
      tags: {
        user: usage.user.toString(),
        system: usage.system.toString(),
      },
    };
  }

  getSystemStats(): {
    memory: PerformanceMetric;
    cpu: PerformanceMetric;
    uptime: PerformanceMetric;
  } {
    return {
      memory: this.getMemoryUsage(),
      cpu: this.getCPUUsage(),
      uptime: {
        name: 'system.uptime',
        value: process.uptime(),
        unit: 'seconds',
        timestamp: new Date(),
      },
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Decorator for timing function execution
export function timed(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const timerName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      performanceMonitor.startTimer(timerName);
      try {
        const result = await originalMethod.apply(this, args);
        performanceMonitor.endTimer(timerName);
        return result;
      } catch (error) {
        performanceMonitor.endTimer(timerName, { error: 'true' });
        throw error;
      }
    };

    return descriptor;
  };
}