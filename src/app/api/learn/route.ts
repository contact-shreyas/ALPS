import { NextRequest, NextResponse } from "next/server";
import { loopState } from "../loop/route";
import { prisma } from "@/lib/prisma";

let threshold_nW = 8; // example global threshold (demo)

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));

  // Persist feedback, if provided
  if (body && typeof body.code === "string" && typeof body.note === "string") {
    const rating = typeof body.rating === "number" ? Math.max(1, Math.min(5, Math.floor(body.rating))) : null;
    try {
      await prisma.feedback.create({ data: { code: body.code, note: body.note, rating } });
    } catch {}
  }

  // Stub "learning": nudge threshold slightly (replace with a proper learner)
  threshold_nW = Math.max(5, Math.min(20, threshold_nW + (Math.random() - 0.5)));
  loopState.setLearn(new Date().toISOString());
  return NextResponse.json({ threshold_nW });
}

export function GET() {
  return NextResponse.json({ threshold_nW });
}
