import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';
import { generateDashboardReport } from '@/lib/reports';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Realistic data for Indian metropolitan areas with actual light pollution concerns
    const now = new Date();
    const mockData = {
      timestamp: now.toISOString(),
      reportId: `LPS-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      generatedBy: "Agentic Light Pollution Sentinel AI System",
      coveragePeriod: {
        start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      },
      metrics: {
        totalDistricts: 742, // Total districts in India
        monitoredDistricts: 384,
        affectedDistricts: 156,
        avgRadiance: 47.3,
        highSeverityCount: 28,
        mediumSeverityCount: 89,
        lowSeverityCount: 39,
        totalHotspots: 12847,
        newHotspotsThisMonth: 342,
        resolvedIssues: 67,
        pendingAlerts: 23
      },
      topDistricts: [
        { 
          name: "Mumbai Metropolitan Region", 
          stateCode: "MH", 
          state: "Maharashtra",
          meanRadiance: 124.7,
          coordinates: "19.0760°N, 72.8777°E",
          population: "20.7M",
          hotspotsCount: 1847,
          severityLevel: "Critical",
          primarySources: ["Industrial complexes", "Commercial districts", "Port activities"]
        },
        { 
          name: "National Capital Territory", 
          stateCode: "DL", 
          state: "Delhi",
          meanRadiance: 118.3,
          coordinates: "28.7041°N, 77.1025°E", 
          population: "32.9M",
          hotspotsCount: 1623,
          severityLevel: "Critical",
          primarySources: ["Urban sprawl", "Traffic corridors", "Commercial hubs"]
        },
        { 
          name: "Bengaluru Urban", 
          stateCode: "KA", 
          state: "Karnataka",
          meanRadiance: 89.6,
          coordinates: "12.9716°N, 77.5946°E",
          population: "13.2M",
          hotspotsCount: 934,
          severityLevel: "High",
          primarySources: ["IT parks", "Airport vicinity", "Industrial areas"]
        },
        { 
          name: "Chennai Metropolitan", 
          stateCode: "TN", 
          state: "Tamil Nadu",
          meanRadiance: 82.4,
          coordinates: "13.0827°N, 80.2707°E",
          population: "11.5M", 
          hotspotsCount: 756,
          severityLevel: "High",
          primarySources: ["Port operations", "Industrial zones", "Urban centers"]
        },
        { 
          name: "Pune Metropolitan", 
          stateCode: "MH", 
          state: "Maharashtra",
          meanRadiance: 76.8,
          coordinates: "18.5204°N, 73.8567°E",
          population: "7.4M",
          hotspotsCount: 623,
          severityLevel: "High", 
          primarySources: ["Automotive industry", "IT corridors", "Educational institutions"]
        }
      ],
      nationalTrend: [
        { date: "2025-08-23", value: 11892, change: "+2.3%" },
        { date: "2025-08-30", value: 12034, change: "+1.2%" },
        { date: "2025-09-06", value: 12156, change: "+1.0%" },
        { date: "2025-09-13", value: 12398, change: "+2.0%" },
        { date: "2025-09-20", value: 12847, change: "+3.6%" }
      ],
      environmentalImpact: {
        wildlifeAffected: "847 species reported affected",
        energyWaste: "₹2,847 crores annually in wasted lighting",
        healthImpact: "~34.2M people exposed to excessive artificial lighting",
        astronomicalImpact: "78% reduction in visible stars in urban areas"
      },
      recommendations: [
        "Implement Dark Sky policies in 15 identified priority zones",
        "Retrofit 12,000+ unshielded street lights with LED downward fixtures", 
        "Establish lighting curfews (11 PM - 5 AM) for non-essential commercial signage",
        "Create buffer zones around 23 identified ecologically sensitive areas",
        "Launch public awareness campaigns in top 10 affected metropolitan regions"
      ]
    };

    const report = generateDashboardReport(mockData);

    const result = await sendMail({
      to: email || process.env.MUNICIPALITY_EMAIL || 'default@example.com',
      subject: 'Light Pollution Dashboard Report - ' + new Date().toLocaleDateString('en-IN'),
      html: report.html
    });

    console.log('Email send result:', result);

    if (!result || !result.success) {
      throw new Error('Failed to send email - no result returned');
    }

    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId,
      transport: result.transport,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to send dashboard report:', error);
    return NextResponse.json(
      { error: 'Failed to send dashboard report' },
      { status: 500 }
    );
  }
}