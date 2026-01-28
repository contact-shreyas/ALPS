import nodemailer from "nodemailer";

function createTransport() {
  // Check if we have all required SMTP credentials
  const hasCredentials = process.env.SMTP_HOST && 
                        process.env.SMTP_USER && 
                        process.env.SMTP_PASS &&
                        process.env.SMTP_PASS !== 'your_new_app_password_here';
  
  if (!hasCredentials) {
    console.log("[MAILER] SMTP credentials missing or invalid, using JSON transport for development");
    return nodemailer.createTransport({ jsonTransport: true });
  }
  
  try {
    console.log("[MAILER] Attempting SMTP connection to:", process.env.SMTP_HOST);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false, // Use TLS
      auth: { 
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS 
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates for development
      }
    });
  } catch (error) {
    console.log("[MAILER] SMTP setup failed, using JSON transport:", error);
    return nodemailer.createTransport({ jsonTransport: true });
  }
}

const transporter = createTransport();

export async function sendMail(opts: { to: string; subject: string; html: string }) {
  try {
    console.log(`[MAILER] Attempting to send email to: ${opts.to}`);
    
    const info: any = await transporter.sendMail({
      from: `"INFINITY LOOP" <${process.env.FROM_EMAIL || 'favchildofuniverse@gmail.com'}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    
    if (info?.message) {
      // JSON transport (development mode)
      console.log("[MAILER] ✅ Email sent via JSON transport (development mode)");
      console.log("[MAILER] Email preview:", {
        to: opts.to,
        subject: opts.subject,
        messageId: info.messageId
      });
      return { 
        messageId: info.messageId,
        success: true,
        transport: 'json'
      };
    } else {
      // SMTP transport (production mode)
      console.log("[MAILER] ✅ Email sent via SMTP:", info?.messageId);
      return { 
        messageId: info.messageId,
        success: true,
        transport: 'smtp'
      };
    }
  } catch (err: any) {
    console.error("[MAILER] ❌ Email sending failed:", err?.message || err);
    
    // For authentication errors, try JSON transport as fallback
    if (err?.code === 'EAUTH' || err?.responseCode === 535 || err?.code === 'ESOCKET') {
      console.log("[MAILER] 🔄 Falling back to JSON transport due to SMTP error");
      try {
        const jsonTransporter = nodemailer.createTransport({ jsonTransport: true });
        const info = await jsonTransporter.sendMail({
          from: `"INFINITY LOOP" <${process.env.FROM_EMAIL || 'favchildofuniverse@gmail.com'}>`,
          to: opts.to,
          subject: opts.subject,
          html: opts.html,
        });
        console.log("[MAILER] ✅ Email sent via JSON fallback transport");
        return { 
          messageId: info.messageId,
          success: true,
          transport: 'json-fallback'
        };
      } catch (fallbackErr) {
        console.error("[MAILER] ❌ JSON transport fallback also failed:", fallbackErr);
        throw new Error(`Email sending failed: ${err?.message || err}`);
      }
    }
    
    throw new Error(`Email sending failed: ${err?.message || err}`);
  }
}

