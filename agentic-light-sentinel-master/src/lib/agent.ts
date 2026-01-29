import { fetchViirsTileSummary } from "./viirs";
import { sendMail } from "./mailer";
import { importVIIRSData } from "./import-viirs";
import { PrismaClient, District, Hotspot, AgentLog, DistrictMetric } from "@prisma/client";
import { prisma } from "./prisma";

// Define types for our models
type DistrictWithMetrics = District & {
  metrics: DistrictMetric[];
};

type HotspotWithDistrict = Hotspot & {
  district: District;
};

// Constants for agent configuration
const AGENT_CONFIG = {
  intervals: {
    sense: 60,    // minutes between VIIRS fetches
    reason: 15,   // minutes between hotspot detection runs
    act: 30,      // minutes between notification checks
    learn: 360    // minutes between ML model updates
  },
  thresholds: {
    brightness: 15,   // nW/cm²/sr minimum for hotspot
    delta: 5,        // year-over-year change threshold
    severity: {
      low: 15,
      medium: 20,
      high: 25,
      extreme: 30
    }
  }
};

// Agent state and runtime tracking
let lastRun = {
  sense: new Date(0),
  reason: new Date(0),
  act: new Date(0),
  learn: new Date(0)
};

// Base district agent function
export async function runAgentForDistrict(code: string, bbox: [number, number, number, number], year: number) {
  const s = await fetchViirsTileSummary(bbox, year);
  await prisma.districtMetric.upsert({
    where: { code_year: { code, year } },
    update: { radiance: s.radiance, hotspots: s.hotspots },
    create: { code, year, radiance: s.radiance, hotspots: s.hotspots }
  });
  return s;
}

// Function to import VIIRS data with retry logic
async function importDailyVIIRS(dateISO?: string) {
  const today = dateISO || new Date().toISOString().slice(0, 10);
  console.log(`Importing VIIRS data for ${today}...`);
  
  try {
    const success = await importVIIRSData({
      dateISO: today,
      useSimulated: process.env.USE_REAL_VIIRS !== "1",
      skipExisting: true
    });

    if (success) {
      console.log("✅ Successfully imported VIIRS data");
      await prisma.agentLog.create({
        data: {
          component: 'sense',
          status: 'success',
          timestamp: new Date()
        }
      });
      return true;
    } else {
      throw new Error("Import failed");
    }
  } catch (error) {
    console.error("❌ Failed to import VIIRS data:", error);
    await prisma.agentLog.create({
      data: {
        component: 'sense',
        status: 'error',
        error: String(error),
        timestamp: new Date()
      }
    });
    return false;
  }
}

