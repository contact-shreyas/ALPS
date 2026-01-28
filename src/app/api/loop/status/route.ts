import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface LoopStatus {
  ingestRunning: boolean;
  lastIngest: Date | null;
  anomalyDetectionRunning: boolean;
  lastAnomaly: Date | null;
  notificationRunning: boolean;
  lastNotification: Date | null;
}

export async function GET() {
  try {
    // Get latest status entries
    const [
      lastIngest,
      lastAnomaly,
      lastNotification
    ] = await Promise.all([
      prisma.processLog.findFirst({
        where: { type: 'INGEST' },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.processLog.findFirst({
        where: { type: 'ANOMALY' },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.processLog.findFirst({
        where: { type: 'NOTIFICATION' },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Check if any process is currently running (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const [
      ingestRunning,
      anomalyRunning,
      notificationRunning
    ] = await Promise.all([
      prisma.processLog.findFirst({
        where: {
          type: 'INGEST',
          status: 'RUNNING',
          createdAt: { gte: fiveMinutesAgo }
        }
      }),
      prisma.processLog.findFirst({
        where: {
          type: 'ANOMALY',
          status: 'RUNNING',
          createdAt: { gte: fiveMinutesAgo }
        }
      }),
      prisma.processLog.findFirst({
        where: {
          type: 'NOTIFICATION',
          status: 'RUNNING',
          createdAt: { gte: fiveMinutesAgo }
        }
      })
    ]);

    const status: LoopStatus = {
      ingestRunning: !!ingestRunning,
      lastIngest: lastIngest?.createdAt || null,
      anomalyDetectionRunning: !!anomalyRunning,
      lastAnomaly: lastAnomaly?.createdAt || null,
      notificationRunning: !!notificationRunning,
      lastNotification: lastNotification?.createdAt || null
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching loop status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loop status' },
      { status: 500 }
    );
  }
}