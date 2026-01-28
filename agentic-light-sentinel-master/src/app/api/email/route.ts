import { NextRequest, NextResponse } from "next/server";
import { hotspotsStore } from "../alerts/route";
import { loopState } from "../loop/route";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { hotspotId } = await req.json();
  const h = hotspotsStore.alerts.find(a => a.id === hotspotId);
  const to = process.env.MUNICIPALITY_EMAIL || process.env.SMTP_USER || "devnull@example.com";
  if (h) {
    const html = `
      <h2>Hotspot Action Plan</h2>
      <p><b>Location:</b> ${h.district}${h.state ? ", "+h.state : ""}</p>
      <p><b>Severity:</b> ${h.severity}; <b>Delta radiance:</b> ${h.delta_nW.toFixed(2)} nW/cm^2/sr</p>
      <p><b>Last observed:</b> ${new Date(h.lastObservedISO).toLocaleString()}</p>
      <ol>
        <li>Install full-cutoff shielding near the hotspot.</li>
        <li>Switch to 2200–2700K LEDs where feasible.</li>
        <li>Dim after 11pm by 30–50% on low-traffic corridors.</li>
        <li>Audit facade/advertising lights; enforce off times.</li>
      </ol>`;
    await sendMail({ to, subject: `Action plan: ${h.district}`, html });
  }
  loopState.setAct(new Date().toISOString());
  return NextResponse.json({ ok: true });
}
