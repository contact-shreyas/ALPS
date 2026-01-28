/**
 * Quick Email Test Script
 * Run with: npx tsx scripts/quick-email-test.ts
 */

import nodemailer from 'nodemailer';
import { config } from 'dotenv';

// Load environment variables
config();

async function quickEmailTest() {
  console.log('🚀 QUICK EMAIL TEST\n');
  
  // 1. Environment Check
  console.log('📋 Environment Variables:');
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || 'NOT SET'}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
  console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '***SET***' : 'NOT SET'}`);
  
  if (process.env.SMTP_PASS) {
    console.log(`   Password Length: ${process.env.SMTP_PASS.length} characters`);
  }
  
  // 2. Create Transport with your current settings
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // Use STARTTLS for port 587
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  });
  
  // 3. Test Connection
  console.log('🔍 Testing SMTP Connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP Connection successful!');
  } catch (error: any) {
    console.log('❌ SMTP Connection failed:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.code}`);
    console.log(`   Response Code: ${error.responseCode}`);
    console.log('\n💡 This usually means:');
    console.log('   - App Password is incorrect');
    console.log('   - 2FA is not enabled');
    console.log('   - Using regular password instead of App Password');
    return false;
  }
  
  // 4. Send Test Email
  console.log('\n📧 Sending test email...');
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'test@example.com', // Change this to your email for real test
      subject: `Email Test - ${new Date().toISOString()}`,
      html: `
        <h2>🎉 Email Test Successful!</h2>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>From:</strong> ${process.env.SMTP_USER}</p>
        <p>✅ Your Gmail configuration is working correctly!</p>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    
    return true;
  } catch (error: any) {
    console.log('❌ Email sending failed:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.code}`);
    console.log(`   Response Code: ${error.responseCode}`);
    return false;
  }
}

// Run the test
quickEmailTest()
  .then(success => {
    if (success) {
      console.log('\n🎉 ALL TESTS PASSED! Your email configuration is working.');
    } else {
      console.log('\n❌ Tests failed. Please check your Gmail App Password.');
      console.log('\n🔧 To fix:');
      console.log('   1. Go to https://myaccount.google.com/apppasswords');
      console.log('   2. Generate new App Password for Mail');
      console.log('   3. Update SMTP_PASS in your .env file');
      console.log('   4. Run this test again');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test script failed:', error);
    process.exit(1);
  });