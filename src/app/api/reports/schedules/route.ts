import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for report schedule
const scheduleSchema = z.object({
  email: z.string().email().optional(),
  frequency: z.enum(['daily', 'weekly', 'custom']),
  days: z.array(z.string()).optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
});

// List all dashboard report schedules
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const schedules = await prisma.reportSchedule.findMany({
      where: { type: 'dashboard', enabled: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Failed to fetch schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

// Create new dashboard report schedule
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = scheduleSchema.parse(body);

    const schedule = await prisma.reportSchedule.create({
      data: {
        type: 'dashboard',
        email: validated.email,
        frequency: validated.frequency,
        days: validated.days ? JSON.stringify(validated.days) : null,
        time: validated.time,
        enabled: true
      }
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Failed to create schedule:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create schedule' },
      { status: 400 }
    );
  }
}

// Update an existing schedule
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new Error('Schedule ID is required');

    const body = await request.json();
    const validated = scheduleSchema.parse(body);

    const schedule = await prisma.reportSchedule.update({
      where: { id },
      data: {
        email: validated.email,
        frequency: validated.frequency,
        days: validated.days ? JSON.stringify(validated.days) : null,
        time: validated.time
      }
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Failed to update schedule:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update schedule' },
      { status: 400 }
    );
  }
}

// Delete a schedule
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new Error('Schedule ID is required');

    await prisma.reportSchedule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete schedule' },
      { status: 400 }
    );
  }
}