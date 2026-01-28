import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hotspots = await prisma.hotspot.findMany({
      where: {
        resolvedAt: null  // Only active hotspots
      },
      include: {
        district: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        detectedAt: 'desc'
      },
      take: 100  // Limit to recent hotspots
    });

    return NextResponse.json({
      hotspots: hotspots.map(h => ({
        id: h.id,
        lat: h.lat,
        lng: h.lng,
        brightness: h.brightness,
        severity: h.severity,
        district: h.district.name,
        detectedAt: h.detectedAt
      }))
    });
  } catch (error) {
    console.error("Error fetching hotspots:", error);
    return NextResponse.json({ error: "Failed to fetch hotspots" }, { status: 500 });
  }
}