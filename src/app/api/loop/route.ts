import { NextResponse } from "next/server";
import { loopState } from "@/lib/loop-state";

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(loopState.get());
}
