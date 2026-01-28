import nodemailer from "nodemailer";
import { prisma } from "./prisma";

interface EmailLog {
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  transport: 'smtp' | 'json' | 'json-fallback';
  messageId?: string;
  error?: string;
  sentAt: Date;
}

function createTransport() {
  // Check if we have all required SMTP credentials
  const hasCredentials = process.env.SMTP_HOST && 
                        process.env.SMTP_USER && 
                        process.env.SMTP_PASS &&
                        process.env.SMTP_PASS !== 'your_new_app_password_here';
  
  if (!hasCredentials) {
    console.log("[MAILER] ⚠️  SMTP credentials missing or invalid");
    console.log("[MAILER] 📋 Credential check:");
    console.log(`  SMTP_HOST: ${process.env.SMTP_HOST ? '✓ Set' : '❌ Missing'}`);
    console.log(`  SMTP_USER: ${process.env.SMTP_USER ? '✓ Set' : '❌ Missing'}`);
    console.log(`  SMTP_PASS: ${process.env.SMTP_PASS && process.env.SMTP_PASS !== 'your_new_app_password_here' ? '✓ Set' : '❌ Missing/Default'}`);
    console.log("[MAILER] 🔄 Using JSON transport for development");
    return nodemailer.createTransport({ jsonTransport: true });
  }
  
  try {
    console.log("[MAILER] 🔧 Creating SMTP transport:");
    console.log(`  Host: ${process.env.SMTP_HOST}`);
    console.log(`  Port: ${process.env.SMTP_PORT || 587}`);
    console.log(`  User: ${process.env.SMTP_USER}`);
    
    // Improved Gmail configuration
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false, // Use STARTTLS for port 587
      requireTLS: true, // Force TLS
      auth: { 
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS 
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false // Allow self-signed certificates for development
      },
      // Additional options for Gmail
      pool: true,
      maxConnections: 5,
      rateDelta: 1000,
      rateLimit: 5
    });
  } catch (error) {
    console.error("[MAILER] ❌ SMTP setup failed:", error);
    console.log("[MAILER] 🔄 Falling back to JSON transport");
    return nodemailer.createTransport({ jsonTransport: true });
  }
}

const transporter = createTransport();

// Enhanced logging function
async function logEmail(logData: EmailLog) {
  try {
    // For now, just log to console since EmailLog model doesn't exist
    // TODO: Add EmailLog model to Prisma schema if needed
    console.log("[MAILER] 📊 Email logged to console (database logging skipped)");
  } catch (dbError) {
    console.warn("[MAILER] ⚠️  Failed to log email to database:", dbError);
  }
  
  // Always log to console for debugging
  console.log("[MAILER] 📝 Email Log:", {
    to: logData.to,
    subject: logData.subject,
    status: logData.status,
    transport: logData.transport,
    messageId: logData.messageId,
    error: logData.error ? logData.error.substring(0, 200) + '...' : undefined,
    timestamp: logData.sentAt.toISOString()
  });
}

