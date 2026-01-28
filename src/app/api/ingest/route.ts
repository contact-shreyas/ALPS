import { NextResponse } from "next/server";
import { loopState } from "../loop/route";

export async function POST() {
  loopState.incQueue();
  // SENSE: fetch new VIIRS tile (stub)
  loopState.setSense(new Date().toISOString());

  // REASON: run hotspot detection (stub)
  loopState.setReason(new Date().toISOString());

  loopState.decQueue();
  return NextResponse.json({ ok: true });
}
