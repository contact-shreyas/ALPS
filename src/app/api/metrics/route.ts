import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loopState } from "../loop/route";

export async function GET() {
  // Coverage
  const totalDistricts = await prisma.district.count();
  const latestDistrictMetric = await prisma.districtDailyMetric.findFirst({
    orderBy: { date: "desc" },
    select: { date: true },
  });

  let districtCoverage = 0;
  let latestDate: Date | null = null;
  if (totalDistricts > 0 && latestDistrictMetric?.date) {
    latestDate = latestDistrictMetric.date;
    const withMetric = await prisma.districtDailyMetric.count({ where: { date: latestDistrictMetric.date } });
    districtCoverage = withMetric / totalDistricts;
  }

  // Precision/Recall (heuristic):
  // - Alerts = districts with hotspots above threshold on the latest date
  // - Confirmed = alerts that have a feedback rating >= 4 on/after that date
  // - Precision = confirmed/alerts; Recall = confirmed/(all positives by feedback)
  const alertThreshold = Number(process.env.ALERT_HOTSPOTS ?? 50);
  let hotspotPrecision = 0;
  let hotspotRecall = 0;
  if (latestDate) {
    const alertCodes = await prisma.districtDailyMetric.findMany({
      where: { date: latestDate, hotspots: { gt: alertThreshold } },
      select: { code: true },
    });
    const alertCodeSet = new Set(alertCodes.map(r => r.code));

    const positiveFeedback = await prisma.feedback.findMany({
      where: { createdAt: { gte: latestDate } },
      select: { code: true, rating: true },
    });
    const positives = new Set(
      positiveFeedback.filter(f => (f.rating ?? 0) >= 4).map(f => f.code)
    );
    const confirmed = [...alertCodeSet].filter(c => positives.has(c));

    const alertsN = alertCodeSet.size;
    const positivesN = positives.size;
    hotspotPrecision = alertsN ? confirmed.length / alertsN : 0;
    hotspotRecall = positivesN ? confirmed.length / positivesN : 0;
  }

  // Latency (best-effort): sense -> act based on in-memory loop state
  const ls = loopState.get();
  let ingestToAlertLatencyP50 = 0;
  let ingestToAlertLatencyP95 = 0;
  if (ls.lastSense && ls.lastAct) {
    const mins = Math.max(0, (Date.parse(ls.lastAct) - Date.parse(ls.lastSense)) / 60000);
    ingestToAlertLatencyP50 = Math.round(mins);
    ingestToAlertLatencyP95 = Math.round(mins);
  }

  return NextResponse.json({
    hotspotPrecision: Number(hotspotPrecision.toFixed(3)),
    hotspotRecall: Number(hotspotRecall.toFixed(3)),
    ingestToAlertLatencyP50,
    ingestToAlertLatencyP95,
    districtCoverage: Number(districtCoverage.toFixed(3)),
    timestamp: new Date().toISOString(),
  });
}

