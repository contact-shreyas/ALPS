import prisma from '@/lib/prisma'

type RNG = () => number

function mulberry32(seed: number): RNG {
  let t = seed >>> 0
  return function () {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const SOURCES = [
  { name: 'OpenFoodFacts', kind: 'FOOD_DATA' },
  { name: 'USDA Recalls', kind: 'SAFETY' },
  { name: 'Crowd Reviews', kind: 'USER_FEEDBACK' },
  { name: 'City Health', kind: 'INSPECTIONS' },
  { name: 'News Feeds', kind: 'NEWS' },
] as const

const REGIONS = [
  'North',
  'South',
  'East',
  'West',
  'Central',
  'Northeast',
  'Northwest',
  'Southeast',
  'Southwest',
  'Mountain',
  'Coastal',
  'Valley',
] as const

function randRange(rng: RNG, min: number, max: number) {
  return min + (max - min) * rng()
}

function pick<T>(rng: RNG, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

export function buildSeedData(seed = Number(process.env.INSIGHTS_SEED ?? 42)) {
  const rng = mulberry32(seed)

  const sources = SOURCES.map((s, i) => ({
    id: `src_${i}`,
    name: s.name,
    kind: s.kind,
    coveragePct: Math.round(randRange(rng, 63, 92) * 10) / 10,
    lastUpdatedAt: new Date(Date.now() - Math.floor(randRange(rng, 1, 48)) * 3600_000),
  }))

  const entities: Array<{
    id: string
    code: string
    name: string
    region: string
    sourceId: string
    tags: Record<string, unknown>
  }> = []

  let eid = 0
  for (const region of REGIONS) {
    for (let i = 0; i < 50; i++) {
      const src = pick(rng, sources)
      const code = `${region}-${(100000 + Math.floor(rng() * 900000)).toString(36)}`
      entities.push({
        id: `ent_${eid++}`,
        code,
        name: `${region} ${Math.floor(randRange(rng, 1, 999))}`,
        region,
        sourceId: src.id,
        tags: { category: pick(rng, ['A', 'B', 'C'] as const), risk: Math.round(randRange(rng, 0, 1) * 1000) / 1000 },
      })
    }
  }

  const metrics: Array<{ entityId: string; date: Date; valueNumeric: number }> = []
  const start = new Date()
  start.setDate(start.getDate() - 30)
  for (const ent of entities) {
    let val = randRange(rng, 10, 100)
    for (let d = 0; d < 30; d++) {
      val += randRange(rng, -0.5, 0.5)
      if (rng() > 0.96) val += randRange(rng, 1, 3) // occasional spikes
      val = Math.max(0, val)
      const date = new Date(start)
      date.setDate(start.getDate() + d)
      metrics.push({ entityId: ent.id, date, valueNumeric: Math.round(val * 100) / 100 })
    }
  }

  const alertsCount = 30
  const eventsCount = 100

  const alerts = Array.from({ length: alertsCount }, (_, i) => {
    const ent = pick(rng, entities)
    const sevNum = [1, 2, 3][Math.floor(rng() * 3)] // 1 low, 2 med, 3 high
    const title = pick(rng, ['Anomaly Detected', 'Threshold Exceeded', 'Pattern Change', 'Unusual Activity', 'Critical Update'])
    const createdAt = new Date(Date.now() - Math.floor(randRange(rng, 0, 7 * 24)) * 3600_000)
    const ack: Date | null = rng() > 0.7 ? new Date(Date.now() - Math.floor(randRange(rng, 0, 24)) * 3600_000) : null
    return {
      id: `al_${i}`,
      entityId: ent.id,
      code: ent.code,
      level: 'INSIGHT',
      message: title,
      severity: sevNum,
      createdAt,
      acknowledgedAt: ack,
      details: `${title} on ${ent.name} in ${ent.region}`,
    }
  })

  const phases = ['SENSE', 'REASON', 'ACT', 'LEARN'] as const
  const events = Array.from({ length: eventsCount }, (_, i) => {
    const phase = pick(rng, phases)
    const at = new Date(Date.now() - Math.floor(randRange(rng, 0, 72)) * 3600_000)
    const messageBy: Record<typeof phases[number], string[]> = {
      SENSE: ['New data ingested from source', 'Scheduled data collection complete', 'Real-time stream processed'],
      REASON: ['Anomaly detection completed', 'Pattern analysis finished', 'Risk assessment updated'],
      ACT: ['Notification sent to stakeholders', 'Automated response triggered', 'Alert dispatched to team'],
      LEARN: ['Model retrained with new data', 'Feedback incorporated', 'System parameters updated'],
    }
    const message = pick(rng, messageBy[phase])
    return {
      id: `ev_${i}`,
      phase,
      message,
      at,
      meta: { duration: Math.floor(randRange(rng, 100, 2000)), status: pick(rng, ['success', 'warning', 'error'] as const), count: Math.floor(randRange(rng, 1, 1000)) },
    }
  })

  return { sources, entities, metrics, alerts, events }
}

async function seed() {
  const { sources, entities, metrics, alerts, events } = buildSeedData()

  // Clear existing insights-related data (do not touch map/state tables)
  await prisma.event.deleteMany().catch(() => {})
  await prisma.alert.deleteMany().catch(() => {})
  await prisma.metric.deleteMany().catch(() => {})
  await prisma.entity.deleteMany().catch(() => {})
  await prisma.source.deleteMany().catch(() => {})

  const sourceIdMap = new Map<string, string>()
  for (const s of sources) {
    const row = await prisma.source.create({ data: { name: s.name, kind: s.kind, coveragePct: s.coveragePct, lastUpdatedAt: s.lastUpdatedAt } })
    sourceIdMap.set(s.id, row.id)
  }

  const entityIdMap = new Map<string, string>()
  for (const e of entities) {
    const row = await prisma.entity.create({
      data: {
        code: e.code,
        name: e.name,
        region: e.region,
        sourceId: sourceIdMap.get(e.sourceId)!,
        tags: e.tags,
      },
    })
    entityIdMap.set(e.id, row.id)
  }

  // Metrics
  for (const m of metrics) {
    await prisma.metric.create({ data: { entityId: entityIdMap.get(m.entityId)!, date: m.date, valueNumeric: m.valueNumeric } })
  }

  // Alerts (map to existing Alert model shape)
  for (const a of alerts) {
    await prisma.alert.create({
      data: {
        code: a.code,
        level: 'INSIGHT',
        message: a.message,
        severity: a.severity,
        createdAt: a.createdAt,
        entityId: entityIdMap.get(a.entityId)!,
      } as any,
    })
  }

  // Events
  for (const ev of events) {
    await prisma.event.create({ data: { phase: ev.phase as any, message: ev.message, at: ev.at, meta: ev.meta } })
  }
}

seed()
  .then(() => console.log('Insights seed complete'))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

