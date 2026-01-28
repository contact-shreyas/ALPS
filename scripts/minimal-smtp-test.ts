/**
 * Minimal Standalone SMTP Test
 * Tests SMTP credentials without any project dependencies
 * 
 * Usage:
 * 1. npm install nodemailer @types/nodemailer
 * 2. npx tsx scripts/minimal-smtp-test.ts
 */

import nodemailer from 'nodemailer';
import { config } from 'dotenv';

// Load environment variables
config();

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  data?: any;
}

class SMTPTester {
  private results: TestResult[] = [];
  
  private addResult(test: string, success: boolean, message: string, data?: any) {
    this.results.push({ test, success, message, data });
    const status = success ? '✅' : '❌';
    console.log(`${status} ${test}: ${message}`);
    if (data) {
      console.log('   📊 Data:', JSON.stringify(data, null, 2));
    }
  }
  
  async testEnvironmentVariables() {
    const requiredVars = {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS
    };
    
    const missing = Object.entries(requiredVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missing.length === 0) {
      this.addResult(
        'Environment Variables',
        true,
        'All required SMTP variables are set',
        requiredVars
      );
      return true;
    } else {
      this.addResult(
        'Environment Variables',
        false,
        `Missing variables: ${missing.join(', ')}`,
        requiredVars
      );
      return false;
    }
  }
  
  async testGmailConfiguration(port: number, secure: boolean) {
    const configName = secure ? `Gmail SSL (Port ${port})` : `Gmail TLS (Port ${port})`;
    
    try {
      const transportConfig: any = {
        host: 'smtp.gmail.com',
        port: port,
        secure: secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      };
      
      // Add TLS config for port 587
      if (port === 587) {
        transportConfig.requireTLS = true;
        transportConfig.tls = {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        };
      }
      
      const transporter = nodemailer.createTransporter(transportConfig);
      
      // Test connection
      await transporter.verify();
      
      this.addResult(
        configName,
        true,
        'Connection verified successfully'
      );
      
      return { success: true, transporter };
    } catch (error: any) {
      this.addResult(
        configName,
        false,
        error.message,
        {
          code: error.code,
          responseCode: error.responseCode,
          command: error.command
        }
      );
      
      return { success: false, error };
    }
  }
  
  async testEmailSending(transporter: any, testEmail: string = 'test@example.com') {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: testEmail,
        subject: `SMTP Test - ${new Date().toISOString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2E8B57;">🎉 SMTP Test Successful!</h2>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li><strong>From:</strong> ${process.env.SMTP_USER}</li>
              <li><strong>To:</strong> ${testEmail}</li>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
              <li><strong>Host:</strong> ${process.env.SMTP_HOST}</li>
              <li><strong>Port:</strong> ${process.env.SMTP_PORT}</li>
            </ul>
            <p>✅ Your SMTP configuration is working correctly!</p>
            <hr>
            <p><small>This is an automated test email from your Light Pollution Sentinel system.</small></p>
          </div>
        `
      };
      
      const info = await transporter.sendMail(mailOptions);
      
      this.addResult(
        'Email Sending',
        true,
        'Email sent successfully',
        {
          messageId: info.messageId,
          response: info.response,
          accepted: info.accepted,
          rejected: info.rejected
        }
      );
      
      return { success: true, info };
    } catch (error: any) {
      this.addResult(
        'Email Sending',
        false,
        error.message,
        {
          code: error.code,
          responseCode: error.responseCode,
          response: error.response
        }
      );
      
      return { success: false, error };
    }
  }
  
  async runFullTest(testEmail: string = 'test@example.com') {
    console.log('🧪 MINIMAL SMTP TEST SUITE');
    console.log('==================================================\n');
    
    // 1. Check environment variables
    const envCheck = await this.testEnvironmentVariables();
    if (!envCheck) {
      console.log('\n❌ Cannot proceed without required environment variables');
      return this.printSummary();
    }
    
    console.log('\n📡 Testing SMTP Configurations...\n');
    
    // 2. Test Gmail configurations
    const gmailConfigs = [
      { port: 587, secure: false },  // TLS
      { port: 465, secure: true }    // SSL
    ];
    
    let workingTransporter = null;
    
    for (const config of gmailConfigs) {
      const result = await this.testGmailConfiguration(config.port, config.secure);
      if (result.success) {
        workingTransporter = result.transporter;
        break; // Use first working configuration
      }
    }
    
    // 3. Test email sending if we have a working transporter
    if (workingTransporter) {
      console.log('\n📧 Testing Email Sending...\n');
      await this.testEmailSending(workingTransporter, testEmail);
    } else {
      this.addResult(
        'Email Sending',
        false,
        'Skipped - no working SMTP configuration found'
      );
    }
    
    return this.printSummary();
  }
  
  printSummary() {
    console.log('\n📊 TEST SUMMARY');
    console.log('==================================================');
    
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    
    console.log(`\n🎯 Results: ${passed}/${total} tests passed\n`);
    
    this.results.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.test}`);
    });
    
    if (passed === total) {
      console.log('\n🎉 All tests passed! Your SMTP configuration is working.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the following:');
      console.log('   1. Gmail App Password is correctly set (not your regular password)');
      console.log('   2. 2-Factor Authentication is enabled on your Gmail account');
      console.log('   3. Account credentials are correct in .env file');
      console.log('   4. Account is not locked or restricted');
      console.log('\n💡 For Gmail setup:');
      console.log('   - Go to https://myaccount.google.com/security');
      console.log('   - Enable 2-Factor Authentication');
      console.log('   - Generate App Password for "Mail"');
      console.log('   - Use the App Password (not your regular password) in SMTP_PASS');
    }
    
    return { passed, total, success: passed === total };
  }
}

// Main execution
async function main() {
  const tester = new SMTPTester();
  
  // You can change the test email here
  const testEmail = process.argv[2] || 'test@example.com';
  
  if (testEmail !== 'test@example.com') {
    console.log(`📧 Using custom test email: ${testEmail}\n`);
  }
  
  const result = await tester.runFullTest(testEmail);
  process.exit(result.success ? 0 : 1);
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

export { SMTPTester };