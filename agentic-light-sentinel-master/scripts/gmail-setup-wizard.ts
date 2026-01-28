/**
 * Gmail Setup Wizard for Light Pollution Sentinel
 * This script helps configure Gmail for email notifications
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupGmail() {
  console.log('🚀 GMAIL SETUP WIZARD FOR LIGHT POLLUTION SENTINEL\n');
  
  console.log('📧 This wizard will help you configure Gmail for email notifications.\n');
  
  console.log('STEP 1: Enable 2-Factor Authentication');
  console.log('  1. Go to: https://myaccount.google.com/security');
  console.log('  2. Enable "2-Step Verification" if not already enabled\n');
  
  console.log('STEP 2: Generate App Password');
  console.log('  1. Go to: https://myaccount.google.com/apppasswords');
  console.log('  2. Select "Mail" as the app');
  console.log('  3. Select "Other" as the device');
  console.log('  4. Enter "Light Pollution Sentinel" as device name');
  console.log('  5. Click "Generate"');
  console.log('  6. Copy the 16-character password (no spaces)\n');
  
  // Get user input
  const email = await question('Enter your Gmail address: ');
  const appPassword = await question('Enter your Gmail App Password (16 characters): ');
  
  console.log('\n🔧 Testing configuration...');
  
  // Test the configuration
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: email,
      pass: appPassword
    }
  });
  
  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    const testEmail = {
      from: email,
      to: email,
      subject: '🎉 Light Pollution Sentinel - Email Setup Successful!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🌟 Email Configuration Successful!</h2>
          <p>Congratulations! Your Light Pollution Sentinel email system is now working correctly.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">What's Next?</h3>
            <ul style="color: #6b7280;">
              <li>Real-time light pollution alerts</li>
              <li>Weekly summary reports</li>
              <li>System health notifications</li>
              <li>Data processing updates</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            This email was sent from your Light Pollution Sentinel application running at localhost:3000
          </p>
        </div>
      `
    };
    
    console.log('📧 Sending test email...');
    await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    
    // Update .env.local file
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add email configuration
    const emailConfig = `
# Email Configuration (Updated by setup wizard)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=${email}
SMTP_PASS=${appPassword}
FROM_EMAIL=${email}
FROM_NAME="Light Pollution Sentinel"
ADMIN_EMAIL=${email}
MUNICIPALITY_EMAIL=${email}
`;
    
    // Remove existing email config if present
    envContent = envContent.replace(/# Email Configuration[\s\S]*?(?=\n#|\n[A-Z]|$)/g, '');
    envContent = envContent.replace(/SMTP_[A-Z_]*=.*\n/g, '');
    envContent = envContent.replace(/FROM_EMAIL=.*\n/g, '');
    envContent = envContent.replace(/MUNICIPALITY_EMAIL=.*\n/g, '');
    
    // Add new config
    envContent += emailConfig;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Configuration saved to .env.local');
    
    console.log('\n🎉 SETUP COMPLETE!');
    console.log('Your email system is now configured and working.');
    console.log('Check your email for the test message.');
    console.log('\nYou can now:');
    console.log('- Receive light pollution alerts');
    console.log('- Get system health notifications');
    console.log('- Receive weekly reports');
    
  } catch (error: any) {
    console.log('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure 2FA is enabled on your Google account');
    console.log('2. Use an App Password, not your regular Gmail password');
    console.log('3. The App Password should be 16 characters without spaces');
    console.log('4. Try generating a new App Password');
    console.log('\n📚 Help: https://support.google.com/accounts/answer/185833');
  }
  
  rl.close();
}

setupGmail().catch(console.error);