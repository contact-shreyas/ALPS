import { describe, it, expect } from 'vitest'
import { buildSeedData } from '@/../prisma/seed-insights'

describe('deterministic insights seed', () => {
  it('produces fixed counts', () => {
    const d = buildSeedData(42)
    expect(d.sources.length).toBe(5)
    expect(d.entities.length).toBe(12 * 50)
    expect(d.metrics.length).toBe(d.entities.length * 30)
    expect(d.alerts.length).toBe(30)
    expect(d.events.length).toBe(100)
  })
})

