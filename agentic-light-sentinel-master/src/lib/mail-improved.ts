import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailParams) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
      html: html || text
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Indian district mapping for realistic location data
const INDIAN_DISTRICTS = {
  'BR': { name: 'Patna', state: 'Bihar', coords: { lat: 25.5941, lng: 85.1376 } },
  'GJ': { name: 'Ahmedabad', state: 'Gujarat', coords: { lat: 23.0225, lng: 72.5714 } },
  'KA': { name: 'Bengaluru Urban', state: 'Karnataka', coords: { lat: 12.9716, lng: 77.5946 } },
  'MH': { name: 'Mumbai Suburban', state: 'Maharashtra', coords: { lat: 19.0760, lng: 72.8777 } },
  'TN': { name: 'Chennai', state: 'Tamil Nadu', coords: { lat: 13.0827, lng: 80.2707 } },
  'DL': { name: 'New Delhi', state: 'Delhi', coords: { lat: 28.6139, lng: 77.2090 } },
  'WB': { name: 'Kolkata', state: 'West Bengal', coords: { lat: 22.5726, lng: 88.3639 } },
  'RJ': { name: 'Jaipur', state: 'Rajasthan', coords: { lat: 26.9124, lng: 75.7873 } },
  'UP': { name: 'Ghaziabad', state: 'Uttar Pradesh', coords: { lat: 28.6692, lng: 77.4538 } },
  'HR': { name: 'Gurgaon', state: 'Haryana', coords: { lat: 28.4595, lng: 77.0266 } },
  'AP': { name: 'Visakhapatnam', state: 'Andhra Pradesh', coords: { lat: 17.6868, lng: 83.2185 } },
  'TG': { name: 'Hyderabad', state: 'Telangana', coords: { lat: 17.3850, lng: 78.4867 } },
  'KL': { name: 'Kochi', state: 'Kerala', coords: { lat: 9.9312, lng: 76.2673 } },
  'PB': { name: 'Ludhiana', state: 'Punjab', coords: { lat: 30.9010, lng: 75.8573 } },
  'OR': { name: 'Bhubaneswar', state: 'Odisha', coords: { lat: 20.2961, lng: 85.8245 } }
};

export interface AlertEmail {
  district: string;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  radiance: number;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
  };
  plan?: string;
  yearOverYearChange?: number;
  districtCode?: string;
  hotspotCount?: number;
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'extreme': return '#dc2626'; // red-600
    case 'high': return '#ea580c'; // orange-600
    case 'medium': return '#d97706'; // amber-600
    case 'low': return '#65a30d'; // lime-600
    default: return '#6b7280'; // gray-500
  }
}

function getSeverityIcon(severity: string): string {
  switch (severity) {
    case 'extreme': return '🚨';
    case 'high': return '⚠️';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '📊';
  }
}

function getDistrictInfo(districtCode?: string) {
  if (districtCode && INDIAN_DISTRICTS[districtCode as keyof typeof INDIAN_DISTRICTS]) {
    return INDIAN_DISTRICTS[districtCode as keyof typeof INDIAN_DISTRICTS];
  }
  return null;
}

