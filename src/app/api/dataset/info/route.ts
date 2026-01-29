import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get total districts count
    const totalDistricts = await prisma.district.count();

    // Get latest district metric
    const latestMetric = await prisma.districtDailyMetric.findFirst({
      orderBy: { date: 'desc' }
    });

    // Get count of districts with data on the latest date
    let districtsWithData = 0;
    if (latestMetric) {
      districtsWithData = await prisma.districtDailyMetric.count({
        where: {
          date: latestMetric.date
        }
      });
    }

    return NextResponse.json({
      product: 'VIIRS Black Marble — VNP46A2 (Monthly Nighttime Lights)',
      coverage: totalDistricts > 0 ? districtsWithData / totalDistricts : 0,
      totalDistricts,
      lastTileDate: latestMetric?.date?.toISOString() || null
    });

  } catch (error) {
    console.error('Error fetching dataset info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dataset info' },
      { status: 500 }
    );
  }
}