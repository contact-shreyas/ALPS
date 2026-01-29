import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Enable streaming for real-time data
export const runtime = 'nodejs';

/**
 * Server-Sent Events endpoint for real-time light pollution data streaming
 * This endpoint provides continuous updates for the 3D visualization
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeHotspots = searchParams.get('hotspots') !== 'false';
  const includeHistorical = searchParams.get('historical') !== 'false';
  
  // Create a ReadableStream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', message: 'Real-time data stream connected' })}\n\n`);
      
      let intervalId: NodeJS.Timeout;
      
      const sendUpdate = async () => {
        try {
          const data = await fetchLightPollutionData(includeHotspots, includeHistorical);
          
          // Send the data as SSE
          controller.enqueue(`data: ${JSON.stringify({
            type: 'update',
            timestamp: new Date().toISOString(),
            data
          })}\n\n`);
          
        } catch (error) {
          console.error('Error fetching light pollution data for SSE:', error);
          controller.enqueue(`data: ${JSON.stringify({
            type: 'error',
            message: 'Failed to fetch data',
            timestamp: new Date().toISOString()
          })}\n\n`);
        }
      };
      
      // Send initial data immediately
      sendUpdate();
      
      // Set up interval for real-time updates (every 10 seconds)
      intervalId = setInterval(sendUpdate, 10000);
      
      // Clean up when the connection is closed
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        controller.close();
      });
    }
  });

  // Return response with appropriate headers for SSE
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

/**
 * Fetch combined light pollution data from various sources
 */
async function fetchLightPollutionData(includeHotspots: boolean, includeHistorical: boolean) {
  const points: any[] = [];
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  try {
    // Fetch active hotspots
    if (includeHotspots) {
      const hotspots = await prisma.hotspot.findMany({
        where: {
          resolvedAt: null,
          detectedAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
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
        take: 50 // Limit for performance
      });

      hotspots.forEach(hotspot => {
        points.push({
          id: `hotspot-${hotspot.id}`,
          latitude: hotspot.lat,
          longitude: hotspot.lng,
          brightness: hotspot.brightness,
          timestamp: hotspot.detectedAt.toISOString(),
          district: hotspot.district?.name || 'Unknown',
          type: 'hotspot',
          severity: hotspot.severity
        });
      });
    }

    // Fetch recent district metrics as light pollution data points
    if (includeHistorical) {
      const recentMetrics = await prisma.districtDailyMetric.findMany({
        where: {
          date: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: {
          district: {
            select: {
              name: true,
              bbox: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        take: 100 // Limit for performance
      });

      recentMetrics.forEach((metric, index) => {
        // Extract center coordinates from district bounds if available
        let lat = 20 + Math.random() * 20; // Default range for India
        let lng = 70 + Math.random() * 20;
        
        if (metric.district.bbox) {
          try {
            const bbox = JSON.parse(metric.district.bbox);
            if (bbox && Array.isArray(bbox) && bbox.length >= 4) {
              // Calculate center from bbox [minLng, minLat, maxLng, maxLat]
              lat = (bbox[1] + bbox[3]) / 2;
              lng = (bbox[0] + bbox[2]) / 2;
            }
          } catch (e) {
            // Use default coordinates if bbox parsing fails
          }
        }

        points.push({
          id: `metric-${metric.id}`,
          latitude: lat,
          longitude: lng,
          brightness: metric.radiance,
          timestamp: metric.date.toISOString(),
          district: metric.district.name,
          type: 'historical',
          hotspots: metric.hotspots
        });
      });
    }

    // If no real data, generate some demo data for visualization
    if (points.length === 0) {
      const demoPoints = generateDemoData();
      points.push(...demoPoints);
    }

    return {
      points,
      totalCount: points.length,
      lastUpdated: now.toISOString(),
      sources: {
        hotspots: includeHotspots,
        historical: includeHistorical
      }
    };

  } catch (error) {
    console.error('Error in fetchLightPollutionData:', error);
    
    // Return demo data on database error
    return {
      points: generateDemoData(),
      totalCount: 0,
      lastUpdated: now.toISOString(),
      error: 'Database connection failed, showing demo data'
    };
  }
}

/**
 * Generate demo data for visualization when no real data is available
 */
function generateDemoData() {
  const demoPoints: Array<{
    id: string;
    latitude: number;
    longitude: number;
    brightness: number;
    timestamp: string;
    district: string;
    type: string;
  }> = [];
  const now = new Date();
  
  // Major Indian cities with realistic light pollution data
  const cities = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, baseBrightness: 85 },
    { name: 'Delhi', lat: 28.7041, lng: 77.1025, baseBrightness: 82 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946, baseBrightness: 65 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707, baseBrightness: 72 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639, baseBrightness: 68 },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, baseBrightness: 58 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567, baseBrightness: 52 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, baseBrightness: 48 }
  ];

  cities.forEach((city, cityIndex) => {
    // Generate multiple data points per city over time
    for (let timeOffset = 0; timeOffset < 24; timeOffset += 2) {
      const timestamp = new Date(now.getTime() - timeOffset * 60 * 60 * 1000);
      const brightness = city.baseBrightness + (Math.random() - 0.5) * 20;
      
      // Add some random scatter around the city center
      const latOffset = (Math.random() - 0.5) * 0.2; // ~20km range
      const lngOffset = (Math.random() - 0.5) * 0.2;
      
      demoPoints.push({
        id: `demo-${cityIndex}-${timeOffset}`,
        latitude: city.lat + latOffset,
        longitude: city.lng + lngOffset,
        brightness: Math.max(0, brightness),
        timestamp: timestamp.toISOString(),
        district: city.name,
        type: 'demo'
      });
    }
  });

  return demoPoints;
}