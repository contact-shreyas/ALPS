export interface SystemMetric {
  value: number;
  previousValue?: number;
  trend?: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
}

export interface SystemHealth {
  detectionPrecision: SystemMetric;
  detectionRecall: SystemMetric;
  coverage: SystemMetric;
  responseTime: SystemMetric;
  radianceLevels: {
    current: number;
    average: number;
    peak: number;
    history: Array<{ timestamp: string; value: number }>;
  };
  systemStatus: {
    detection: 'optimal' | 'needs_tuning' | 'critical';
    coverage: 'full' | 'partial' | 'limited';
    response: 'fast' | 'moderate' | 'slow';
  };
  issuesCount: number;
  lastUpdate: string;
}

export interface SystemEvent {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  details?: Record<string, any>;
}

export interface SystemHealthConfig {
  thresholds: {
    precision: number;
    coverage: number;
    responseTime: number;
  };
  updateInterval: number;
  darkMode: boolean;
}

// Default configuration
export const DEFAULT_CONFIG: SystemHealthConfig = {
  thresholds: {
    precision: 80, // 80%
    coverage: 60, // 60%
    responseTime: 5000, // 5 seconds
  },
  updateInterval: 30, // 30 seconds
  darkMode: false,
};