// Autonomous agent loop components
export const agent = {
  // Sense: Fetch latest VIIRS data
  async sense() {
    const now = new Date();
    if (now.getTime() - lastRun.sense.getTime() < AGENT_CONFIG.intervals.sense * 60000) return;
    
    try {
      const districts = await prisma.district.findMany({
        include: {
          metrics: {
            orderBy: {
              year: 'desc'
            },
            take: 2
          }
        }
      }) as DistrictWithMetrics[];

      for (const d of districts) {
        // Skip districts without a bbox
        if (!d.bbox || d.bbox.length !== 4) {
          console.warn(`Invalid bbox for district ${d.code}, skipping...`);
          continue;
        }

        // Parse bbox string to number array
        const bboxParsed = typeof d.bbox === 'string' ? JSON.parse(d.bbox) : d.bbox;
        const bbox = bboxParsed as [number, number, number, number];
        await runAgentForDistrict(d.code, bbox, new Date().getFullYear());
      }
      lastRun.sense = now;
      await prisma.agentLog.create({
        data: { component: 'sense', status: 'success', timestamp: now }
      });
    } catch (error) {
      await prisma.agentLog.create({
        data: { component: 'sense', status: 'error', error: String(error), timestamp: now }
      });
    }
  },

  // Reason: Detect hotspots and anomalies
  async reason() {
    const now = new Date();
    if (now.getTime() - lastRun.reason.getTime() < AGENT_CONFIG.intervals.reason * 60000) return;

    try {
      const districts = await prisma.district.findMany({
        include: { metrics: { orderBy: { year: 'desc' }, take: 2 } }
      });

      for (const d of districts) {
        const [current, previous] = d.metrics;
        if (!current || !previous) continue;

        const delta = current.radiance - previous.radiance;
        if (current.radiance > AGENT_CONFIG.thresholds.brightness && 
            delta > AGENT_CONFIG.thresholds.delta) {
          if (!d.bbox || d.bbox.length !== 4) continue;
          
          // Parse bbox string and generate a random point within the district's bbox
          const bboxParsed = typeof d.bbox === 'string' ? JSON.parse(d.bbox) : d.bbox;
          const [west, south, east, north] = bboxParsed as [number, number, number, number];
          const lat = south + Math.random() * (north - south);
          const lng = west + Math.random() * (east - west);

          await prisma.hotspot.create({
            data: {
              districtCode: d.code,
              lat,
              lng,
              brightness: current.radiance,
              delta,
              severity: getSeverity(current.radiance),
              detectedAt: now
            }
          });
        }
      }

      lastRun.reason = now;
      await prisma.agentLog.create({
        data: { component: 'reason', status: 'success', timestamp: now }
      });
    } catch (error) {
      await prisma.agentLog.create({
        data: { component: 'reason', status: 'error', error: String(error), timestamp: now }
      });
    }
  },

  // Act: Generate & send notifications
  async act() {
    const now = new Date();
    if (now.getTime() - lastRun.act.getTime() < AGENT_CONFIG.intervals.act * 60000) return;

    try {
      const hotspots = await prisma.hotspot.findMany({
        where: { notified: false },
        include: { district: true }
      });

      for (const h of hotspots) {
        // Skip if no contact email
        if (!h.district.contactEmail) continue;
        
        await sendMail({
          to: h.district.contactEmail,
          subject: `Light Pollution Alert: ${h.severity} severity in ${h.district.name}`,
          html: generateAlertEmail(h)
        });

        await prisma.hotspot.update({
          where: { id: h.id },
          data: { notified: true }
        });
      }

      lastRun.act = now;
      await prisma.agentLog.create({
        data: { component: 'act', status: 'success', timestamp: now }
      });
    } catch (error) {
      await prisma.agentLog.create({
        data: { component: 'act', status: 'error', error: String(error), timestamp: now }
      });
    }
  },

  // Learn: Update models & thresholds
  async learn() {
    const now = new Date();
    if (now.getTime() - lastRun.learn.getTime() < AGENT_CONFIG.intervals.learn * 60000) return;

    try {
      // Update severity thresholds based on distribution
      const metrics = await prisma.districtMetric.findMany({
        where: { year: new Date().getFullYear() }
      });
      
      const values = metrics.map(m => m.radiance).sort((a, b) => a - b);
      const len = values.length;
      
      AGENT_CONFIG.thresholds.severity = {
        low: values[Math.floor(len * 0.75)],
        medium: values[Math.floor(len * 0.85)],
        high: values[Math.floor(len * 0.95)],
        extreme: values[Math.floor(len * 0.98)]
      };

      lastRun.learn = now;
      await prisma.agentLog.create({
        data: { component: 'learn', status: 'success', timestamp: now }
      });
    } catch (error) {
      await prisma.agentLog.create({
        data: { component: 'act', status: 'error', error: String(error), timestamp: now }
      });
    }
  },

  // Run complete loop
  async runLoop() {
    await this.sense();
    await this.reason();
    await this.act();
    await this.learn();
  },

  // Get current status
  getStatus() {
    return {
      lastSense: lastRun.sense.toISOString(),
      lastReason: lastRun.reason.toISOString(),
      lastAct: lastRun.act.toISOString(),
      lastLearn: lastRun.learn.toISOString()
    };
  }
};

// Helper functions
function getSeverity(brightness: number): 'low' | 'medium' | 'high' | 'extreme' {
  if (brightness >= AGENT_CONFIG.thresholds.severity.extreme) return 'extreme';
  if (brightness >= AGENT_CONFIG.thresholds.severity.high) return 'high';
  if (brightness >= AGENT_CONFIG.thresholds.severity.medium) return 'medium';
  return 'low';
}

function generateAlertEmail(hotspot: any) {
  return `
Light Pollution Alert for ${hotspot.district.name}

Severity: ${hotspot.severity}
Brightness: ${hotspot.brightness.toFixed(2)} nW/cm²/sr
Change: ${hotspot.delta > 0 ? '+' : ''}${hotspot.delta.toFixed(2)} nW/cm²/sr

This increase in light pollution may be due to:
- New or modified outdoor lighting
- Construction or development activity
- Special events or temporary installations

Recommended actions:
1. Survey the area for non-compliant lighting
2. Check for temporary light sources
3. Review recent construction permits
4. Consider implementing:
   - Downward-facing fixtures
   - Motion sensors
   - Dimming schedules
   - Light shields

Visit the dashboard for more details and visualization:
http://localhost:3000/dashboard

Contact us if you need technical assistance with mitigation strategies.
`;
}
