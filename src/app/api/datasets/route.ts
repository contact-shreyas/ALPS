import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '../../../lib/prisma'

const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
})

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = QuerySchema.parse({
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
    })

    const skip = (query.page - 1) * query.pageSize

    // Get sources (datasets) from database
    const [sources, total] = await Promise.all([
      prisma.source.findMany({
        skip,
        take: query.pageSize,
        orderBy: { lastUpdatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          kind: true,
          coveragePct: true,
          lastUpdatedAt: true,
          createdAt: true,
          _count: {
            select: { entities: true }
          }
        }
      }),
      prisma.source.count()
    ])

    const datasets = sources.map(source => ({
      id: source.id,
      name: source.name,
      kind: source.kind,
      coveragePct: source.coveragePct,
      lastUpdatedAt: source.lastUpdatedAt.toISOString(),
      status: 'active' as const, // Default status since not in schema
      recordCount: source._count.entities,
      format: source.kind.toUpperCase(),
      description: `${source.kind} dataset with ${source._count.entities} entities`,
    }))

    return NextResponse.json({
      datasets,
      total,
    })
  } catch (error) {
    console.error('Error fetching datasets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch datasets' },
      { status: 500 }
    )
  }
}