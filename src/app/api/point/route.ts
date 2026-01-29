import { NextRequest, NextResponse } from "next/server";

// Mock value so you can demo click popups now
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat") ?? 0);
  const lng = Number(req.nextUrl.searchParams.get("lng") ?? 0);
  const value = Math.abs(Math.sin(lat) * Math.cos(lng)) * 60; // 0..60
  return NextResponse.json({ value: Number(value.toFixed(3)) });
}
