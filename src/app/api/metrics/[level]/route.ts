import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  calculateProcessingTimes,
  calculatePercentile,
  calculateCoverageMetrics,
  calculateHotspotMetrics 
} from "@/lib/metrics";

export async function GET() {
  // Get alerts from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const alerts = await prisma.alert.findMany({
    where: {
      createdAt: {
        gte: thirtyDaysAgo
      }
    },
    select: {
      id: true,
      confirmed: true,
      detectedAt: true,
      createdAt: true,
      district: true
    }
  });

  // Get districts with alerts
  const districtsWithAlerts = await prisma.district.count({
    where: {
      alerts: {
        some: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }
    }
  });
  
  const totalDistricts = await prisma.district.count();

  // Calculate metrics
  const processingTimes = alerts.map(alert => 
    Math.abs(alert.createdAt.getTime() - alert.detectedAt.getTime())
  ).sort((a, b) => a - b);
  
  const ingestToAlertLatencyP50 = calculatePercentile(processingTimes, 50);
  const ingestToAlertLatencyP95 = calculatePercentile(processingTimes, 95);

  const confirmedAlerts = alerts.filter(a => a.confirmed).length;
  const estimatedMissedHotspots = Math.round(confirmedAlerts * 0.1); // Estimate missed hotspots

  const { precision, recall } = calculateHotspotMetrics(
    confirmedAlerts,
    alerts.length,
    estimatedMissedHotspots
  );

  const districtCoverage = calculateCoverageMetrics(districtsWithAlerts, totalDistricts);

  return NextResponse.json({
    hotspotPrecision: precision / 100, // Convert from percentage to decimal
    hotspotRecall: recall / 100,
    ingestToAlertLatencyP50: Math.round(ingestToAlertLatencyP50 / (1000 * 60)), // Convert to minutes
    ingestToAlertLatencyP95: Math.round(ingestToAlertLatencyP95 / (1000 * 60)),
    districtCoverage: districtCoverage / 100,
  });
}
