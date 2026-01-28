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

export interface AlertEmail {
  district: string;
  severity: 'low' | 'medium' | 'high';
  radiance: number;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
  };
  plan?: string;
}

export async function sendAlertEmail(data: AlertEmail) {
  const { district, severity, radiance, timestamp, location, plan } = data;

  const defaultPlan = `Recommended actions:
1. Survey the area during nighttime to identify specific sources
2. Check for unshielded or poorly aimed lights
3. Consider replacing with downward-facing LED fixtures
4. Add timers or motion sensors where appropriate`;

  const subject = `Light Pollution Alert: ${severity.toUpperCase()} level detected in ${district}`;
  
  const html = `
    <h2>Light Pollution Alert</h2>
    <p>A ${severity} level of light pollution has been detected in ${district}.</p>
    
    <h3>Details:</h3>
    <ul>
      <li>Radiance Level: ${radiance.toFixed(2)} nW/cm²/sr</li>
      <li>Detected at: ${new Date(timestamp).toLocaleString()}</li>
      <li>Location: <a href="https://www.google.com/maps?q=${location.lat},${location.lng}" target="_blank">
        ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
      </a></li>
    </ul>

    <h3>Action Plan:</h3>
    <pre>${plan || defaultPlan}</pre>

    <p>Please investigate this area and implement appropriate mitigation measures.</p>

    <hr>
    <small>This is an automated alert from the INFINITY LOOP system.</small>
  `;

  const text = `
Light Pollution Alert

A ${severity} level of light pollution has been detected in ${district}.

Details:
- Radiance Level: ${radiance.toFixed(2)} nW/cm²/sr
- Detected at: ${new Date(timestamp).toLocaleString()}
- Location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
  Google Maps: https://www.google.com/maps?q=${location.lat},${location.lng}

Action Plan:
${plan || defaultPlan}

Please investigate this area and implement appropriate mitigation measures.

--
This is an automated alert from the INFINITY LOOP system.
  `;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.MUNICIPALITY_EMAIL,
    subject,
    text,
    html
  });
}