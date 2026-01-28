export const mockDashboard = () => ({
  autonomousLoop: {
    sense: { status: 'success', lastRun: new Date().toISOString(), errorCount: 0 },
    reason: { status: 'success', lastRun: new Date().toISOString(), errorCount: 0 },
    act: { status: 'success', queueLength: 0, lastAction: new Date().toISOString() }
  },
  metrics: {
    hotspots: { last24h: 12, last7d: 80, trend: 5.2 },
    processing: { avgLatencyMs: 1200, successRate: 98.5, totalProcessed: 240 },
    coverage: { percentage: 92.3, lastUpdate: new Date().toISOString() }
  },
  alerts: {
    active: { high: 2, medium: 5, low: 8 },
    recent: [
      { id: 'a1', level: 'HIGH', message: 'Bright hotspot in District A', severity: 3, createdAt: new Date().toISOString() },
      { id: 'a2', level: 'MEDIUM', message: 'Moderate increase in District B', severity: 2, createdAt: new Date().toISOString() }
    ]
  },
  trends: {
    daily: Array.from({ length: 30 }).map((_, i) => ({ date: new Date(Date.now() - (29 - i) * 24 * 3600 * 1000).toISOString().slice(0,10), hotspots: Math.round(Math.random()*10), coverage: 90 + Math.random()*5, processingTime: 1000 + Math.round(Math.random()*400) })),
    topRegions: [ { name: 'Region X', count: 12 }, { name: 'Region Y', count: 8 } ]
  }
})

export const mockTrends = () => ({
  national: Array.from({ length: 30 }).map((_, i) => ({ date: new Date(Date.now() - (29 - i) * 24 * 3600 * 1000).toISOString().slice(0,10), value: Math.round(50 + Math.random()*50) })),
  topRegions: [{ region: 'Region X', affected: 12 }],
  topItems: [{ code: 'D1', name: 'District 1', score: 123.4, spark: Array.from({length:30}).map(()=>Math.random()*100) }]
})

export const mockMetricsCurrent = () => ({
  precision: 0.88,
  recall: 0.75,
  ingestAlertP50: 2.1,
  ingestAlertP95: 5.3,
  coverage: { percentage: 92.3 },
  avgRadiance: 0.12,
  maxRadiance: 1.34,
  timestamp: new Date().toISOString()
})

export const mockDatasetInfo = () => ({ totalDistricts: 739, districtsWithData: 700, latestMetricDate: new Date().toISOString() })

export const mockHotspots = () => ({ hotspots: [ { id: 'h1', lat: 19.0, lng: 72.8, brightness: 3.2, severity: 'high', detectedAt: new Date().toISOString() } ] })

export const mockOverview = () => ({ sources: [], alerts: { total: 0, high: 0, medium: 0, low: 0 }, metrics: { avgLatency: 1200, precisionAtK: 0.9, totalAlerts7d: 5, actionsSent: 2 }, lastUpdated: new Date().toISOString() })
