import { NextResponse } from "next/server";

// Lightweight alias to email/report for convenience (GET in browser)
export async function GET() {
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/email/report`, { method: "POST" } as any).catch(()=>null);
  return NextResponse.json({ ok: !!r });
}

