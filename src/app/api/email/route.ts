import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { hotspotId } = await req.json();
    
    // Fetch alert from database instead of from hotspotsStore
    const alert = await prisma.alert.findUnique({
      where: { id: hotspotId },
      include: { entity: true }
    });

    const to = process.env.MUNICIPALITY_EMAIL || process.env.SMTP_USER || "devnull@example.com";
    
    if (alert) {
      const severity = alert.severity === 3 ? 'HIGH' : alert.severity === 2 ? 'MEDIUM' : 'LOW';
      const html = `
        <h2>Hotspot Action Plan</h2>
        <p><b>Location:</b> ${alert.entity?.name || alert.code}</p>
        <p><b>Severity:</b> ${severity}</p>
        <p><b>Last observed:</b> ${new Date(alert.createdAt).toLocaleString()}</p>
        <ol>
          <li>Install full-cutoff shielding near the hotspot.</li>
          <li>Switch to 2200–2700K LEDs where feasible.</li>
          <li>Dim after 11pm by 30–50% on low-traffic corridors.</li>
          <li>Audit facade/advertising lights; enforce off times.</li>
        </ol>`;
      await sendMail({ to, subject: `Action plan: ${alert.entity?.name || alert.code}`, html });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Email route error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
