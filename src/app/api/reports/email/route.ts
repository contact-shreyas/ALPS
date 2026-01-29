import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '../../../../lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, state, reportType } = await request.json();

    console.log('[EMAIL API] Request received:', { email, state, reportType });

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Simple test data for now
    const reportData = {
      state: state === 'MH' ? 'Maharashtra' : state === 'DL' ? 'Delhi' : 'Test State',
      date: new Date().toISOString(),
      type: reportType || 'summary',
      metrics: {
        totalHotspots: 42,
        avgRadiance: 12.5,
        districtsWithAlerts: 3,
      },
      districts: reportType === 'detailed' ? [
        { name: 'Mumbai', currentRadiance: 15.2, hotspots: 8 },
        { name: 'Pune', currentRadiance: 11.8, hotspots: 5 },
        { name: 'Nashik', currentRadiance: 9.3, hotspots: 2 }
      ] : [],
    };

    console.log('[EMAIL API] Report data generated:', reportData);

    // Generate professional email HTML
    const emailHtml = generateReportEmailHTML(reportData);

    console.log('[EMAIL API] Sending email to:', email);

    // Send email using the mailer system
    const emailResult = await sendMail({
      to: email,
      subject: `Light Pollution Report - ${reportData.state} (${new Date().toLocaleDateString()})`,
      html: emailHtml,
    });

    console.log('[EMAIL API] Email result:', emailResult);

    return NextResponse.json({
      success: true,
      message: 'Report sent successfully',
      recipient: email,
      transport: emailResult.transport || 'smtp'
    });

  } catch (error) {
    console.error('Error sending report email:', error);
    return NextResponse.json(
      { error: 'Failed to send report email' },
      { status: 500 }
    );
  }
}

function generateReportEmailHTML(data: any): string {
  const { state, date, metrics, districts = [] } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Light Pollution Report - ${state}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .gov-logo {
            background: rgba(255,255,255,0.1);
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 10px;
            font-size: 12px;
            font-weight: bold;
        }
        .content {
            padding: 30px;
        }
        .metrics-grid {
            display: flex;
            gap: 15px;
            margin: 20px 0;
        }
        .metric-card {
            flex: 1;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        .metric-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
        }
        .district-list {
            margin-top: 20px;
        }
        .district-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            margin: 5px 0;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .alert-badge {
            background: #ff4757;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
        }
        .safe-badge {
            background: #2ed573;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
        }
        @media (max-width: 600px) {
            .metrics-grid {
                flex-direction: column;
            }
            .district-item {
                flex-direction: column;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="gov-logo">🇮🇳 GOVERNMENT OF INDIA</div>
            <h1>Light Pollution Report</h1>
            <h2>${state}</h2>
            <p>Generated on ${new Date(date).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</p>
        </div>
        
        <div class="content">
            <h3>📊 Key Metrics</h3>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${metrics.totalHotspots}</div>
                    <div class="metric-label">Total Hotspots</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${metrics.avgRadiance?.toFixed(1) || 'N/A'}</div>
                    <div class="metric-label">Avg Radiance</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${metrics.districtsWithAlerts || 0}</div>
                    <div class="metric-label">Districts w/ Alerts</div>
                </div>
            </div>
            
            ${districts.length > 0 ? `
            <h3>🏙️ District Details</h3>
            <div class="district-list">
                ${districts.map((district: any) => `
                <div class="district-item">
                    <div>
                        <strong>${district.name}</strong><br>
                        <small>Radiance: ${district.currentRadiance} | Hotspots: ${district.hotspots}</small>
                    </div>
                    <div>
                        ${district.hotspots > 5 ? 
                            '<span class="alert-badge">HIGH ALERT</span>' : 
                            '<span class="safe-badge">NORMAL</span>'
                        }
                    </div>
                </div>
                `).join('')}
            </div>
            ` : ''}
            
            <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #1976d2;">📋 Report Summary</h4>
                <p style="margin: 0; font-size: 14px;">
                    This automated report provides insights into light pollution levels across ${state}. 
                    Regular monitoring helps in environmental protection and sustainable development initiatives.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Ministry of Environment, Forest and Climate Change</strong></p>
            <p>Government of India | Light Pollution Monitoring System</p>
            <p>Generated automatically on ${new Date().toLocaleString('en-IN')}</p>
        </div>
    </div>
</body>
</html>
  `;
}