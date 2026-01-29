import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { getMockAlerts } from '../../../lib/mock-data'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
})

const itemSchema = z.object({
  id: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  title: z.string(),
  details: z.string(),
  createdAt: z.date(),
  acknowledgedAt: z.date().nullable(),
  entity: z.object({ code: z.string(), name: z.string(), region: z.string() }),
})

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const { page, pageSize, severity } = querySchema.parse({
      page: url.searchParams.get('page') ?? undefined,
      pageSize: url.searchParams.get('pageSize') ?? undefined,
      severity: url.searchParams.get('severity') ?? undefined,
    })

    const where = severity
      ? { severity: severity === 'LOW' ? 1 : severity === 'MEDIUM' ? 2 : 3 }
      : undefined

    try {
      const [rows, total] = await Promise.all([
        prisma.alert.findMany({
          where: where as any,
          include: { entity: true },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.alert.count({ where: where as any }),
      ])

      const mapped = rows.map((a: any) => ({
        id: a.id,
        severity: a.severity === 3 ? 'HIGH' : a.severity === 2 ? 'MEDIUM' : 'LOW',
        title: a.message ?? `Alert for ${a.entity?.name ?? a.code}`,
        details: a.details ?? `${a.message ?? 'Alert'} in ${a.entity?.region ?? 'Unknown'}`,
        createdAt: a.createdAt,
        acknowledgedAt: a.acknowledgedAt ?? null,
        entity: { code: a.entity?.code ?? a.code, name: a.entity?.name ?? a.code, region: a.entity?.region ?? 'N/A' },
      }))

      const items = z.array(itemSchema).parse(mapped)
      return NextResponse.json({
        items: items.map(item => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          acknowledgedAt: item.acknowledgedAt?.toISOString() || null,
          source: item.entity.region,
          region: item.entity.region,
        })),
        currentPage: page,
        totalPages: Math.ceil(total / pageSize),
        total,
      })
    } catch (dbError) {
      // Database unavailable - return mock data
      console.log('Database unavailable, using mock data:', dbError)
      const mockData = getMockAlerts(page, pageSize, severity)
      return NextResponse.json({
        items: mockData.items.map(item => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          acknowledgedAt: item.acknowledgedAt?.toISOString() || null,
          source: item.entity.region,
          region: item.entity.region,
        })),
        currentPage: mockData.page,
        totalPages: Math.ceil(mockData.total / pageSize),
        total: mockData.total,
        source: 'mock',
      })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
  }
}
