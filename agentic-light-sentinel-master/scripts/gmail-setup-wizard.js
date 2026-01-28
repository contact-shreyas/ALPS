/**
 * Interactive Gmail App Password Setup
 * This script will guide you through setting up Gmail App Password
 */

console.log('🔐 GMAIL APP PASSWORD SETUP WIZARD');
console.log('====================================\n');

require('dotenv').config();

console.log('📋 Current Settings:');
console.log(`   Gmail Account: ${process.env.SMTP_USER || 'NOT SET'}`);
console.log(`   Current Password: ${process.env.SMTP_PASS ? '***SET***' : 'NOT SET'}`);
if (process.env.SMTP_PASS) {
  console.log(`   Password Length: ${process.env.SMTP_PASS.length} characters`);
}

console.log('\n🔧 Required Steps:');
console.log('');
console.log('1️⃣  Open Gmail Security Settings:');
console.log('   🔗 https://myaccount.google.com/security');
console.log('');
console.log('2️⃣  Enable 2-Step Verification (if not enabled):');
console.log('   ✅ Click "2-Step Verification"');
console.log('   ✅ Follow setup process');
console.log('');
console.log('3️⃣  Generate App Password:');
console.log('   🔗 https://myaccount.google.com/apppasswords');
console.log('   ✅ Select "Mail" as app');
console.log('   ✅ Select "Other (Custom name)" as device');
console.log('   ✅ Enter "Light Pollution Sentinel"');
console.log('   ✅ Click "Generate"');
console.log('');
console.log('4️⃣  Copy the 16-character password:');
console.log('   📝 Format looks like: abcd efgh ijkl mnop');
console.log('   📝 Or: abcdefghijklmnop (no spaces)');
console.log('');
console.log('5️⃣  Update your .env file:');
console.log('   📝 Change this line:');
console.log(`   SMTP_PASS=${process.env.SMTP_PASS || 'your_current_password'}`);
console.log('   📝 To this:');
console.log('   SMTP_PASS=your_new_app_password_here');
console.log('');
console.log('6️⃣  Test the configuration:');
console.log('   🧪 Run: npx tsx scripts/quick-email-test.ts');
console.log('');

// Test current configuration
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  console.log('🧪 Testing current configuration...');
  
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  transporter.verify()
    .then(() => {
      console.log('✅ SUCCESS! Your current configuration works!');
      console.log('🎉 No changes needed - emails should be working.');
    })
    .catch(error => {
      console.log('❌ Current configuration failed:');
      console.log(`   Error: ${error.message}`);
      
      if (error.responseCode === 535) {
        console.log('\n💡 Error 535 = Invalid App Password');
        console.log('   📝 Follow steps above to generate new App Password');
      } else if (error.code === 'EAUTH') {
        console.log('\n💡 Authentication Error');
        console.log('   📝 Check if 2FA is enabled and App Password is correct');
      } else {
        console.log('\n💡 Other Error');
        console.log('   📝 Check network connection and Gmail settings');
      }
    });
} else {
  console.log('⚠️  Environment variables not fully set.');
  console.log('   Please ensure SMTP_USER and SMTP_PASS are configured.');
}