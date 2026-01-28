/**
 * Email Setup Debug and Helper
 * This helps troubleshoot Gmail configuration issues
 */

import { config } from 'dotenv';

// Load environment variables
config();

function debugEmailConfig() {
  console.log('🔍 EMAIL CONFIGURATION DEBUG\n');
  
  console.log('Current Configuration:');
  console.log(`- SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
  console.log(`- SMTP_PORT: ${process.env.SMTP_PORT || 'NOT SET'}`);
  console.log(`- SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
  console.log(`- SMTP_PASS: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'}`);
  
  if (process.env.SMTP_PASS) {
    console.log(`- Password Length: ${process.env.SMTP_PASS.length} characters`);
    console.log(`- Password First 4: ${process.env.SMTP_PASS.substring(0, 4)}****`);
    console.log(`- Password Last 4: ****${process.env.SMTP_PASS.slice(-4)}`);
    
    // Check for common issues
    const issues = [];
    if (process.env.SMTP_PASS.includes(' ')) {
      issues.push('❌ Password contains spaces - remove all spaces');
    }
    if (process.env.SMTP_PASS.length !== 16) {
      issues.push(`❌ Password length is ${process.env.SMTP_PASS.length}, should be 16 characters`);
    }
    if (!/^[a-z]+$/.test(process.env.SMTP_PASS)) {
      issues.push('❌ Password contains non-lowercase letters');
    }
    
    if (issues.length === 0) {
      console.log('✅ Password format looks correct');
    } else {
      console.log('\n🚨 Password Issues Found:');
      issues.forEach(issue => console.log(`   ${issue}`));
    }
  }
  
  console.log('\n📋 GMAIL APP PASSWORD SETUP CHECKLIST:');
  console.log('1. ✅ 2-Factor Authentication enabled on your Google account');
  console.log('2. ✅ Go to: https://myaccount.google.com/apppasswords');
  console.log('3. ✅ Select "Mail" as the app');
  console.log('4. ✅ Select "Other" as the device');
  console.log('5. ✅ Enter "INFINITY LOOP" as device name');
  console.log('6. ✅ Copy the 16-character password (example: abcdqrstuvwxyz)');
  console.log('7. ✅ Update .env.local file: SMTP_PASS=your16characterpassword');
  console.log('8. ✅ NO SPACES in the password');
  console.log('9. ✅ Only lowercase letters');
  
  console.log('\n💡 COMMON ISSUES:');
  console.log('- Using regular Gmail password instead of App Password');
  console.log('- 2FA not enabled on Google account');
  console.log('- Spaces in the App Password');
  console.log('- Uppercase letters in password (should be lowercase)');
  console.log('- Wrong length (must be exactly 16 characters)');
  
  console.log('\n🔧 WHAT TO DO:');
  console.log('1. Generate a BRAND NEW App Password');
  console.log('2. Delete the old App Password from Google');
  console.log('3. Copy the new password exactly (no spaces)');
  console.log('4. Update your .env.local file');
  console.log('5. Run the test again');
  
  console.log('\n✅ Expected working format in .env.local:');
  console.log('SMTP_USER=favchildofuniverse@gmail.com');
  console.log('SMTP_PASS=abcdqrstuvwxyz12  # (16 lowercase characters, no spaces)');
}

debugEmailConfig();