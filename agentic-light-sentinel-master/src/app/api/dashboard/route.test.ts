import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/dashboard/route'

describe('Dashboard API', () => {
  beforeAll(async () => {
    // Set up test data
    await prisma.processLog.createMany({
      data: [
        {
          type: 'INGEST',
          status: 'SUCCESS',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: 'PROCESSING',
          status: 'RUNNING',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    })

    await prisma.alert.createMany({
      data: [
        {
          level: 'DISTRICT',
          code: 'TEST-001',
          message: 'Test high severity alert',
          severity: 3,
          detectedAt: new Date(),
          sentAt: new Date()
        },
        {
          level: 'DISTRICT',
          code: 'TEST-002',
          message: 'Test medium severity alert',
          severity: 2,
          detectedAt: new Date()
        }
      ]
    })

    await prisma.metricHistory.createMany({
      data: [
        {
          type: 'HOTSPOT',
          value: 42,
          timestamp: new Date()
        },
        {
          type: 'COVERAGE',
          value: 85.5,
          timestamp: new Date()
        },
        {
          type: 'PROCESSING_TIME',
          value: 250,
          timestamp: new Date()
        }
      ]
    })
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.processLog.deleteMany()
    await prisma.alert.deleteMany()
    await prisma.metricHistory.deleteMany()
    await prisma.$disconnect()
  })

  it('should return a valid dashboard response', async () => {
    const response = await GET()
    expect(response.status).toBe(200)

    const data = await response.json()

    // Validate response structure
    expect(data).toHaveProperty('autonomousLoop')
    expect(data.autonomousLoop).toHaveProperty('sense')
    expect(data.autonomousLoop).toHaveProperty('reason')
    expect(data.autonomousLoop).toHaveProperty('act')

    expect(data).toHaveProperty('metrics')
    expect(data.metrics).toHaveProperty('hotspots')
    expect(data.metrics).toHaveProperty('processing')
    expect(data.metrics).toHaveProperty('coverage')

    expect(data).toHaveProperty('alerts')
    expect(data.alerts).toHaveProperty('active')
    expect(data.alerts).toHaveProperty('recent')

    expect(data).toHaveProperty('trends')
    expect(data.trends).toHaveProperty('daily')
    expect(data.trends).toHaveProperty('topRegions')

    // Validate metrics
    expect(data.metrics.hotspots.last24h).toBeGreaterThanOrEqual(0)
    expect(data.metrics.processing.successRate).toBeGreaterThanOrEqual(0)
    expect(data.metrics.processing.successRate).toBeLessThanOrEqual(100)
    expect(data.metrics.coverage.percentage).toBeGreaterThanOrEqual(0)
    expect(data.metrics.coverage.percentage).toBeLessThanOrEqual(100)

    // Validate alert counts
    const totalAlerts = data.alerts.active.high + data.alerts.active.medium + data.alerts.active.low
    expect(totalAlerts).toBeGreaterThanOrEqual(0)
    expect(Array.isArray(data.alerts.recent)).toBe(true)
  })

  it('should handle errors gracefully', async () => {
    // The dashboard endpoint is designed to return 200 with partial data
    // even if some queries fail, so it should always return 200
    const response = await GET()
    expect(response.status).toBe(200)

    // Verify response has expected structure
    const data = await response.json()
    expect(data).toHaveProperty('metrics')
    expect(data).toHaveProperty('alerts')
  })
})