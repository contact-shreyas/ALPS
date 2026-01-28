import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateHotspotMetrics, calculateCoverageMetrics } from '@/lib/metrics';
import { mockMetricsCurrent } from '../../_mocks/mockData'

export async function GET() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    if (process.env.USE_MOCK_API === '1') return NextResponse.json(mockMetricsCurrent())
    // Calculate hotspot metrics
    const totalAlerts = await prisma.alert.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    const confirmedHotspots = await prisma.alert.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        confirmed: true
      }
    });

    const missedHotspots = await prisma.alert.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        confirmed: false
      }
    });

    const { precision, recall } = calculateHotspotMetrics(
      confirmedHotspots,
      totalAlerts,
      missedHotspots
    );

    // Calculate processing times
    const alerts = await prisma.alert.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        createdAt: true,
        detectedAt: true
      }
    });

    const processingTimes = alerts.map(alert => {
      if (!alert.detectedAt) return null;
      return alert.detectedAt.getTime() - alert.createdAt.getTime();
    }).filter(Boolean) as number[];

    // Calculate percentiles
    const p50 = processingTimes.sort((a, b) => a - b)[Math.floor(processingTimes.length * 0.5)] || 0;
    const p95 = processingTimes.sort((a, b) => a - b)[Math.floor(processingTimes.length * 0.95)] || 0;

    // Calculate district coverage
    const totalDistricts = await prisma.district.count();
    
    // Count districts with recent data
    const districtsWithData = await prisma.district.count({
      where: {
        daily: {
          some: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }
      }
    });

    const coverage = calculateCoverageMetrics(districtsWithData, totalDistricts);

    // Get latest radiance statistics
    const stats = await prisma.districtDailyMetric.aggregate({
      _avg: {
        radiance: true
      },
      _max: {
        radiance: true
      },
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    return NextResponse.json({
      precision,
      recall,
      ingestAlertP50: p50 / (60 * 1000), // Convert to minutes
      ingestAlertP95: p95 / (60 * 1000), // Convert to minutes
      coverage,
      avgRadiance: stats._avg.radiance || 0,
      maxRadiance: stats._max.radiance || 0,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('Error fetching current metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}