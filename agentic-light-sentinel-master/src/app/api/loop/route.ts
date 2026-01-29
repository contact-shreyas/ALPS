import { NextResponse } from "next/server";
import { loopState } from "@/lib/loop-state";

export function GET() {
  return NextResponse.json(loopState.get());
}
