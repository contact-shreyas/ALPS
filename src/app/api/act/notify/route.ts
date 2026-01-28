import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const bodySchema = z.object({ to: z.string().email().default('demo@local'), alertId: z.string().optional() })
const responseSchema = z.object({ ok: z.literal(true), queued: z.boolean() })

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}))
  const { to, alertId } = bodySchema.parse(json)

  await prisma.event.create({
    data: {
      phase: 'ACT' as any,
      message: `email queued to ${to}`,
      meta: { alertId, to },
    },
  })

  return NextResponse.json(responseSchema.parse({ ok: true, queued: true }))
}

