import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'Export functionality is temporarily disabled in serverless deployment' },
    { status: 503 }
  );
}
