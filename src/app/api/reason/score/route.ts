import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const responseSchema = z.object({ ok: z.literal(true), alertsRaised: z.number() })

export const dynamic = 'force-dynamic';

export async function POST() {
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const series = await prisma.metric.findMany({
    where: { date: { gte: since } },
    select: { entityId: true, date: true, valueNumeric: true, entity: { select: { code: true } } },
    orderBy: { date: 'asc' },
  })

  // Group by entity
  const byEntity = new Map<string, { code: string; values: number[] }>()
  for (const m of series) {
    const e = byEntity.get(m.entityId) ?? { code: m.entity.code, values: [] }
    e.values.push(m.valueNumeric)
    byEntity.set(m.entityId, e)
  }

  let alertsRaised = 0
  const ops: any[] = []
  for (const [entityId, { code, values }] of byEntity.entries()) {
    if (values.length < 5) continue
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const std = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length)
    const last = values[values.length - 1]
    const zscore = std ? (last - mean) / std : 0
    let sev = 0
    if (zscore >= 2) sev = 3
    else if (zscore >= 1.5) sev = 2
    else if (zscore >= 1.2) sev = 1
    if (sev > 0) {
      alertsRaised++
      ops.push(
        prisma.alert.create({
          data: {
            code,
            level: 'INSIGHT',
            message: zscore >= 2 ? 'Critical anomaly' : zscore >= 1.5 ? 'Anomaly detected' : 'Mild anomaly',
            severity: sev,
            entityId,
          },
        }),
      )
    }
  }

  if (ops.length) await prisma.$transaction(ops)

  await prisma.event.create({ data: { phase: 'REASON' as any, message: 'Anomaly detection completed', meta: JSON.stringify({ alertsRaised }) } })

  const payload = responseSchema.parse({ ok: true, alertsRaised })
  return NextResponse.json(payload)
}

