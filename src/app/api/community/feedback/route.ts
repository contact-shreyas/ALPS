import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const feedbackSchema = z.object({
  type: z.enum(['report', 'suggestion', 'story']),
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  impact: z.string(),
  contact: z.string().optional()
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = feedbackSchema.parse(json);

    // Store feedback in database
    await prisma.feedback.create({
      data: {
        code: `COMM-${data.type.toUpperCase()}`,
        note: `${data.title}: ${data.description} (${data.location})`,
        rating: 0
      }
    });

    // If it's a report, create an alert for review
    if (data.type === 'report') {
      await prisma.alert.create({
        data: {
          level: 'community',
          code: 'COMM-REPORT',
          message: `Community Report: ${data.title} - ${data.description}`,
          severity: 5
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving community feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 400 }
    );
  }
}