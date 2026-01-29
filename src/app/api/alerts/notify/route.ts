import { NextResponse } from 'next/server';
import { sendAlertEmail } from '@/lib/mail';
import { z } from 'zod';

const alertRequestSchema = z.object({
  district: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  radiance: z.number(),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  plan: z.string().optional()
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = alertRequestSchema.parse(body);

    await sendAlertEmail({
      ...validatedData,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: 'Alert email sent successfully'
    });
  } catch (error) {
    console.error('Failed to send alert email:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 400 }
    );
  }
}