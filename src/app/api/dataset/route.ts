import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    product: "VIIRS Black Marble — VNP46A2 (Monthly Nighttime Lights); tiles from local COG",
    cadence: "Check daily; ingest when a newer monthly mosaic is available",
    tileserver: process.env.NEXT_PUBLIC_TITILER || "http://localhost:8080",
    lastTileISO: "2024-08-01",
    coveragePct: 99.2,
  });
}

