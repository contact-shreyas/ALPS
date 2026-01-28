import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import prisma from '@/lib/prisma'
import { GET as overviewGET } from '@/app/api/overview/route'
import { GET as trendsGET } from '@/app/api/trends/route'

describe('Insights API', () => {
  const spies: any[] = []
  beforeEach(() => {
    spies.push(
      vi.spyOn(prisma.source, 'findMany').mockResolvedValue([
        { id: 's1', name: 'A', kind: 'K', coveragePct: 80, lastUpdatedAt: new Date(), createdAt: new Date(), updatedAt: new Date() } as any,
      ]),
      vi.spyOn(prisma.alert, 'findMany').mockResolvedValue([{ severity: 3 }, { severity: 2 }, { severity: 1 }] as any),
      vi.spyOn(prisma.event, 'findMany').mockResolvedValue([{ meta: { duration: 100 }, phase: 'ACT' } as any]),
    )
  })
  afterEach(() => spies.splice(0).forEach((s) => s.mockRestore()))

  it('overview validates response', async () => {
    const res = await overviewGET()
    const data = await (res as any).json()
    expect(data.sources.length).toBe(1)
    expect(data.alerts.total).toBeGreaterThanOrEqual(0)
  })

  it('trends rejects bad range', async () => {
    const req = new Request('http://localhost/api/trends?range=abc')
    const res = await trendsGET(req as any)
    expect((res as any).status).toBe(400)
  })
})

