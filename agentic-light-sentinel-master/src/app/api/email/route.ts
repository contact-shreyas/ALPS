import { NextRequest, NextResponse } from "next/server";
import { loopState } from "@/lib/loop-state";
import { sendMail } from "@/lib/mailer";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { hotspotId } = await req.json();
  const h = await prisma.alert.findUnique({ where: { id: hotspotId } });
  const to = process.env.MUNICIPALITY_EMAIL || process.env.SMTP_USER || "devnull@example.com";
  if (h) {
    const html = `
      <h2>Hotspot Action Plan</h2>
      <p><b>Code:</b> ${h.code}</p>
      <p><b>Level:</b> ${h.level}; <b>Severity:</b> ${h.severity}</p>
      <p><b>Message:</b> ${h.message}</p>
      <p><b>Detected:</b> ${new Date(h.detectedAt).toLocaleString()}</p>
      <ol>
        <li>Install full-cutoff shielding near the hotspot.</li>
        <li>Switch to 2200–2700K LEDs where feasible.</li>
        <li>Dim after 11pm by 30–50% on low-traffic corridors.</li>
        <li>Audit facade/advertising lights; enforce off times.</li>
      </ol>`;
    await sendMail({ to, subject: `Alert: ${h.code}`, html });
  }
  loopState.setAct(new Date().toISOString());
  return NextResponse.json({ ok: true });
}
