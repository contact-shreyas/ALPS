import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get latest date with data
    const latest = await prisma.districtDailyMetric.findFirst({ 
      orderBy: { date: "desc" }, 
      select: { date: true } 
    });
    const latestDate = latest?.date ?? yesterday;

    // Get top affected states by aggregating district metrics
    const districtMetrics = await prisma.districtDailyMetric.findMany({
      where: {
        date: latestDate
      },
      select: {
        hotspots: true,
        radiance: true,
        district: {
          select: {
            stateCode: true,
            state: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    const stateMetrics = new Map<string, { name: string; hotspots: number; radiance: number }>();
    districtMetrics.forEach(metric => {
      const stateCode = metric.district.stateCode;
      const stateName = metric.district.state.name;
      const current = stateMetrics.get(stateCode) || { name: stateName, hotspots: 0, radiance: 0 };
      current.hotspots += metric.hotspots;
      current.radiance += metric.radiance;
      stateMetrics.set(stateCode, current);
    });

    const topStates = Array.from(stateMetrics.entries())
      .map(([stateCode, metrics]) => ({
        stateCode,
        name: metrics.name,
        hotspots: metrics.hotspots,
        radiance: metrics.radiance
      }))
      .sort((a, b) => b.hotspots - a.hotspots)
      .slice(0, 5);

    // Get districts with highest hotspots
    const topDistricts = await prisma.districtDailyMetric.findMany({
      where: {
        date: latestDate
      },
      select: {
        code: true,
        hotspots: true,
        radiance: true,
        district: {
          select: {
            name: true,
            stateCode: true
          }
        }
      },
      orderBy: {
        hotspots: 'desc'
      },
      take: 5
    });

    // Get national trend
    const nationalTrend = await prisma.districtDailyMetric.groupBy({
      by: ['date'],
      _sum: {
        hotspots: true,
        radiance: true
      },
      where: {
        date: { 
          gte: new Date(latestDate.getTime() - 29 * 24 * 60 * 60 * 1000),
          lte: latestDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get current alerts
    const alerts = await prisma.alert.findMany({
      where: {
        createdAt: { gte: yesterday }
      },
      select: {
        id: true,
        code: true,
        level: true,
        message: true,
        severity: true,
        createdAt: true
      },
      orderBy: {
        severity: 'desc'
      },
      take: 10
    });

    // Calculate coverage
    const totalDistricts = await prisma.district.count();
    const districtsWithData = await prisma.district.count({
      where: {
        daily: {
          some: {
            date: latestDate
          }
        }
      }
    });

    return NextResponse.json({
      topStates: topStates.map(state => ({
        id: state.stateCode,
        name: state.name,
        hotspots: state.hotspots,
        radiance: Math.round(state.radiance * 100) / 100
      })),
      topDistricts: topDistricts.map(d => ({
        id: d.code,
        name: d.district.name,
        stateCode: d.district.stateCode,
        hotspots: d.hotspots,
        radiance: Math.round(d.radiance * 100) / 100
      })),
      nationalTrend: nationalTrend.map(day => ({
        date: day.date.toISOString(),
        hotspots: day._sum.hotspots || 0,
        radiance: Math.round((day._sum.radiance || 0) * 100) / 100
      })),
      summary: {
        totalHotspots: topStates.reduce((sum, s) => sum + s.hotspots, 0),
        activeAlerts: alerts.length,
        avgRadiance: Math.round(
          (nationalTrend.reduce((sum, day) => sum + (day._sum.radiance || 0), 0) / nationalTrend.length) * 100
        ) / 100,
        coverage: {
          districts: districtsWithData,
          percentage: Math.round((districtsWithData / totalDistricts) * 100)
        }
      },
      alerts
    });

  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

