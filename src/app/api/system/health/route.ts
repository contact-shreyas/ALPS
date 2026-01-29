import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateMockHealthData } from '@/lib/mock-health-data';

let lastHealthData = generateMockHealthData();

export async function GET() {
  try {
    const processes = await prisma.processLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Generate new health metrics
    lastHealthData = generateMockHealthData(lastHealthData);

    // Calculate real metrics from process logs if available
    if (processes.length > 0) {
      const successfulProcesses = processes.filter(p => p.status === 'SUCCESS');

      // Update some metrics with real data
      lastHealthData.detectionPrecision.value = (successfulProcesses.length / processes.length) * 100;
      // responseTime would require duration field - using mock data for now
    }

    // Group processes by type (maintain existing functionality)
    const ingestHealth = processes.filter(p => p.type === 'INGEST');
    const processingHealth = processes.filter(p => p.type === 'PROCESSING');
    const alertHealth = processes.filter(p => p.type === 'ALERTS');

    return NextResponse.json({
      ...lastHealthData,
      ingestHealth,
      processingHealth,
      alertHealth,
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system health' },
      { status: 500 }
    );
  }
}