export async function sendAlertEmail(data: AlertEmail) {
  const { 
    district, 
    severity, 
    radiance, 
    timestamp, 
    location, 
    plan,
    yearOverYearChange,
    districtCode,
    hotspotCount 
  } = data;

  const districtInfo = getDistrictInfo(districtCode);
  const fullDistrictName = districtInfo ? `${districtInfo.name}, ${districtInfo.state}` : district;
  const severityColor = getSeverityColor(severity);
  const severityIcon = getSeverityIcon(severity);
  const detectionTime = new Date(timestamp);
  const urgencyLevel = severity === 'extreme' ? 'URGENT' : severity === 'high' ? 'HIGH PRIORITY' : 'STANDARD';
  
  // Calculate surface brightness in magnitude per square arcsecond
  const magPerSqArcsec = radiance > 0 ? (22.0 - 2.5 * Math.log10(radiance)) : 0;

  const subject = `[${urgencyLevel}] Light Pollution Alert: ${severity.toUpperCase()} detected in ${fullDistrictName}`;
  
  const defaultPlan = severity === 'extreme' 
    ? `IMMEDIATE ACTIONS REQUIRED:
1. Deploy field inspection team within 24 hours
2. Identify and assess commercial/industrial lighting sources
3. Issue compliance notices for excessive lighting
4. Coordinate with power utilities for emergency dimming protocols
5. Monitor hourly radiance levels for next 48 hours`
    : `STANDARD MITIGATION PROTOCOL:
1. Schedule nighttime field survey within 7 days
2. Identify unshielded or poorly aimed light fixtures
3. Engage with local businesses and residents
4. Recommend LED retrofits with proper shielding
5. Install timer controls for non-essential lighting`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Light Pollution Alert</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">
                ${severityIcon} Light Pollution Monitoring System
            </h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">
                Ministry of Environment, Forest and Climate Change
            </p>
        </div>

        <!-- Alert Badge -->
        <div style="background: ${severityColor}; color: white; padding: 12px; text-align: center; font-weight: 600; font-size: 16px;">
            ${urgencyLevel} - ${severity.toUpperCase()} SEVERITY ALERT
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 25px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            
            <!-- Location Header -->
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid ${severityColor};">
                <h2 style="margin: 0 0 5px 0; color: #1f2937; font-size: 20px;">
                    📍 ${fullDistrictName}
                </h2>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    District Code: ${districtCode || 'N/A'} | Detection: ${detectionTime.toLocaleString('en-IN', { 
                      timeZone: 'Asia/Kolkata',
                      dateStyle: 'full',
                      timeStyle: 'medium'
                    })}
                </p>
            </div>

            <!-- Key Metrics -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #f59e0b;">
                    <div style="font-size: 24px; font-weight: bold; color: #92400e; margin-bottom: 5px;">
                        ${radiance.toFixed(1)}
                    </div>
                    <div style="font-size: 12px; color: #78350f; font-weight: 500;">
                        nW/cm²/sr
                    </div>
                </div>

                <div style="background: #ede9fe; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #8b5cf6;">
                    <div style="font-size: 24px; font-weight: bold; color: #5b21b6; margin-bottom: 5px;">
                        ${magPerSqArcsec.toFixed(1)}
                    </div>
                    <div style="font-size: 12px; color: #4c1d95; font-weight: 500;">
                        mag/arcsec²
                    </div>
                </div>

                ${yearOverYearChange !== undefined ? `
                <div style="background: ${yearOverYearChange > 0 ? '#fecaca' : '#d1fae5'}; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid ${yearOverYearChange > 0 ? '#ef4444' : '#10b981'};">
                    <div style="font-size: 24px; font-weight: bold; color: ${yearOverYearChange > 0 ? '#b91c1c' : '#047857'}; margin-bottom: 5px;">
                        ${yearOverYearChange > 0 ? '+' : ''}${yearOverYearChange.toFixed(1)}%
                    </div>
                    <div style="font-size: 12px; color: ${yearOverYearChange > 0 ? '#7f1d1d' : '#064e3b'}; font-weight: 500;">
                        YoY Change
                    </div>
                </div>
                ` : ''}

                ${hotspotCount !== undefined ? `
                <div style="background: #dbeafe; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #3b82f6;">
                    <div style="font-size: 24px; font-weight: bold; color: #1d4ed8; margin-bottom: 5px;">
                        ${hotspotCount}
                    </div>
                    <div style="font-size: 12px; color: #1e3a8a; font-weight: 500;">
                        Active Hotspots
                    </div>
                </div>
                ` : ''}
            </div>

            <!-- Location Details -->
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 16px;">
                    🗺️ Precise Location
                </h3>
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                    <div style="color: #6b7280; font-family: 'Courier New', monospace; font-size: 14px;">
                        ${location.lat.toFixed(6)}°N, ${location.lng.toFixed(6)}°E
                    </div>
                    <a href="https://www.google.com/maps?q=${location.lat},${location.lng}" 
                       target="_blank" 
                       style="background: #3b82f6; color: white; padding: 8px 12px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 500;">
                        📍 View on Maps
                    </a>
                </div>
            </div>

            <!-- Action Plan -->
            <div style="background: #f0fdf4; padding: 20px; border-radius: 6px; border-left: 4px solid #22c55e; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #14532d; font-size: 16px;">
                    🎯 Immediate Action Plan
                </h3>
                <div style="color: #166534; font-size: 14px; line-height: 1.6; white-space: pre-line;">
${plan || defaultPlan}
                </div>
            </div>

            <!-- Technical Notes -->
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                <h4 style="margin: 0 0 10px 0; color: #374151; font-size: 14px; font-weight: 600;">
                    📋 Technical Information
                </h4>
                <ul style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                    <li>Satellite Data: VIIRS/DMSP Night-time Lights</li>
                    <li>Threshold: ${severity === 'extreme' ? '>30' : severity === 'high' ? '25-30' : severity === 'medium' ? '20-25' : '<20'} nW/cm²/sr</li>
                    <li>Detection Method: Automated AI Analysis</li>
                    <li>Confidence Level: ${severity === 'extreme' || severity === 'high' ? 'High (>95%)' : 'Standard (>85%)'}</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p style="margin: 0 0 5px 0;">
                🤖 This is an automated alert from the INFINITY LOOP System
            </p>
            <p style="margin: 0;">
                For technical support: lightpollution@gov.in | Emergency: 1800-XXX-XXXX
            </p>
        </div>
    </body>
    </html>
  `;

  const text = `
LIGHT POLLUTION MONITORING SYSTEM ALERT
Ministry of Environment, Forest and Climate Change

${urgencyLevel} - ${severity.toUpperCase()} SEVERITY DETECTED

Location: ${fullDistrictName}
District Code: ${districtCode || 'N/A'}
Detection Time: ${detectionTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

MEASUREMENTS:
- Radiance Level: ${radiance.toFixed(1)} nW/cm²/sr
- Surface Brightness: ${magPerSqArcsec.toFixed(1)} mag/arcsec²${yearOverYearChange !== undefined ? `
- Year-over-Year Change: ${yearOverYearChange > 0 ? '+' : ''}${yearOverYearChange.toFixed(1)}%` : ''}${hotspotCount !== undefined ? `
- Active Hotspots in Area: ${hotspotCount}` : ''}

PRECISE COORDINATES:
${location.lat.toFixed(6)}°N, ${location.lng.toFixed(6)}°E
Google Maps: https://www.google.com/maps?q=${location.lat},${location.lng}

ACTION PLAN:
${plan || defaultPlan}

TECHNICAL INFO:
- Data Source: VIIRS/DMSP Night-time Lights
- Threshold: ${severity === 'extreme' ? '>30' : severity === 'high' ? '25-30' : severity === 'medium' ? '20-25' : '<20'} nW/cm²/sr
- Detection: Automated AI Analysis
- Confidence: ${severity === 'extreme' || severity === 'high' ? 'High (>95%)' : 'Standard (>85%)'}

This is an automated alert from the INFINITY LOOP System.
For support: lightpollution@gov.in | Emergency: 1800-XXX-XXXX
  `;

  try {
    const result = await sendEmail({
      to: process.env.MUNICIPALITY_EMAIL || 'admin@example.com',
      subject,
      text,
      html
    });
    
    console.log(`✅ Alert email sent for ${fullDistrictName}:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send alert email for ${fullDistrictName}:`, error);
    throw error;
  }
}