import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  if (!q) return NextResponse.json([]);

  const rows = await prisma.district.findMany({
    where: { name: { contains: q } },
    select: { code: true, name: true, stateCode: true },
    take: 20,
  });

  return NextResponse.json(rows);
}
