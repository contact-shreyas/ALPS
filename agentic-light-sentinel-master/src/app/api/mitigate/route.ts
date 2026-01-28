import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { shieldingPct = 0, retrofitPct = 0 } = body as { shieldingPct?: number; retrofitPct?: number };
  // Very simple model: each 10% shielding -> 4% drop; each 10% retrofit -> 3% drop; cap 70%
  const dropPct = Math.min(0.7, (shieldingPct / 10) * 0.04 + (retrofitPct / 10) * 0.03);
  // Assume baseline 30 nW/cm^2/sr to show a number
  const predictedDrop_nW = 30 * dropPct;
  return NextResponse.json({ predictedDrop_nW });
}

