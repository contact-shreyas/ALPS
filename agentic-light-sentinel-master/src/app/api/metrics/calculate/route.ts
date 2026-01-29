import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total alerts and confirmed hotspots
    const totalAlerts = await prisma.alert.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    const confirmedHotspots = await prisma.alert.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        },
        confirmed: true
      }
    });

    // Calculate ingest to alert timings
    const alerts = await prisma.alert.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true,
        detectedAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const processingTimes = alerts
      .map(alert => alert.createdAt.getTime() - alert.detectedAt.getTime())
      .sort((a, b) => a - b);

    const p50Index = Math.floor(processingTimes.length * 0.5);
    const p95Index = Math.floor(processingTimes.length * 0.95);

    // Get district coverage
    const totalDistricts = await prisma.district.count();
    const districtsWithData = (await prisma.districtDailyMetric.groupBy({
      by: ['code'] as const,
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })).length;

    return NextResponse.json({
      metrics: {
        hotspotPrecision: confirmedHotspots / totalAlerts * 100,
        hotspotRecall: confirmedHotspots / (confirmedHotspots + await prisma.alert.count({
          where: {
            createdAt: {
              gte: thirtyDaysAgo
            },
            confirmed: false
          }
        })) * 100,
        ingestAlertP50: processingTimes[p50Index] / (60 * 1000), // Convert to minutes
        ingestAlertP95: processingTimes[p95Index] / (60 * 1000), // Convert to minutes
        districtCoverage: (districtsWithData / totalDistricts) * 100
      }
    });
  } catch (error) {
    console.error('Metrics calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate metrics' },
      { status: 500 }
    );
  }
}