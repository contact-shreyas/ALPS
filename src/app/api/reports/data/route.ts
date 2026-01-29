import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface ReportParams {
  startDate?: string;
  endDate?: string;
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where = {
      detectedAt: {
        gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lte: endDate ? new Date(endDate) : new Date()
      }
    };

    // Get alerts over time
    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { detectedAt: 'asc' },
      select: { detectedAt: true, level: true, severity: true }
    });

    // Get entities by region
    const entitiesByRegion = await prisma.entity.findMany({
      select: { region: true },
      distinct: ['region']
    });

    // Format data for charts
    const timeSeriesData = {
      labels: [...new Set(alerts.map(a => new Date(a.detectedAt).toLocaleDateString()))],
      datasets: [{
        label: 'Alerts Detected',
        data: [...new Set(alerts.map(a => new Date(a.detectedAt).toLocaleDateString()))].map(date =>
          alerts.filter(a => new Date(a.detectedAt).toLocaleDateString() === date).length
        ),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }]
    };

    const regionalData = {
      labels: entitiesByRegion.map(e => e.region),
      datasets: [{
        label: 'Regions Monitored',
        data: entitiesByRegion.map(e => 1),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      }]
    };

    const formattedData = {
      timeSeriesData,
      regionalData
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error generating report:', error);
    return new NextResponse('Error generating report', { status: 500 });
  }
}