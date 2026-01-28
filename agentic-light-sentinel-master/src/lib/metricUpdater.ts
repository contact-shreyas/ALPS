import { PrismaClient } from '@prisma/client';
import { 
  calculateHotspotMetrics,
  calculateProcessingTimes,
  calculatePercentile,
  calculateCoverageMetrics
} from '@/lib/metrics';

const prisma = new PrismaClient();

export async function updateMetrics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
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

    const processingTimes = calculateProcessingTimes(alerts);
    const p50 = calculatePercentile(processingTimes, 50);
    const p95 = calculatePercentile(processingTimes, 95);

    // Calculate district coverage
    const totalDistricts = await prisma.district.count();
    const districtsWithData = await prisma.districtDailyMetric.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      distinct: ['districtId']
    });

    const coverage = calculateCoverageMetrics(districtsWithData, totalDistricts);

    // Save metrics to history
    await prisma.$transaction([
      prisma.metricHistory.create({
        data: {
          type: 'HOTSPOT',
          value: precision
        }
      }),
      prisma.metricHistory.create({
        data: {
          type: 'COVERAGE',
          value: coverage
        }
      }),
      prisma.metricHistory.create({
        data: {
          type: 'PROCESSING_TIME',
          value: p50
        }
      })
    ]);

    return {
      hotspotPrecision: precision,
      hotspotRecall: recall,
      ingestAlertP50: p50 / (60 * 1000), // Convert to minutes
      ingestAlertP95: p95 / (60 * 1000), // Convert to minutes
      districtCoverage: coverage
    };
  } catch (error) {
    console.error('Error updating metrics:', error);
    throw error;
  }
}