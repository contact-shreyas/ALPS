// scripts/process-hotspots.ts
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

function score(x: number) { return Math.max(0, Math.min(10, Math.round(x))); }

async function anomaliesForDistricts(day: Date) {
  let created = 0;
  const dists = await prisma.district.findMany({ select: { code: true }});
  for (const d of dists) {
    const hist = await prisma.districtDailyMetric.findMany({
      where: { code: d.code, date: { lt: day } },
      orderBy: { date: "desc" }, take: 30
    });
    const today = await prisma.districtDailyMetric.findUnique({ where: { code_date: { code: d.code, date: day } } });
    if (!today || hist.length < 10) continue;

    const mean = hist.reduce((a,b)=>a+b.radiance,0)/hist.length;
    const dev = today.radiance - mean;

    if (dev > 0.2 * mean) {
      await prisma.alert.create({
        data: { level: "district", code: d.code,
          message: `District radiance ${today.radiance.toFixed(2)} is +${(100*dev/mean).toFixed(0)}% vs 30-day mean ${mean.toFixed(2)}.`,
          severity: score((dev/mean)*10)
        }
      });
      created++;
    }
  }
  return created;
}

async function anomaliesForStates(day: Date) {
  let created = 0;
  const states = await prisma.state.findMany({ select: { code: true }});
  for (const s of states) {
    const hist = await prisma.stateDailyMetric.findMany({
      where: { code: s.code, date: { lt: day } },
      orderBy: { date: "desc" }, take: 30
    });
    const today = await prisma.stateDailyMetric.findUnique({ where: { code_date: { code: s.code, date: day } } });
    if (!today || hist.length < 10) continue;

    const mean = hist.reduce((a,b)=>a+b.radiance,0)/hist.length;
    const dev = today.radiance - mean;

    if (dev > 0.2 * mean) {
      await prisma.alert.create({
        data: { level: "state", code: s.code,
          message: `State radiance ${today.radiance.toFixed(2)} is +${(100*dev/mean).toFixed(0)}% vs 30-day mean ${mean.toFixed(2)}.`,
          severity: score((dev/mean)*10)
        }
      });
      created++;
    }
  }
  return created;
}

async function run(dateISO?: string) {
  const day = new Date((dateISO || new Date().toISOString().slice(0,10)) + "T00:00:00Z");
  const d = await anomaliesForDistricts(day);
  const s = await anomaliesForStates(day);
  console.log(`✅ Generated ${d+s} daily alerts for ${day.toISOString().slice(0,10)} (${d} district, ${s} state).`);
}

const dateISO = process.argv[2];
run(dateISO).finally(() => prisma.$disconnect());
