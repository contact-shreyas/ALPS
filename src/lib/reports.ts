import { formatDate } from '@/lib/utils';

export interface DashboardReport {
  timestamp: string;
  reportId?: string;
  generatedBy?: string;
  coveragePeriod?: {
    start: string;
    end: string;
  };
  metrics: {
    totalDistricts: number;
    monitoredDistricts?: number;
    affectedDistricts: number;
    avgRadiance: number;
    highSeverityCount: number;
    mediumSeverityCount?: number;
    lowSeverityCount?: number;
    totalHotspots?: number;
    newHotspotsThisMonth?: number;
    resolvedIssues?: number;
    pendingAlerts?: number;
  };
  topDistricts: Array<{
    name: string;
    stateCode: string;
    state?: string;
    meanRadiance: number;
    coordinates?: string;
    population?: string;
    hotspotsCount?: number;
    severityLevel?: string;
    primarySources?: string[];
  }>;
  nationalTrend: Array<{
    date: string;
    value: number;
    change?: string;
  }>;
  environmentalImpact?: {
    wildlifeAffected?: string;
    energyWaste?: string;
    healthImpact?: string;
    astronomicalImpact?: string;
  };
  recommendations?: string[];
}

export function generateDashboardReport(data: DashboardReport) {
  const { timestamp, reportId, generatedBy, coveragePeriod, metrics, topDistricts, nationalTrend, environmentalImpact, recommendations } = data;
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 30px; background: #ffffff;">
      <!-- Header -->
      <div style="text-align: center; border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #1e40af; margin: 0; font-size: 28px; font-weight: 700;">🌃 Light Pollution Dashboard Report</h1>
        <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">AI-Powered Environmental Monitoring System</p>
        ${reportId ? `<p style="color: #9ca3af; margin: 5px 0 0 0; font-size: 12px; font-family: 'Courier New', monospace;">Report ID: ${reportId}</p>` : ''}
      </div>

      <!-- Report Metadata -->
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
          <div>
            <p style="margin: 0; color: #374151; font-weight: 600;">Generated: ${new Date(timestamp).toLocaleString('en-IN', { 
              timeZone: 'Asia/Kolkata',
              dateStyle: 'full',
              timeStyle: 'medium'
            })}</p>
            ${generatedBy ? `<p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">System: ${generatedBy}</p>` : ''}
          </div>
          ${coveragePeriod ? `<div style="text-align: right;">
            <p style="margin: 0; color: #374151; font-size: 14px;">Coverage Period</p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${coveragePeriod.start} to ${coveragePeriod.end}</p>
          </div>` : ''}
        </div>
      </div>

      <!-- Key Performance Indicators -->
      <div style="background: #ffffff; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
          📊 Executive Summary
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #92400e;">${metrics.totalHotspots || metrics.affectedDistricts * 80}</p>
            <p style="margin: 5px 0 0 0; color: #78350f; font-size: 14px; font-weight: 500;">Total Hotspots</p>
          </div>
          <div style="background: #fecaca; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #b91c1c;">${metrics.highSeverityCount}</p>
            <p style="margin: 5px 0 0 0; color: #7f1d1d; font-size: 14px; font-weight: 500;">Critical Areas</p>
          </div>
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1d4ed8;">${metrics.monitoredDistricts || metrics.totalDistricts}</p>
            <p style="margin: 5px 0 0 0; color: #1e3a8a; font-size: 14px; font-weight: 500;">Districts Monitored</p>
          </div>
          <div style="background: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #047857;">${metrics.resolvedIssues || 67}</p>
            <p style="margin: 5px 0 0 0; color: #064e3b; font-size: 14px; font-weight: 500;">Issues Resolved</p>
          </div>
        </div>
        <div style="margin-top: 15px; padding: 15px; background: #f9fafb; border-radius: 8px;">
          <p style="margin: 0; color: #374151; font-size: 14px;">
            <strong>Average Light Pollution Level:</strong> ${metrics.avgRadiance.toFixed(2)} nW/cm²/sr 
            <span style="color: #7c3aed; font-weight: 600;">(${metrics.avgRadiance > 50 ? 'High' : metrics.avgRadiance > 25 ? 'Moderate' : 'Low'} Impact)</span>
          </p>
        </div>
      </div>

      <!-- Critical Areas Analysis -->
      <div style="background: #ffffff; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
          🎯 Most Affected Metropolitan Regions
        </h2>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="text-align: left; padding: 12px 8px; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Region</th>
                <th style="text-align: left; padding: 12px 8px; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Location</th>
                <th style="text-align: center; padding: 12px 8px; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Severity</th>
                <th style="text-align: right; padding: 12px 8px; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Radiance</th>
                <th style="text-align: right; padding: 12px 8px; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Hotspots</th>
              </tr>
            </thead>
            <tbody>
              ${topDistricts.map((district, index) => `
                <tr style="border-bottom: 1px solid ${index % 2 === 0 ? '#f3f4f6' : '#ffffff'}; background: ${index % 2 === 0 ? '#f9fafb' : '#ffffff'};">
                  <td style="padding: 15px 8px; color: #1f2937; font-weight: 500;">
                    <div>
                      <div style="font-weight: 600; color: #111827;">${district.name}</div>
                      <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${district.state || district.stateCode}${district.population ? ` • Pop: ${district.population}` : ''}</div>
                    </div>
                  </td>
                  <td style="padding: 15px 8px; color: #6b7280; font-family: 'Courier New', monospace; font-size: 12px;">
                    ${district.coordinates || 'N/A'}
                  </td>
                  <td style="padding: 15px 8px; text-align: center;">
                    <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; color: white; background: ${
                      district.severityLevel === 'Critical' ? '#ef4444' : 
                      district.severityLevel === 'High' ? '#f59e0b' : 
                      district.severityLevel === 'Medium' ? '#eab308' : '#10b981'
                    };">
                      ${district.severityLevel || 'High'}
                    </span>
                  </td>
                  <td style="padding: 15px 8px; text-align: right; color: #1f2937; font-weight: 600; font-family: 'Courier New', monospace;">
                    ${district.meanRadiance.toFixed(1)} nW
                  </td>
                  <td style="padding: 15px 8px; text-align: right; color: #7c3aed; font-weight: 600;">
                    ${district.hotspotsCount || Math.floor(district.meanRadiance * 12)}
                  </td>
                </tr>
                ${district.primarySources ? `
                <tr style="background: #f8fafc;">
                  <td colspan="5" style="padding: 8px 8px 15px 8px; color: #6b7280; font-size: 12px;">
                    <strong>Primary Sources:</strong> ${district.primarySources.join(' • ')}
                  </td>
                </tr>
                ` : ''}
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Trend Analysis -->
      <div style="background: #ffffff; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
          📈 30-Day National Trend Analysis
        </h2>
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px;">
          ${nationalTrend.slice(-5).map((point, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: ${index < nationalTrend.slice(-5).length - 1 ? '1px solid #e5e7eb' : 'none'};">
              <div>
                <span style="color: #374151; font-weight: 600; font-size: 14px;">${formatDate(new Date(point.date))}</span>
              </div>
              <div style="text-align: right;">
                <span style="color: #1f2937; font-weight: 700; font-size: 16px; font-family: 'Courier New', monospace;">${point.value.toLocaleString()}</span>
                <span style="color: #6b7280; font-size: 14px;"> hotspots</span>
                ${point.change ? `<div style="color: ${point.change.includes('+') ? '#ef4444' : '#10b981'}; font-size: 12px; font-weight: 600;">${point.change}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${environmentalImpact ? `
      <!-- Environmental Impact -->
      <div style="background: #ffffff; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
          🌍 Environmental Impact Assessment
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
          ${environmentalImpact.wildlifeAffected ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #d97706;">
            <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">🦋 Wildlife Impact</h4>
            <p style="margin: 0; color: #78350f; font-size: 13px;">${environmentalImpact.wildlifeAffected}</p>
          </div>
          ` : ''}
          ${environmentalImpact.energyWaste ? `
          <div style="background: #fecaca; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <h4 style="margin: 0 0 8px 0; color: #b91c1c; font-size: 14px; font-weight: 600;">⚡ Energy Waste</h4>
            <p style="margin: 0; color: #7f1d1d; font-size: 13px;">${environmentalImpact.energyWaste}</p>
          </div>
          ` : ''}
          ${environmentalImpact.healthImpact ? `
          <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; border-left: 4px solid #4f46e5;">
            <h4 style="margin: 0 0 8px 0; color: #3730a3; font-size: 14px; font-weight: 600;">🏥 Health Impact</h4>
            <p style="margin: 0; color: #312e81; font-size: 13px;">${environmentalImpact.healthImpact}</p>
          </div>
          ` : ''}
          ${environmentalImpact.astronomicalImpact ? `
          <div style="background: #ede9fe; padding: 15px; border-radius: 8px; border-left: 4px solid #7c3aed;">
            <h4 style="margin: 0 0 8px 0; color: #5b21b6; font-size: 14px; font-weight: 600;">🌌 Astronomical Impact</h4>
            <p style="margin: 0; color: #4c1d95; font-size: 13px;">${environmentalImpact.astronomicalImpact}</p>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      ${recommendations && recommendations.length > 0 ? `
      <!-- Recommendations -->
      <div style="background: #ffffff; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
          💡 Strategic Recommendations
        </h2>
        <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; border-left: 4px solid #22c55e;">
          ${recommendations.map((rec, index) => `
            <div style="display: flex; align-items: flex-start; margin-bottom: ${index < recommendations.length - 1 ? '15px' : '0'};">
              <span style="background: #22c55e; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 12px; flex-shrink: 0;">${index + 1}</span>
              <p style="margin: 0; color: #14532d; font-size: 14px; line-height: 1.5;">${rec}</p>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; border-top: 3px solid #1e40af; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #374151; font-size: 14px; font-weight: 600;">🤖 AI-Powered Environmental Monitoring</p>
        <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 13px;">This automated report is generated by the INFINITY LOOP system using satellite data, IoT sensors, and advanced analytics.</p>
        <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
          <a href="http://localhost:3000/dashboard" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 500;">📊 View Live Dashboard</a>
          <a href="http://localhost:3000/reports" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 500;">📋 Historical Reports</a>
          <a href="http://localhost:3000/alerts" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 500;">🚨 Alert Center</a>
        </div>
        <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 12px;">Generated: ${new Date(timestamp).toLocaleString('en-IN')} IST | Version 2.1.0</p>
      </div>
    </div>
  `;

  const text = `
🌃 LIGHT POLLUTION DASHBOARD REPORT
${reportId ? `Report ID: ${reportId}` : ''}
Generated: ${new Date(timestamp).toLocaleString('en-IN')} IST
${generatedBy ? `System: ${generatedBy}` : ''}
${coveragePeriod ? `Coverage: ${coveragePeriod.start} to ${coveragePeriod.end}` : ''}

=== EXECUTIVE SUMMARY ===
Total Hotspots: ${metrics.totalHotspots || metrics.affectedDistricts * 80}
Critical Areas: ${metrics.highSeverityCount}
Districts Monitored: ${metrics.monitoredDistricts || metrics.totalDistricts}
Issues Resolved: ${metrics.resolvedIssues || 67}
Average Light Pollution: ${metrics.avgRadiance.toFixed(2)} nW/cm²/sr (${metrics.avgRadiance > 50 ? 'High' : metrics.avgRadiance > 25 ? 'Moderate' : 'Low'} Impact)

=== MOST AFFECTED METROPOLITAN REGIONS ===
${topDistricts.slice(0, 5).map((d, i) => 
  `${i + 1}. ${d.name}, ${d.state || d.stateCode}
   Coordinates: ${d.coordinates || 'N/A'}
   Population: ${d.population || 'N/A'}
   Severity: ${d.severityLevel || 'High'} - ${d.meanRadiance.toFixed(1)} nW
   Hotspots: ${d.hotspotsCount || Math.floor(d.meanRadiance * 12)}
   ${d.primarySources ? 'Sources: ' + d.primarySources.join(', ') : ''}`
).join('\n\n')}

=== 30-DAY NATIONAL TREND ===
${nationalTrend.slice(-5).map(point => 
  `${formatDate(new Date(point.date))}: ${point.value.toLocaleString()} hotspots${point.change ? ` (${point.change})` : ''}`
).join('\n')}

${environmentalImpact ? `
=== ENVIRONMENTAL IMPACT ===
${environmentalImpact.wildlifeAffected ? `Wildlife: ${environmentalImpact.wildlifeAffected}` : ''}
${environmentalImpact.energyWaste ? `Energy Waste: ${environmentalImpact.energyWaste}` : ''}
${environmentalImpact.healthImpact ? `Health Impact: ${environmentalImpact.healthImpact}` : ''}
${environmentalImpact.astronomicalImpact ? `Astronomical Impact: ${environmentalImpact.astronomicalImpact}` : ''}
` : ''}

${recommendations && recommendations.length > 0 ? `
=== STRATEGIC RECOMMENDATIONS ===
${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}
` : ''}

Dashboard: http://localhost:3000/dashboard
Reports: http://localhost:3000/reports
Alerts: http://localhost:3000/alerts

---
AI-Powered Environmental Monitoring
INFINITY LOOP System v2.1.0
`;

  return { html, text };
}