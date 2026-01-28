import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { region, timeRange, type } = body;
    const [startDate, endDate] = timeRange;

    // Fetch historical data for the region
    const historicalData = await prisma.districtDailyMetric.findMany({
      where: {
        district: {
          code: region
        },
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      select: {
        radiance: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Calculate trend (percentage change over time)
    const trend = historicalData.length > 1
      ? ((historicalData[historicalData.length - 1].radiance - historicalData[0].radiance) 
         / historicalData[0].radiance * 100)
      : 0;

    // Calculate year-over-year change
    const now = new Date();
    const lastYearData = await prisma.districtDailyMetric.findFirst({
      where: {
        district: {
          code: region
        },
        createdAt: {
          gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
          lte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() + 1)
        }
      }
    });

    const currentData = await prisma.districtDailyMetric.findFirst({
      where: {
        district: {
          code: region
        },
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const percentChange = lastYearData && currentData
      ? ((currentData.radiance - lastYearData.radiance) / lastYearData.radiance * 100)
      : 0;

    // Count active hotspots
    const hotspotsCount = await prisma.districtDailyMetric.count({
      where: {
        district: {
          code: region
        },
        radiance: {
          gt: 20 // threshold for hotspots
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    // Calculate coverage (percentage of area with data)
    const coverage = 95; // Placeholder - implement actual coverage calculation

    return NextResponse.json({
      trend: parseFloat(trend.toFixed(2)),
      percentChange: parseFloat(percentChange.toFixed(2)),
      hotspots: hotspotsCount,
      coverage,
      historicalData: historicalData.map(d => ({
        timestamp: d.createdAt,
        radiance: d.radiance
      }))
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform analysis' },
      { status: 500 }
    );
  }
}