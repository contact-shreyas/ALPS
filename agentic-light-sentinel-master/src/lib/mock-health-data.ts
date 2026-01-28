import { SystemHealth, SystemEvent, SystemMetric } from '@/types/system-health';

function generateMetric(
  baseValue: number,
  variance: number,
  previousValue?: number
): SystemMetric {
  // Add some realistic variance
  const value = Math.min(100, Math.max(0,
    baseValue + (Math.random() - 0.5) * variance
  ));

  // Determine trend
  const trend = previousValue
    ? value > previousValue + 1
      ? 'up'
      : value < previousValue - 1
      ? 'down'
      : 'stable'
    : 'stable';

  // Calculate status based on thresholds
  const status =
    value >= 80 ? 'healthy' :
    value >= 60 ? 'warning' : 'critical';

  return {
    value,
    previousValue: previousValue ?? value,
    trend,
    status,
    lastUpdated: new Date().toISOString()
  };
}

function generateRadianceHistory(count: number = 24) {
  const baseValue = 0.8;
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(Date.now() - (count - i) * 3600000).toISOString(),
    value: baseValue + Math.sin(i / 4) * 0.3 + Math.random() * 0.2
  }));
}

export function generateMockHealthData(previous?: SystemHealth): SystemHealth {
  const radianceHistory = generateRadianceHistory();
  const currentRadiance = radianceHistory[radianceHistory.length - 1].value;

  const health: SystemHealth = {
    detectionPrecision: generateMetric(85, 10, previous?.detectionPrecision.value),
    detectionRecall: generateMetric(82, 8, previous?.detectionRecall.value),
    coverage: generateMetric(75, 15, previous?.coverage.value),
    responseTime: generateMetric(88, 12, previous?.responseTime.value),
    radianceLevels: {
      current: currentRadiance,
      average: radianceHistory.reduce((a, b) => a + b.value, 0) / radianceHistory.length,
      peak: Math.max(...radianceHistory.map(h => h.value)),
      history: radianceHistory
    },
    systemStatus: {
      detection: 'optimal',
      coverage: 'partial',
      response: 'fast'
    },
    issuesCount: Math.floor(Math.random() * 5),
    lastUpdate: new Date().toISOString()
  };

  // Update system status based on metrics
  health.systemStatus = {
    detection: health.detectionPrecision.value >= 80 ? 'optimal' :
              health.detectionPrecision.value >= 60 ? 'needs_tuning' : 'critical',
    coverage: health.coverage.value >= 80 ? 'full' :
             health.coverage.value >= 60 ? 'partial' : 'limited',
    response: health.responseTime.value >= 80 ? 'fast' :
             health.responseTime.value >= 60 ? 'moderate' : 'slow'
  };

  return health;
}

export function generateMockEvents(count: number = 10): SystemEvent[] {
  const eventTypes: Array<SystemEvent['type']> = ['info', 'warning', 'error'];
  const messages = [
    'System calibration completed',
    'Detection accuracy below threshold',
    'Coverage gap detected in region',
    'Response time spike observed',
    'Automatic recovery initiated',
    'Sensor recalibration required',
    'Data pipeline latency increased'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `evt-${Date.now()}-${i}`,
    timestamp: new Date(Date.now() - i * 300000).toISOString(),
    type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    details: {
      area: `Region-${Math.floor(Math.random() * 5) + 1}`,
      metric: Math.random() * 100
    }
  }));
}