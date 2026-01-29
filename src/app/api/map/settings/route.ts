import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get latest available data
    const latestData = await prisma.districtDailyMetric.findFirst({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        createdAt: true
      }
    });

    // Get total number of districts with data
    const districtsWithData = await prisma.district.count();

    // Get global statistics
    const stats = await prisma.districtDailyMetric.aggregate({
      _avg: {
        radiance: true
      },
      _max: {
        radiance: true
      },
      _min: {
        radiance: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    return NextResponse.json({
      lastUpdate: latestData?.createdAt,
      coverage: districtsWithData,
      averageRadiance: stats._avg.radiance,
      maxRadiance: stats._max.radiance,
      minRadiance: stats._min.radiance,
      dataRange: {
        min: 0,
        max: stats._max.radiance || 100
      }
    });
  } catch (error) {
    console.error('Map settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch map settings' },
      { status: 500 }
    );
  }
}