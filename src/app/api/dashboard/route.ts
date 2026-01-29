import { prisma } from '@/lib/prisma'
import { mockDashboard } from '../_mocks/mockData'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const responseSchema = z.object({
  autonomousLoop: z.object({
    sense: z.object({
      status: z.enum(['success', 'error', 'running']),
      lastRun: z.string().nullable(),
      errorCount: z.number()
    }),
    reason: z.object({
      status: z.enum(['success', 'error', 'running']),
      lastRun: z.string().nullable(),
      errorCount: z.number()
    }),
    act: z.object({
      status: z.enum(['success', 'error', 'running']),
      queueLength: z.number(),
      lastAction: z.string().nullable()
    })
  }),
  metrics: z.object({
    hotspots: z.object({
      last24h: z.number(),
      last7d: z.number(),
      trend: z.number() // percentage change
    }),
    processing: z.object({
      avgLatencyMs: z.number(),
      successRate: z.number(),
      totalProcessed: z.number()
    }),
    coverage: z.object({
      percentage: z.number(),
      lastUpdate: z.string()
    })
  }),
  alerts: z.object({
    active: z.object({
      high: z.number(),
      medium: z.number(),
      low: z.number()
    }),
    recent: z.array(z.object({
      id: z.string(),
      level: z.string(),
      message: z.string(),
      severity: z.number(),
      createdAt: z.string()
    })).max(5)
  }),
  trends: z.object({
    daily: z.array(z.object({
      date: z.string(),
      hotspots: z.number(),
      coverage: z.number(),
      processingTime: z.number()
    })),
    topRegions: z.array(z.object({
      name: z.string(),
      count: z.number()
    })).max(5)
  })
})

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (process.env.USE_MOCK_API === '1') return NextResponse.json(mockDashboard())
    
    // Get autonomous loop status. Wrap DB calls to avoid throwing if schema/tables are missing.
    let latestProcessLogs: any[] = []
    let agentLogs: any[] = []
    let alerts: any[] = []

    try {
      [latestProcessLogs, agentLogs, alerts] = await Promise.all([
        prisma.processLog.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          where: {
            OR: [
              { type: 'INGEST' },
              { type: 'PROCESSING' },
              { type: 'ALERTS' }
            ]
          }
        }),
        prisma.agentLog.findMany({
          take: 10,
          orderBy: { timestamp: 'desc' }
        }),
        prisma.alert.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' }
        })
      ])
    } catch (dbErr) {
      console.warn('Dashboard: database unavailable, returning mock data', String(dbErr))
      return NextResponse.json(mockDashboard())
    }

    // Calculate error counts
    const errorCounts = {
      ingest: latestProcessLogs.filter(log => log.type === 'INGEST' && log.status === 'ERROR').length,
      processing: latestProcessLogs.filter(log => log.type === 'PROCESSING' && log.status === 'ERROR').length,
      alerts: latestProcessLogs.filter(log => log.type === 'ALERTS' && log.status === 'ERROR').length
    }

    // Get metrics for the last 24 hours and 7 days
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    let metrics: any[] = []
    try {
      metrics = await prisma.metricHistory.findMany({
        where: {
          timestamp: {
            gte: last7d
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      })
    } catch (err) {
      console.warn('Dashboard: error fetching metricHistory, using empty metrics', String(err))
      metrics = []
    }

    // Calculate metrics
    const hotspots24h = metrics
      .filter(m => m.type === 'HOTSPOT' && m.timestamp >= last24h)
      .reduce((sum, m) => sum + m.value, 0)

    const hotspots7d = metrics
      .filter(m => m.type === 'HOTSPOT')
      .reduce((sum, m) => sum + m.value, 0)

    const processingTimes = metrics
      .filter(m => m.type === 'PROCESSING_TIME')
      .map(m => m.value)

    const avgLatency = processingTimes.length > 0
      ? processingTimes.reduce((sum, val) => sum + val, 0) / processingTimes.length
      : 0

    const coverage = metrics
      .filter(m => m.type === 'COVERAGE')
      .slice(0, 1)[0]?.value || 0

    // If no metrics data exists in database, return mock data
    if (hotspots24h === 0 && avgLatency === 0 && coverage === 0) {
      console.warn('Dashboard: no metrics data found, returning mock data')
      return NextResponse.json(mockDashboard())
    }

    // Format response
    const response = {
      autonomousLoop: {
        sense: {
          status: getComponentStatus(latestProcessLogs, 'INGEST'),
          lastRun: getLastRun(latestProcessLogs, 'INGEST'),
          errorCount: errorCounts.ingest
        },
        reason: {
          status: getComponentStatus(latestProcessLogs, 'PROCESSING'),
          lastRun: getLastRun(latestProcessLogs, 'PROCESSING'),
          errorCount: errorCounts.processing
        },
        act: {
          status: getComponentStatus(latestProcessLogs, 'ALERTS'),
          queueLength: alerts.filter(a => !a.sentAt).length,
          lastAction: alerts[0]?.sentAt?.toISOString() || null
        }
      },
      metrics: {
        hotspots: {
          last24h: hotspots24h,
          last7d: hotspots7d,
          trend: (hotspots7d > 0 && hotspots24h > 0) 
            ? ((hotspots24h / (hotspots7d/7)) - 1) * 100 
            : 0
        },
        processing: {
          avgLatencyMs: avgLatency,
          successRate: calculateSuccessRate(latestProcessLogs),
          totalProcessed: latestProcessLogs.length
        },
        coverage: {
          percentage: coverage,
          lastUpdate: metrics[0]?.timestamp.toISOString() || new Date().toISOString()
        }
      },
      alerts: {
        active: {
          high: alerts.filter(a => a.severity === 3).length,
          medium: alerts.filter(a => a.severity === 2).length,
          low: alerts.filter(a => a.severity === 1).length
        },
        recent: alerts.map(a => ({
          id: a.id,
          level: a.level,
          message: a.message,
          severity: a.severity,
          createdAt: a.createdAt.toISOString()
        }))
      },
      trends: {
        daily: buildDailyTrends(metrics),
        topRegions: await (async () => {
          try { return await getTopRegions() } catch (err) { console.warn('Dashboard: getTopRegions failed', String(err)); return [] }
        })()
      }
    }

    // Validate response
    const validated = responseSchema.parse(response)
    return NextResponse.json(validated)

  } catch (error) {
    console.error('Dashboard API Error:', error)
    // Return mock data on any error
    return NextResponse.json(mockDashboard())
  }
}

