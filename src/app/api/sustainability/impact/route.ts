import { NextResponse } from 'next/server';
import { SustainabilityImpact } from '@/lib/sustainability';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');

    if (!region) {
      return NextResponse.json(
        { error: 'Region parameter is required' },
        { status: 400 }
      );
    }

    const report = await SustainabilityImpact.generateReport(region);
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating sustainability report:', error);
    return NextResponse.json(
      { error: 'Failed to generate sustainability report' },
      { status: 500 }
    );
  }
}