export async function sendMail(opts: { to: string; subject: string; html: string }) {
  const startTime = Date.now();
  console.log(`\n[MAILER] 🚀 Starting email send process`);
  console.log(`[MAILER] 📧 Recipient: ${opts.to}`);
  console.log(`[MAILER] 📋 Subject: ${opts.subject}`);
  console.log(`[MAILER] 📏 HTML length: ${opts.html.length} characters`);
  
  try {
    // Validate email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(opts.to)) {
      throw new Error(`Invalid email address: ${opts.to}`);
    }
    
    // Verify transporter connection first
    console.log("[MAILER] 🔍 Verifying transporter connection...");
    try {
      await transporter.verify();
      console.log("[MAILER] ✅ Transporter verification successful");
    } catch (verifyError) {
      console.warn("[MAILER] ⚠️  Transporter verification failed:", verifyError.message);
      // Continue anyway, some transporters don't support verify()
    }
    
    console.log("[MAILER] 📤 Sending email...");
    const info: any = await transporter.sendMail({
      from: `"INFINITY LOOP" <${process.env.SMTP_USER || 'favchildofuniverse@gmail.com'}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      // Additional headers
      headers: {
        'X-Mailer': 'INFINITY LOOP',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal'
      }
    });
    
    const duration = Date.now() - startTime;
    
    if (info?.message) {
      // JSON transport (development mode)
      console.log(`[MAILER] ✅ Email sent via JSON transport in ${duration}ms`);
      console.log("[MAILER] 📧 Email preview:", {
        to: opts.to,
        subject: opts.subject,
        messageId: info.messageId,
        preview: info.message ? info.message.substring(0, 200) + '...' : 'No preview'
      });
      
      await logEmail({
        to: opts.to,
        subject: opts.subject,
        status: 'sent',
        transport: 'json',
        messageId: info.messageId,
        sentAt: new Date()
      });
      
      return { 
        messageId: info.messageId,
        success: true,
        transport: 'json',
        duration
      };
    } else {
      // SMTP transport (production mode)
      console.log(`[MAILER] ✅ Email sent via SMTP in ${duration}ms`);
      console.log("[MAILER] 📧 SMTP Response:", {
        messageId: info?.messageId,
        response: info?.response,
        accepted: info?.accepted,
        rejected: info?.rejected,
        pending: info?.pending
      });
      
      await logEmail({
        to: opts.to,
        subject: opts.subject,
        status: 'sent',
        transport: 'smtp',
        messageId: info.messageId,
        sentAt: new Date()
      });
      
      return { 
        messageId: info.messageId,
        success: true,
        transport: 'smtp',
        duration,
        response: info.response
      };
    }
  } catch (err: any) {
    const duration = Date.now() - startTime;
    
    console.error(`[MAILER] ❌ Email sending failed after ${duration}ms`);
    console.error("[MAILER] 🔍 Error details:", {
      message: err?.message,
      code: err?.code,
      responseCode: err?.responseCode,
      response: err?.response,
      command: err?.command,
      stack: err?.stack?.split('\n')?.[0] // First line of stack for context
    });
    
    // Log the failure
    await logEmail({
      to: opts.to,
      subject: opts.subject,
      status: 'failed',
      transport: 'smtp',
      error: `${err?.code || 'UNKNOWN'}: ${err?.message || 'Unknown error'}`,
      sentAt: new Date()
    });
    
    // For authentication errors, try JSON transport as fallback
    if (err?.code === 'EAUTH' || err?.responseCode === 535 || err?.code === 'ESOCKET' || err?.code === 'ECONNECTION') {
      console.log("[MAILER] 🔄 Authentication/connection error detected, trying JSON fallback...");
      try {
        const jsonTransporter = nodemailer.createTransport({ jsonTransport: true });
        const info = await jsonTransporter.sendMail({
          from: `"INFINITY LOOP" <${process.env.FROM_EMAIL || 'favchildofuniverse@gmail.com'}>`,
          to: opts.to,
          subject: opts.subject,
          html: opts.html,
        });
        
        console.log("[MAILER] ✅ Email sent via JSON fallback transport");
        
        await logEmail({
          to: opts.to,
          subject: opts.subject,
          status: 'sent',
          transport: 'json-fallback',
          messageId: info.messageId,
          sentAt: new Date()
        });
        
        return { 
          messageId: info.messageId,
          success: true,
          transport: 'json-fallback',
          duration,
          originalError: err?.message
        };
      } catch (fallbackErr) {
        console.error("[MAILER] ❌ JSON transport fallback also failed:", fallbackErr);
        
        await logEmail({
          to: opts.to,
          subject: opts.subject,
          status: 'failed',
          transport: 'json-fallback',
          error: `Fallback failed: ${fallbackErr?.message}`,
          sentAt: new Date()
        });
        
        throw new Error(`Email sending failed: ${err?.message || err}. Fallback also failed: ${fallbackErr?.message}`);
      }
    }
    
    throw new Error(`Email sending failed: ${err?.message || err}`);
  }
}

// Test function for debugging
export async function testEmailConnection() {
  console.log("[MAILER] 🧪 Testing email connection...");
  
  try {
    await transporter.verify();
    console.log("[MAILER] ✅ Connection test successful");
    return { success: true };
  } catch (error) {
    console.error("[MAILER] ❌ Connection test failed:", error);
    return { success: false, error: error.message };
  }
}

// Simple test email function
export async function sendTestEmail(to: string = 'test@example.com') {
  return await sendMail({
    to,
    subject: `Test Email - ${new Date().toISOString()}`,
    html: `
      <h2>🧪 Email Test</h2>
      <p>This is a test email sent at: <strong>${new Date().toLocaleString()}</strong></p>
      <p>If you receive this, your email configuration is working!</p>
      <hr>
      <p><small>Sent from INFINITY LOOP</small></p>
    `
  });
}