/**
 * Real-time monitoring dashboard with WebSocket support
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
// @ts-ignore - ws types may not be available
import { WebSocketServer } from 'ws';
import { performanceMonitor } from './performance-monitor';
import { logger } from './error-handling';
import { cache } from './cache';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

interface MonitoringData {
  timestamp: number;
  system: {
    memory: number;
    cpu: number;
    uptime: number;
  };
  cache: {
    size: number;
    hitRate: number;
  };
  api: {
    activeRequests: number;
    averageResponseTime: number;
    errorRate: number;
  };
  database: {
    connections: number;
    queryTime: number;
  };
}

class MonitoringSystem {
  private wsServer?: WebSocketServer;
  private monitoringInterval?: NodeJS.Timeout;
  private clients = new Set<any>();
  private metrics: MonitoringData[] = [];

  async initialize(server: any): Promise<void> {
    this.wsServer = new WebSocketServer({ server, path: '/api/ws/monitoring' });
    
    this.wsServer.on('connection', (ws: any) => {
      this.clients.add(ws);
      logger.info('New monitoring client connected', 'monitoring');
      
      // Send current metrics to new client
      ws.send(JSON.stringify({
        type: 'initial',
        data: this.getLatestMetrics(),
      }));

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.info('Monitoring client disconnected', 'monitoring');
      });

      ws.on('error', (error: any) => {
        logger.error('WebSocket error', error, 'monitoring');
        this.clients.delete(ws);
      });
    });

    // Start collecting metrics every 5 seconds
    this.startMetricsCollection();
    
    logger.info('Monitoring system initialized', 'monitoring');
  }

  private startMetricsCollection(): void {
    this.monitoringInterval = setInterval(() => {
      const metrics = this.collectMetrics();
      this.metrics.push(metrics);
      
      // Keep only last 1000 data points (about 1.4 hours at 5s intervals)
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // Broadcast to all connected clients
      this.broadcast({
        type: 'update',
        data: metrics,
      });
    }, 5000);
  }

  private collectMetrics(): MonitoringData {
    const systemStats = performanceMonitor.getSystemStats();
    const cacheStats = cache.size();
    
    return {
      timestamp: Date.now(),
      system: {
        memory: systemStats.memory.value,
        cpu: systemStats.cpu.value,
        uptime: systemStats.uptime.value,
      },
      cache: {
        size: cacheStats,
        hitRate: this.calculateCacheHitRate(),
      },
      api: {
        activeRequests: this.getActiveRequestCount(),
        averageResponseTime: performanceMonitor.getAverageTime('api_request'),
        errorRate: this.calculateErrorRate(),
      },
      database: {
        connections: this.getDatabaseConnections(),
        queryTime: performanceMonitor.getAverageTime('db_query'),
      },
    };
  }

  private broadcast(message: any): void {
    const messageStr = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(messageStr);
        } catch (error) {
          logger.error('Failed to send message to client', error as Error, 'monitoring');
          this.clients.delete(client);
        }
      }
    });
  }

  private calculateCacheHitRate(): number {
    // This would be implemented based on your cache statistics
    return 0.85; // Placeholder
  }

  private getActiveRequestCount(): number {
    // This would track active HTTP requests
    return Math.floor(Math.random() * 10); // Placeholder
  }

  private calculateErrorRate(): number {
    // Calculate error rate from recent requests
    return 0.02; // Placeholder
  }

  private getDatabaseConnections(): number {
    // Get current database connection count
    return 5; // Placeholder
  }

  public getLatestMetrics(): MonitoringData | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  public getMetricsHistory(minutes: number = 60): MonitoringData[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  public getAlerts(): Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: number;
  }> {
    const alerts: Array<{
      id: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      timestamp: number;
    }> = [];
    const latest = this.getLatestMetrics();
    
    if (!latest) return alerts;

    // Memory usage alerts
    const memoryUsageGB = latest.system.memory / (1024 * 1024 * 1024);
    if (memoryUsageGB > 1) {
      alerts.push({
        id: 'memory_high',
        severity: memoryUsageGB > 2 ? 'critical' : 'high',
        message: `High memory usage: ${memoryUsageGB.toFixed(2)}GB`,
        timestamp: latest.timestamp,
      });
    }

    // Response time alerts
    if (latest.api.averageResponseTime > 1000) {
      alerts.push({
        id: 'response_time_high',
        severity: latest.api.averageResponseTime > 5000 ? 'critical' : 'medium',
        message: `Slow API responses: ${latest.api.averageResponseTime}ms average`,
        timestamp: latest.timestamp,
      });
    }

    // Error rate alerts
    if (latest.api.errorRate > 0.05) {
      alerts.push({
        id: 'error_rate_high',
        severity: latest.api.errorRate > 0.1 ? 'critical' : 'high',
        message: `High error rate: ${(latest.api.errorRate * 100).toFixed(1)}%`,
        timestamp: latest.timestamp,
      });
    }

    return alerts;
  }

  public destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    if (this.wsServer) {
      this.wsServer.close();
    }

    this.clients.clear();
    logger.info('Monitoring system destroyed', 'monitoring');
  }
}

export const monitoringSystem = new MonitoringSystem();

// Export hook for React components
export function useMonitoring() {
  const [metrics, setMetrics] = useState<MonitoringData | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3000/api/ws/monitoring`);
    
    ws.onopen = () => {
      setIsConnected(true);
      logger.info('Connected to monitoring WebSocket', 'monitoring-client');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'initial' || message.type === 'update') {
          setMetrics(message.data);
          // Update alerts based on metrics
          setAlerts(monitoringSystem.getAlerts());
        }
      } catch (error) {
        logger.error('Failed to parse WebSocket message', error as Error, 'monitoring-client');
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      logger.info('Disconnected from monitoring WebSocket', 'monitoring-client');
    };

    ws.onerror = (error) => {
      logger.error('WebSocket error', error as any, 'monitoring-client');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return { metrics, alerts, isConnected };
}

// React hook imports (these would normally be at the top)
import { useState, useEffect } from 'react';