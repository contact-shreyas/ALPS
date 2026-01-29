import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const responseSchema = z.object({ ok: z.literal(true), ingested: z.number() })

export const dynamic = 'force-dynamic';

export async function POST() {
  // Simulate Sense: create an Event and nudge coverage
  const sources = await prisma.source.findMany()
  const now = new Date()

  await prisma.$transaction([
    prisma.event.create({
      data: {
        phase: 'SENSE' as any,
        message: 'Scheduled data collection complete',
        at: now,
        meta: JSON.stringify({ duration: 250 + Math.floor(Math.random() * 200), count: sources.length }),
      },
    }),
    ...sources.map((s) =>
      prisma.source.update({
        where: { id: s.id },
        data: { coveragePct: Math.min(100, Number((s.coveragePct + 0.2).toFixed(1))), lastUpdatedAt: now },
      }),
    ),
  ])

  const payload = responseSchema.parse({ ok: true, ingested: sources.length })
  return NextResponse.json(payload)
}

