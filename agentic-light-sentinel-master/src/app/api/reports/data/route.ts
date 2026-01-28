import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface ReportParams {
  startDate?: string;
  endDate?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get time series data
    const timeSeriesData = await prisma.lightPollutionData.groupBy({
      by: ['timestamp'],
      _avg: {
        brightness: true
      },
      where: {
        timestamp: {
          gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lte: endDate ? new Date(endDate) : new Date()
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    // Get regional data
    const regionalData = await prisma.lightPollutionData.groupBy({
      by: ['region'],
      _avg: {
        brightness: true
      },
      where: {
        timestamp: {
          gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lte: endDate ? new Date(endDate) : new Date()
        }
      },
      orderBy: {
        region: 'asc'
      }
    });

    // Format data for charts
    const formattedData = {
      timeSeriesData: {
        labels: timeSeriesData.map(d => new Date(d.timestamp).toLocaleDateString()),
        datasets: [{
          label: 'Average Light Pollution',
          data: timeSeriesData.map(d => d._avg.brightness || 0),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }]
      },
      regionalData: {
        labels: regionalData.map(d => d.region),
        datasets: [{
          label: 'Light Pollution by Region',
          data: regionalData.map(d => d._avg.brightness || 0),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
        }]
      }
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error generating report:', error);
    return new NextResponse('Error generating report', { status: 500 });
  }
}