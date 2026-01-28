import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function run() {
  // Minimal but valid demo geometries (rects)
  const upGeom = {
    type: "Feature",
    properties: { code: "IN-UP", name: "Uttar Pradesh" },
    geometry: { type: "Polygon", coordinates: [[[77,24],[83,24],[83,28],[77,28],[77,24]]]}
  } as any;
  const lkoGeom = {
    type: "Feature",
    properties: { code: "IN-UP-LKO", name: "Lucknow" },
    geometry: { type: "Polygon", coordinates: [[[80.8,26.6],[81.1,26.6],[81.1,26.95],[80.8,26.95],[80.8,26.6]]]}
  } as any;

  await prisma.state.upsert({
    where: { code: "IN-UP" },
    update: { name: "Uttar Pradesh", geomGeoJSON: upGeom },
    create: { code: "IN-UP", name: "Uttar Pradesh", geomGeoJSON: upGeom }
  });

  await prisma.district.upsert({
    where: { code: "IN-UP-LKO" },
    update: { name: "Lucknow", stateCode: "IN-UP", geomGeoJSON: lkoGeom },
    create: { code: "IN-UP-LKO", name: "Lucknow", stateCode: "IN-UP", geomGeoJSON: lkoGeom }
  });

  const years = Array.from({ length: 13 }, (_, i) => 2013 + i);
  for (const y of years) {
    await prisma.stateMetric.upsert({
      where: { code_year: { code: "IN-UP", year: y } },
      update: { radiance: 18 + (y - 2013) * 0.9, hotspots: 4 + ((y - 2013) % 4) },
      create: { code: "IN-UP", year: y, radiance: 18 + (y - 2013) * 0.9, hotspots: 4 + ((y - 2013) % 4) }
    });
    await prisma.districtMetric.upsert({
      where: { code_year: { code: "IN-UP-LKO", year: y } },
      update: { radiance: 12 + (y - 2013) * 0.6, hotspots: 2 + ((y - 2013) % 5) },
      create: { code: "IN-UP-LKO", year: y, radiance: 12 + (y - 2013) * 0.6, hotspots: 2 + ((y - 2013) % 5) }
    });
  }
  console.log("OK. Seed complete.");
}

run().finally(() => prisma.$disconnect());

