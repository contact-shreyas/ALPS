#!/usr/bin/env node
/**
 * Test Script to verify email functionality
 * Run with: npx tsx scripts/test-email-debug.ts
 */

import { sendTestEmail, testEmailConnection } from '../src/lib/mailer-debug';

async function main() {
  console.log('🧪 EMAIL DEBUG TEST SUITE\n');
  console.log('==================================================');
  
  // 1. Test connection
  console.log('\n1️⃣  Testing Email Connection...');
  const connectionTest = await testEmailConnection();
  if (connectionTest.success) {
    console.log('✅ Connection test passed!');
  } else {
    console.log('❌ Connection test failed:', connectionTest.error);
  }
  
  // 2. Send test email
  console.log('\n2️⃣  Sending Test Email...');
  try {
    const result = await sendTestEmail('test@example.com'); // Change to your email
    console.log('✅ Test email result:', result);
  } catch (error) {
    console.error('❌ Test email failed:', error);
  }
  
  // 3. Environment check
  console.log('\n3️⃣  Environment Variables Check...');
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length === 0) {
    console.log('✅ All required environment variables are set');
  } else {
    console.log('❌ Missing environment variables:', missing);
  }
  
  console.log('\n📊 Test Summary Complete');
}

// Run the test
main().catch(console.error);