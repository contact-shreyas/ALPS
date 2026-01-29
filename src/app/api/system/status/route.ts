import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Get latest process logs
    const [ingestLog, processLog, alertLog] = await Promise.all([
      prisma.processLog.findFirst({
        where: {
          type: 'INGEST',
          createdAt: { gte: fiveMinutesAgo }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.processLog.findFirst({
        where: {
          type: 'PROCESSING',
          createdAt: { gte: fiveMinutesAgo }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.processLog.findFirst({
        where: {
          type: 'ALERTS',
          createdAt: { gte: fiveMinutesAgo }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    // Get queue size (number of unprocessed records)
    const queueSize = await prisma.ingestedData.count({
      where: {
        processedAt: null
      }
    });

    // Get system settings
    const settings = await prisma.systemSettings.findFirst();

    return NextResponse.json({
      ingestRunning: ingestLog ? ingestLog.status === 'RUNNING' : false,
      processingRunning: processLog ? processLog.status === 'RUNNING' : false,
      alertsEnabled: settings?.alertsEnabled ?? false,
      lastIngestTime: ingestLog?.createdAt?.toISOString(),
      lastProcessTime: processLog?.createdAt?.toISOString(),
      lastAlertTime: alertLog?.createdAt?.toISOString(),
      queueSize
    });

  } catch (error) {
    console.error('Error fetching system status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system status' },
      { status: 500 }
    );
  }
}