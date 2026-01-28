import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { fetchViirsTileSummary } from "../src/lib/viirs";

// Simulated ingest for demo; replace with real NASA/VIIRS later.
async function run() {
  const year = 2025;
  const up = await fetchViirsTileSummary([77,24,83,28], year);
  const lko = await fetchViirsTileSummary([80.8,26.6,81.1,26.95], year);

  await prisma.stateMetric.upsert({
    where: { code_year: { code: "IN-UP", year } },
    update: { radiance: up.radiance, hotspots: up.hotspots },
    create: { code: "IN-UP", year, radiance: up.radiance, hotspots: up.hotspots }
  });
  await prisma.districtMetric.upsert({
    where: { code_year: { code: "IN-UP-LKO", year } },
    update: { radiance: lko.radiance, hotspots: lko.hotspots },
    create: { code: "IN-UP-LKO", year, radiance: lko.radiance, hotspots: lko.hotspots }
  });

  console.log("✅ Ingested VIIRS summary for 2025.");
}

run().finally(() => prisma.$disconnect());
