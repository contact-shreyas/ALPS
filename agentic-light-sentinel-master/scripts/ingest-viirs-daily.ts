import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { importVIIRSData } from "../src/lib/import-viirs";

// Default to yesterday's date if no date provided
const dateISO = process.argv[2] || new Date(Date.now() - 86400000).toISOString().slice(0, 10);

async function run() {
  console.log("Starting VIIRS data ingestion for", dateISO);
  
  const success = await importVIIRSData({
    dateISO,
    useSimulated: process.env.USE_REAL_VIIRS !== "1",
    skipExisting: true
  });

  if (success) {
    console.log("✅ Successfully ingested VIIRS data");
  } else {
    console.error("❌ Failed to ingest VIIRS data");
    process.exit(1);
  }
}

run()
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
