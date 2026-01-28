import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  
  // Update or create settings
  await prisma.settings.upsert({
    where: { key: 'notification_email' },
    update: { value: email },
    create: {
      key: 'notification_email',
      value: email,
    },
  });

  // Update environment variable for immediate effect
  process.env.MUNICIPALITY_EMAIL = email;

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const setting = await prisma.settings.findUnique({
    where: { key: 'notification_email' },
  });

  return NextResponse.json({ email: setting?.value || process.env.MUNICIPALITY_EMAIL });
}