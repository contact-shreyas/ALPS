import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const bodySchema = z.object({ alertId: z.string(), outcome: z.enum(['true_positive', 'false_positive', 'mitigated']), note: z.string().optional() })
const responseSchema = z.object({ ok: z.literal(true) })

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}))
  const { alertId, outcome, note } = bodySchema.parse(json)

  await prisma.event.create({ data: { phase: 'LEARN' as any, message: `Feedback: ${outcome}`, meta: JSON.stringify({ alertId, note }) } })
  return NextResponse.json(responseSchema.parse({ ok: true }))
}