function getComponentStatus(logs: any[], type: string) {
  const latest = logs.find(l => l.type === type)
  if (!latest) return 'error'
  if (latest.status === 'RUNNING') return 'running'
  return latest.status.toLowerCase() === 'success' ? 'success' : 'error'
}

function getLastRun(logs: any[], type: string) {
  const latest = logs.find(l => l.type === type)
  return latest?.createdAt.toISOString() || null
}

function calculateSuccessRate(logs: any[]) {
  if (logs.length === 0) return 0
  const successful = logs.filter(l => l.status === 'SUCCESS').length
  return (successful / logs.length) * 100
}

function buildDailyTrends(metrics: any[]) {
  const days: { [key: string]: any } = {}

  metrics.forEach(m => {
    const date = m.timestamp.toISOString().split('T')[0]
    if (!days[date]) {
      days[date] = {
        date,
        hotspots: 0,
        coverage: 0,
        processingTime: 0
      }
    }

    switch (m.type) {
      case 'HOTSPOT':
        days[date].hotspots += m.value
        break
      case 'COVERAGE':
        days[date].coverage = m.value
        break
      case 'PROCESSING_TIME':
        days[date].processingTime = m.value
        break
    }
  })

  return Object.values(days)
}

async function getTopRegions() {
  const districts = await prisma.district.findMany({
    select: {
      name: true,
      _count: {
        select: {
          hotspots: true
        }
      }
    },
    orderBy: {
      hotspots: {
        _count: 'desc'
      }
    },
    take: 5
  })

  return districts.map(d => ({
    name: d.name,
    count: d._count.hotspots
  }))
}