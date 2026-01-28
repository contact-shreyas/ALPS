import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const alertSchema = z.object({
  id: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  title: z.string(),
  details: z.string(),
  createdAt: z.date(),
  acknowledgedAt: z.date().nullable(),
  entity: z.object({
    name: z.string(),
    region: z.string(),
    source: z.object({
      name: z.string(),
    }),
  }),
})

const alertsResponseSchema = z.array(alertSchema)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const severityFilter = searchParams.get('severity')?.toUpperCase()

    const where = severityFilter
      ? { severity: severityFilter === 'LOW' ? 1 : severityFilter === 'MEDIUM' ? 2 : 3 }
      : {}

    const alertsRaw = await prisma.alert.findMany({
      where: where as any,
      include: {
        entity: {
          include: {
            source: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const totalAlerts = await prisma.alert.count({ where: where as any })

    // Map numeric severity and derive title/details if missing
    const mapped = alertsRaw.map((a: any) => ({
      id: a.id,
      severity: a.severity === 3 ? 'HIGH' : a.severity === 2 ? 'MEDIUM' : 'LOW',
      title: a.message ?? `Alert for ${a.entity?.name ?? a.code}`,
      details:
        a.details ?? `${a.message ?? 'Alert'} in ${a.entity?.region ?? 'Unknown'} (${a.entity?.source?.name ?? 'Source'})`,
      createdAt: a.createdAt,
      acknowledgedAt: a.acknowledgedAt ?? null,
      entity: {
        name: a.entity?.name ?? a.code,
        region: a.entity?.region ?? 'N/A',
        source: { name: a.entity?.source?.name ?? 'N/A' },
      },
    }))

    const validatedAlerts = alertsResponseSchema.parse(mapped)

    return NextResponse.json({
      alerts: validatedAlerts,
      total: totalAlerts,
      page,
      limit,
      totalPages: Math.ceil(totalAlerts / limit),
    })
  } catch (error) {
    console.error('Alerts API error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
