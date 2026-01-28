import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateMockEvents } from '@/lib/mock-health-data';

export async function GET() {
  try {
    // Get the last 20 events from the last 24 hours
    const realEvents = await prisma.agentLog.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    });

    // Generate some mock health-specific events
    const mockEvents = generateMockEvents(10);

    // Format agent logs as timeline events
    const formattedRealEvents = realEvents.map(event => ({
      id: event.id,
      type: event.status === 'ERROR' ? 'error' : 
            event.status === 'WARNING' ? 'warning' : 'info',
      message: `${event.component.toUpperCase()}: ${event.error || 'Operation completed successfully'}`,
      timestamp: event.timestamp.toISOString(),
      details: {
        component: event.component,
        status: event.status
      }
    }));

    // Combine and sort all events by timestamp
    const allEvents = [...formattedRealEvents, ...mockEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(allEvents);

    return NextResponse.json(allEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}