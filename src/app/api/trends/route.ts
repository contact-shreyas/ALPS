import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { mockTrends } from '../_mocks/mockData'
import { z } from 'zod'

const querySchema = z.object({ range: z.string().regex(/^(7d|30d|90d)$/).optional().default('30d') })

export async function GET(request: Request) {
  try {
    if (process.env.USE_MOCK_API === '1') return NextResponse.json(mockTrends())
    const url = new URL(request.url)
    const { range } = querySchema.parse({ range: url.searchParams.get('range') ?? undefined })

    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
    const start = new Date()
    start.setDate(start.getDate() - days)

    const metrics = await prisma.metric.findMany({
      where: { date: { gte: start } },
      select: { date: true, valueNumeric: true, entity: { select: { region: true, code: true, name: true } } },
      orderBy: { date: 'asc' },
    })

    // Build national daily averages
    const byDate = new Map<string, { sum: number; count: number }>()
    for (const m of metrics) {
      const key = m.date.toISOString().slice(0, 10)
      const cur = byDate.get(key) ?? { sum: 0, count: 0 }
      cur.sum += m.valueNumeric
      cur.count += 1
      byDate.set(key, cur)
    }
    const national = Array.from(byDate.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, v]) => ({ date, value: v.count ? Number((v.sum / v.count).toFixed(2)) : 0 }))

    // Top regions by count of entities whose last value > percentile threshold
    const latestByEntity = new Map<string, { region: string; code: string; name: string; value: number; spark: number[] }>()
    for (const m of metrics) {
      const k = m.entity.code
      const existing = latestByEntity.get(k)
      if (!existing) {
        latestByEntity.set(k, { region: m.entity.region, code: m.entity.code, name: m.entity.name, value: m.valueNumeric, spark: [m.valueNumeric] })
      } else {
        existing.value = m.valueNumeric
        existing.spark.push(m.valueNumeric)
      }
    }

    const items = Array.from(latestByEntity.values())
    const values = items.map((i) => i.value).sort((a, b) => a - b)
    const p80 = values.length ? values[Math.floor(values.length * 0.8)] : 0

    const byRegion = new Map<string, number>()
    for (const i of items) {
      if (i.value >= p80) byRegion.set(i.region, (byRegion.get(i.region) ?? 0) + 1)
    }
    const topRegions = Array.from(byRegion.entries())
      .map(([region, affected]) => ({ region, affected }))
      .sort((a, b) => b.affected - a.affected)
      .slice(0, 5)

    const topItems = items
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((i) => ({ code: i.code, name: i.name, score: Number(i.value.toFixed(2)), spark: i.spark.slice(-30) }))

    return NextResponse.json({ national, topRegions, topItems })
  } catch (error) {
    console.error('Error fetching trends:', error)
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 400 })
  }
}
