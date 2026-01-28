#!/usr/bin/env node
/**
 * SMTP Credential Test Script
 * Run with: node smtp-test.js
 */

import nodemailer from 'nodemailer';
import { config } from 'dotenv';

// Load environment variables
config();

console.log('🔍 SMTP Configuration Test\n');

// 1. Environment Variable Check
console.log('📋 Environment Variables:');
console.log(`SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
console.log(`SMTP_PORT: ${process.env.SMTP_PORT || 'NOT SET'}`);
console.log(`SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '***SET***' : 'NOT SET'}\n`);

// 2. Test different port configurations
const configurations = [
  {
    name: 'Gmail TLS (Port 587)',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Gmail SSL (Port 465)',
    config: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  }
];

async function testConfiguration(name, config) {
  console.log(`\n🧪 Testing: ${name}`);
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter(config);
    
    // Verify connection
    console.log('   📡 Verifying connection...');
    await transporter.verify();
    console.log('   ✅ Connection verified successfully!');
    
    // Send test email
    console.log('   📧 Sending test email...');
    const info = await transporter.sendMail({
      from: `"Test Email" <${process.env.SMTP_USER}>`,
      to: 'test@example.com', // Change this to your test email
      subject: `SMTP Test - ${name} - ${new Date().toISOString()}`,
      html: `
        <h2>🎉 SMTP Test Successful!</h2>
        <p><strong>Configuration:</strong> ${name}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>From:</strong> ${process.env.SMTP_USER}</p>
        <hr>
        <p>This email confirms that your SMTP configuration is working correctly.</p>
      `
    });
    
    console.log('   ✅ Email sent successfully!');
    console.log('   📩 Message ID:', info.messageId);
    console.log('   📤 Response:', info.response);
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
    console.log('   🔍 Error details:');
    console.log('     - Code:', error.code);
    console.log('     - Response Code:', error.responseCode);
    console.log('     - Command:', error.command);
    
    return { success: false, error: error.message };
  }
}

async function main() {
  // Test all configurations
  const results = [];
  
  for (const { name, config } of configurations) {
    const result = await testConfiguration(name, config);
    results.push({ name, ...result });
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('=' * 50);
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`     Error: ${result.error}`);
    }
  });
  
  const successful = results.filter(r => r.success);
  if (successful.length > 0) {
    console.log(`\n🎉 ${successful.length} configuration(s) working!`);
    console.log('💡 Use the first successful configuration in your app.');
  } else {
    console.log('\n⚠️  No configurations worked. Check:');
    console.log('   1. Gmail App Password is correctly set');
    console.log('   2. 2-Factor Authentication is enabled');
    console.log('   3. Account credentials are correct');
    console.log('   4. Gmail "Less secure apps" is handled via App Passwords');
  }
}

// Manual connection test using raw sockets
async function testRawConnection() {
  console.log('\n🔌 Testing raw SMTP connection...');
  
  const net = await import('net');
  const socket = new net.Socket();
  
  return new Promise((resolve, reject) => {
    socket.setTimeout(10000);
    
    socket.connect(587, 'smtp.gmail.com', () => {
      console.log('   ✅ Raw socket connection successful to smtp.gmail.com:587');
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', (err) => {
      console.log('   ❌ Raw socket connection failed:', err.message);
      reject(err);
    });
    
    socket.on('timeout', () => {
      console.log('   ⏰ Connection timeout');
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
  });
}

// Run tests
(async () => {
  try {
    await testRawConnection();
    await main();
  } catch (error) {
    console.error('Test script failed:', error);
    process.exit(1);
  }
})();