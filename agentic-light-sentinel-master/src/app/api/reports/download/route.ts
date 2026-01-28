import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stateCode = searchParams.get('state');
  const type = searchParams.get('type') as 'summary' | 'detailed';

  if (!stateCode) {
    return NextResponse.json({ error: 'State code is required' }, { status: 400 });
  }

  try {
    // Get state data
    const state = await prisma.state.findUnique({
      where: { code: stateCode },
      include: {
        districts: {
          include: {
            dailyMetrics: {
              orderBy: { date: 'desc' },
              take: 30,
            },
          },
        },
      },
    });

    if (!state) {
      return NextResponse.json({ error: 'State not found' }, { status: 404 });
    }

    // Generate report data
    const reportData = {
      state: state.name,
      date: new Date().toISOString(),
      type,
      metrics: {
        totalHotspots: state.districts.reduce((sum, d) => 
          sum + (d.dailyMetrics[0]?.hotspots || 0), 0),
        avgRadiance: state.districts.reduce((sum, d) => 
          sum + (d.dailyMetrics[0]?.radiance || 0), 0) / state.districts.length,
        districtsWithAlerts: state.districts.filter(d => 
          d.dailyMetrics[0]?.hotspots > 0).length,
      },
      districts: type === 'detailed' ? state.districts.map(d => ({
        name: d.name,
        currentRadiance: d.dailyMetrics[0]?.radiance || 0,
        hotspots: d.dailyMetrics[0]?.hotspots || 0,
        trend: d.dailyMetrics.slice(0, 7).map(m => m.radiance),
      })) : undefined,
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}