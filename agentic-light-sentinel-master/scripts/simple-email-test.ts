/**
 * Simple Email Test - Manual Configuration
 * Use this after setting up your Gmail App Password
 */

import nodemailer from 'nodemailer';
import { config } from 'dotenv';

// Load environment variables
config();

async function testEmail() {
  console.log('📧 TESTING EMAIL CONFIGURATION...\n');
  
  const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };
  
  console.log('Configuration:');
  console.log(`- Host: ${smtpConfig.host}`);
  console.log(`- Port: ${smtpConfig.port}`);
  console.log(`- User: ${smtpConfig.auth.user}`);
  console.log(`- Password: ${smtpConfig.auth.pass ? '***' + smtpConfig.auth.pass.slice(-4) : 'NOT SET'}\n`);
  
  const transporter = nodemailer.createTransport(smtpConfig);
  
  try {
    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
    
    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: '🎉 Light Pollution Sentinel - Email Test Successful!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            🌟 Email Test Successful!
          </h2>
          
          <p style="font-size: 16px; color: #374151;">
            Great news! Your Light Pollution Sentinel email system is working correctly.
          </p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: white;">🚀 System Ready</h3>
            <p style="margin-bottom: 0; color: #e5e7eb;">
              Your application can now send:
            </p>
            <ul style="color: #e5e7eb;">
              <li>Real-time light pollution alerts</li>
              <li>Weekly summary reports</li>
              <li>System health notifications</li>
              <li>Data processing updates</li>
            </ul>
          </div>
          
          <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
            <p style="margin: 0; color: #065f46; font-weight: 500;">
              ✅ Email configuration verified at ${new Date().toLocaleString()}
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            This email was sent from your Light Pollution Sentinel application<br>
            <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">localhost:3000</code>
          </p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
    console.log('\n🎉 EMAIL SETUP COMPLETE!');
    console.log('Check your inbox for the test email.');
    
  } catch (error: any) {
    console.log('❌ Email test failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 AUTHENTICATION ERROR - Try this:');
      console.log('1. Go to https://myaccount.google.com/apppasswords');
      console.log('2. Generate a NEW App Password');
      console.log('3. Update SMTP_PASS in your .env.local file');
      console.log('4. Make sure the password is 16 characters (no spaces)');
      console.log('5. Restart your application');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 CONNECTION ERROR - Check your internet connection');
    } else {
      console.log('\n🔧 OTHER ERROR - Check your configuration');
    }
  }
}

testEmail().catch(console.error);