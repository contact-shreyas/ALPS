import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function insertTestData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Insert some test alerts
  for (let i = 0; i < 10; i++) {
    const detectedAt = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const createdAt = new Date(detectedAt.getTime() + 5 * 60 * 1000); // 5 minutes processing time
    
    await prisma.alert.create({
      data: {
        level: "district",
        code: "IN-UP-LKO",
        message: `Test alert ${i + 1}`,
        severity: Math.floor(Math.random() * 10) + 1,
        confirmed: i < 7, // 70% confirmation rate
        detectedAt,
        createdAt
      }
    });
  }

  // Insert daily metrics
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    
    await prisma.districtDailyMetric.create({
      data: {
        code: "IN-UP-LKO",
        date,
        radiance: 15 + Math.random() * 10,
        hotspots: Math.floor(Math.random() * 5)
      }
    });

    await prisma.stateDailyMetric.create({
      data: {
        code: "IN-UP",
        date,
        radiance: 12 + Math.random() * 8,
        hotspots: Math.floor(Math.random() * 10)
      }
    });
  }

  console.log("✅ Test data inserted successfully");
}

insertTestData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());