import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { mockOverview } from '../_mocks/mockData'

const overviewSchema = z.object({
  sources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      kind: z.string(),
      coveragePct: z.number(),
      lastUpdatedAt: z.date(),
    }),
  ),
  alerts: z.object({
    total: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
  }),
  metrics: z.object({
    avgLatency: z.number(),
    precisionAtK: z.number(),
    totalAlerts7d: z.number(),
    actionsSent: z.number(),
  }),
  lastUpdated: z.date(),
})

export async function GET() {
  try {
    if (process.env.USE_MOCK_API === '1') return NextResponse.json(mockOverview())
    let sources: any[] = []
    try {
      sources = await prisma.source.findMany({
        select: { id: true, name: true, kind: true, coveragePct: true, lastUpdatedAt: true },
        orderBy: { name: 'asc' },
      })
    } catch (err) {
      console.warn('Overview: failed to fetch sources, using empty list', String(err))
      sources = []
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    let alerts7d: any[] = []
    let events7d: any[] = []
    try {
      [alerts7d, events7d] = await Promise.all([
        prisma.alert.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { severity: true } }),
        prisma.event.findMany({ where: { at: { gte: sevenDaysAgo } }, select: { meta: true, phase: true } }),
      ])
    } catch (err) {
      console.warn('Overview: failed to fetch alerts/events, using empty arrays', String(err))
      alerts7d = []
      events7d = []
    }

    const totalAlerts7d = alerts7d.length
    const high = alerts7d.filter((a) => a.severity === 3).length
    const medium = alerts7d.filter((a) => a.severity === 2).length
    const low = alerts7d.filter((a) => a.severity === 1).length

    const durations = events7d.map((e) => (e.meta as any)?.duration).filter((n) => typeof n === 'number') as number[]
    const avgLatency = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
    const actionsSent = events7d.filter((e) => e.phase === 'ACT').length

    // deterministic simulated precision@k (do not use Math.random in API)
    const precisionAtK = 0.9

    const overview = {
      sources,
      alerts: { total: totalAlerts7d, high, medium, low },
      metrics: { avgLatency, precisionAtK, totalAlerts7d, actionsSent },
      lastUpdated: new Date(),
    }

    const validated = overviewSchema.parse(overview)
    return NextResponse.json(validated)
  } catch (error) {
    console.error('Overview API error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
