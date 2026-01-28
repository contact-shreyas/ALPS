import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

export async function POST() {
  const to = process.env.MUNICIPALITY_EMAIL || process.env.SMTP_USER || "devnull@example.com";

  // Latest date coverage
  const latest = await prisma.districtDailyMetric.findFirst({ orderBy: { date: "desc" }, select: { date: true } });
  const latestDate = latest?.date ?? null;
  const totalDistricts = await prisma.district.count();
  let coveragePct = 0;
  if (latestDate) {
    const withMetric = await prisma.districtDailyMetric.count({ where: { date: latestDate } });
    coveragePct = totalDistricts ? (withMetric / totalDistricts) * 100 : 0;
  }

  // Top 5 states by hotspots
  let topStates: { stateCode: string; hotspots: number }[] = [];
  if (latestDate) {
    const states = await prisma.state.findMany({ select: { code: true } });
    for (const s of states) {
      const districts = await prisma.district.findMany({ where: { stateCode: s.code }, select: { code: true } });
      if (!districts.length) continue;
      const metrics = await prisma.districtDailyMetric.findMany({
        where: { code: { in: districts.map((d) => d.code) }, date: latestDate },
        select: { hotspots: true },
      });
      const total = metrics.reduce((a, b) => a + b.hotspots, 0);
      topStates.push({ stateCode: s.code, hotspots: total });
    }
    topStates.sort((a, b) => b.hotspots - a.hotspots);
    topStates = topStates.slice(0, 5);
  }

  const html = `
    <h2>Agentic Light Sentinel — Daily Report</h2>
    <p><b>Date:</b> ${latestDate ? latestDate.toISOString().slice(0, 10) : "n/a"}</p>
    <p><b>Coverage:</b> ${coveragePct.toFixed(1)}% of districts updated</p>
    <h3>Top States by Hotspots</h3>
    <ul>${topStates.map((s) => `<li>${s.stateCode}: ${s.hotspots}</li>`).join("")}</ul>
    <p>See dashboard for details.</p>
  `;

  await sendMail({ to, subject: "Daily Light Sentinel Report", html });
  return NextResponse.json({ ok: true });
}

