import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '../../../../lib/prisma'

const QuerySchema = z.object({
  range: z.string().nullable().transform(val => val || '30d'),
  limit: z.string().nullable().transform(val => parseInt(val || '10') || 10).pipe(z.number().min(1).max(50)),
})

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = QuerySchema.parse({
      range: searchParams.get('range'),
      limit: searchParams.get('limit'),
    })

    // Parse range to days
    const rangeDays = parseInt(query.range.replace('d', '')) || 30
    const since = new Date()
    since.setDate(since.getDate() - rangeDays)

    // Get entities with recent metrics
    const entities = await prisma.entity.findMany({
      include: {
        metrics: {
          where: { date: { gte: since } },
          orderBy: { date: 'asc' },
        },
        alerts: {
          where: { createdAt: { gte: since } },
          select: { severity: true }
        }
      },
      take: query.limit * 2, // Get more to filter out entities with insufficient data
    })

    // Calculate trending scores and sparklines
    const trending = entities
      .map(entity => {
        const metrics = entity.metrics
        if (metrics.length < 2) return null // Need minimum data points

        const values = metrics.map(m => m.valueNumeric || 0)
        const recent = values.slice(-7) // Last 7 days
        const previous = values.slice(-14, -7) // Previous 7 days

        const recentAvg = recent.length > 0 
          ? recent.reduce((a, b) => a + b, 0) / recent.length 
          : 0
        const previousAvg = previous.length > 0 
          ? previous.reduce((a, b) => a + b, 0) / previous.length 
          : recentAvg

        // Calculate trend score (positive means increasing)
        const trendScore = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0
        
        // Factor in alerts for severity
        let alertWeight = 0
        entity.alerts.forEach(alert => {
          alertWeight += alert.severity || 1
        })

        const finalScore = Math.abs(trendScore) + (alertWeight * 10)

        // Create sparkline from last 30 values or all available
        const sparkValues = values.slice(-30)

        return {
          code: entity.code,
          name: entity.name,
          region: entity.region,
          score: finalScore,
          spark: sparkValues,
          radiance: recentAvg,
          severity: alertWeight > 5 ? 'high' : alertWeight > 2 ? 'medium' : 'low' as const,
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b?.score || 0) - (a?.score || 0))
      .slice(0, query.limit)

    return NextResponse.json({
      topItems: trending,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching trending entities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending entities' },
      { status: 500 }
    )
  }
}