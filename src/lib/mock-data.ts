/**
 * Mock data for APIs when database is unavailable (e.g., on Vercel serverless)
 */

export const mockAlerts = [
  {
    id: 'alert-1',
    severity: 'HIGH',
    title: 'Critical Light Pollution Spike',
    details: 'Light pollution levels exceeded 150 nW/cm² in North Region',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    acknowledgedAt: null,
    entity: { code: 'North-001', name: 'North Region', region: 'North' },
  },
  {
    id: 'alert-2',
    severity: 'MEDIUM',
    title: 'Moderate Pollution Detected',
    details: 'South-East area showing elevated light pollution',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    acknowledgedAt: null,
    entity: { code: 'SE-002', name: 'South-East', region: 'South' },
  },
  {
    id: 'alert-3',
    severity: 'LOW',
    title: 'Minor Activity Detected',
    details: 'Routine light pollution monitoring alert',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    acknowledgedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    entity: { code: 'West-003', name: 'West Region', region: 'West' },
  },
];

export const mockTrendingEntities = [
  {
    code: 'North-hayc',
    name: 'North 903',
    region: 'North',
    trendScore: 8.5,
    recentChange: 12.3,
    alertCount: 2,
    severity: 'HIGH',
    sparkline: [45, 48, 52, 55, 58, 62, 65, 68],
  },
  {
    code: 'Central-metro',
    name: 'Metro City Center',
    region: 'Central',
    trendScore: 7.2,
    recentChange: 8.1,
    alertCount: 1,
    severity: 'MEDIUM',
    sparkline: [38, 40, 42, 44, 45, 48, 50, 52],
  },
  {
    code: 'South-coastal',
    name: 'South Coastal Area',
    region: 'South',
    trendScore: 5.8,
    recentChange: 3.2,
    alertCount: 0,
    severity: 'LOW',
    sparkline: [22, 23, 24, 25, 26, 27, 28, 29],
  },
  {
    code: 'East-industrial',
    name: 'East Industrial Zone',
    region: 'East',
    trendScore: 6.9,
    recentChange: 6.7,
    alertCount: 1,
    severity: 'MEDIUM',
    sparkline: [35, 36, 38, 40, 42, 45, 48, 51],
  },
  {
    code: 'West-rural',
    name: 'West Rural Region',
    region: 'West',
    trendScore: 3.2,
    recentChange: -1.5,
    alertCount: 0,
    severity: 'LOW',
    sparkline: [15, 14, 14, 15, 16, 16, 17, 18],
  },
];

export function getMockAlerts(page: number = 1, pageSize: number = 10, severity?: string) {
  const filtered = severity
    ? mockAlerts.filter(a => a.severity === severity)
    : mockAlerts;

  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return {
    items: paged,
    total: filtered.length,
    page,
    pageSize,
  };
}

export function getMockTrendingEntities(limit: number = 10) {
  return {
    topItems: mockTrendingEntities.slice(0, Math.min(limit, mockTrendingEntities.length)),
    timestamp: new Date().toISOString(),
  };
}
