import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { debugEmailSystem } from "./notify-improved";

async function runDiagnostics() {
  console.log(`🔍 Light Pollution Sentinel - Email System Diagnostics`);
  console.log(`==================================================`);
  console.log(`Started at: ${new Date().toISOString()}\n`);
  
  try {
    // 1. Environment Check
    console.log(`1️⃣ ENVIRONMENT VARIABLES CHECK`);
    console.log(`─────────────────────────────────`);
    const envVars = [
      'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 
      'MUNICIPALITY_EMAIL', 'DATABASE_URL', 'CRON_SECRET'
    ];
    
    envVars.forEach(varName => {
      const value = process.env[varName];
      const status = value ? '✅' : '❌';
      const display = varName.includes('PASS') || varName.includes('SECRET') 
        ? (value ? '[HIDDEN]' : 'NOT SET')
        : (value || 'NOT SET');
      console.log(`  ${status} ${varName}: ${display}`);
    });
    
    // 2. Database Connectivity
    console.log(`\n2️⃣ DATABASE CONNECTIVITY CHECK`);
    console.log(`─────────────────────────────────`);
    try {
      const alertCount = await prisma.alert.count();
      const unsentCount = await prisma.alert.count({ where: { sentAt: null } });
      const hotspotCount = await prisma.hotspot.count();
      
      console.log(`  ✅ Database connection: OK`);
      console.log(`  📊 Total alerts: ${alertCount}`);
      console.log(`  📤 Unsent alerts: ${unsentCount}`);
      console.log(`  🔥 Total hotspots: ${hotspotCount}`);
      
      // Check if we have recent data
      const recentAlerts = await prisma.alert.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`  📅 Recent alerts (24h): ${recentAlerts.length}`);
      if (recentAlerts.length > 0) {
        console.log(`    Latest: ${recentAlerts[0].createdAt.toISOString()} - ${recentAlerts[0].code}`);
      }
      
    } catch (dbError) {
      console.log(`  ❌ Database connection failed:`, dbError);
    }
    
    // 3. Email System Test
    console.log(`\n3️⃣ EMAIL SYSTEM TEST`);
    console.log(`───────────────────────`);
    await debugEmailSystem();
    
    // 4. SMTP Connection Test
    console.log(`\n4️⃣ SMTP CONNECTION TEST`);
    console.log(`─────────────────────────`);
    try {
      const { sendMail } = await import('../src/lib/mailer');
      const testResult = await sendMail({
        to: process.env.MUNICIPALITY_EMAIL || 'test@example.com',
        subject: `Test Email - ${new Date().toISOString()}`,
        html: `<p>This is a test email from the Light Pollution Sentinel diagnostic system.</p><p>Sent at: ${new Date().toLocaleString()}</p>`
      });
      
      if (testResult?.success) {
        console.log(`  ✅ SMTP test successful: ${testResult.messageId}`);
        console.log(`  📧 Transport: ${testResult.transport || 'SMTP'}`);
      } else {
        console.log(`  ❌ SMTP test failed: Unknown error`);
      }
    } catch (smtpError) {
      console.log(`  ❌ SMTP test error:`, smtpError);
    }
    
    // 5. Simulate Alert Processing
    console.log(`\n5️⃣ ALERT PROCESSING SIMULATION`);
    console.log(`────────────────────────────────`);
    try {
      // Create a test alert if none exist
      const testAlert = await prisma.alert.create({
        data: {
          level: 'test',
          code: 'TEST-' + Date.now(),
          message: 'Diagnostic test alert - radiance: 25.5 nW/cm²/sr',
          severity: 25,
          confirmed: false,
          detectedAt: new Date()
        }
      });
      
      console.log(`  ✅ Created test alert: ${testAlert.id}`);
      
      // Test the improved email template
      const { sendAlertEmail } = await import('../src/lib/mail-improved');
      const alertData = {
        district: 'Mumbai Suburban',
        severity: 'high' as const,
        radiance: 25.5,
        timestamp: new Date().toISOString(),
        location: { lat: 19.0760, lng: 72.8777 },
        districtCode: 'MH',
        hotspotCount: 12,
        yearOverYearChange: 15.3
      };
      
      const emailResult = await sendAlertEmail(alertData);
      
      if (emailResult.success) {
        console.log(`  ✅ Test alert email sent: ${emailResult.messageId}`);
        
        // Mark test alert as sent
        await prisma.alert.update({
          where: { id: testAlert.id },
          data: { sentAt: new Date() }
        });
      } else {
        console.log(`  ❌ Test alert email failed: ${emailResult.error}`);
      }
      
    } catch (alertError) {
      console.log(`  ❌ Alert simulation failed:`, alertError);
    }
    
    // 6. Agent Log Analysis
    console.log(`\n6️⃣ AGENT LOG ANALYSIS`);
    console.log(`────────────────────────`);
    try {
      const agentLogs = await prisma.agentLog.findMany({
        where: { component: { in: ['notify', 'act', 'reason'] } },
        orderBy: { timestamp: 'desc' },
        take: 10
      });
      
      console.log(`  📊 Recent agent activities: ${agentLogs.length}`);
      agentLogs.forEach(log => {
        const status = log.status === 'success' ? '✅' : log.status === 'error' ? '❌' : '⚠️';
        console.log(`    ${status} ${log.component}: ${log.timestamp.toISOString()} ${log.error ? '- ' + log.error : ''}`);
      });
      
    } catch (logError) {
      console.log(`  ❌ Agent log analysis failed:`, logError);
    }
    
    // 7. Recommendations
    console.log(`\n7️⃣ RECOMMENDATIONS`);
    console.log(`─────────────────────`);
    
    const unsentCount = await prisma.alert.count({ where: { sentAt: null } });
    const hasValidSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    
    if (unsentCount > 0) {
      console.log(`  📤 ${unsentCount} unsent alerts found`);
      console.log(`     Run: pnpm run notify`);
    }
    
    if (!hasValidSmtp) {
      console.log(`  📧 SMTP not configured - emails will use JSON transport (development mode)`);
      console.log(`     Set SMTP_HOST, SMTP_USER, SMTP_PASS for production email delivery`);
    }
    
    if (!process.env.MUNICIPALITY_EMAIL) {
      console.log(`  🏛️ MUNICIPALITY_EMAIL not set - using fallback email address`);
    }
    
    if (!process.env.CRON_SECRET) {
      console.log(`  🔐 CRON_SECRET not set - using development default`);
      console.log(`     Set for production: CRON_SECRET=your-secure-secret`);
    }
    
    console.log(`\n✅ Diagnostics completed at ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error(`💥 Diagnostics failed:`, error);
    process.exit(1);
  }
}

// Commands for manual debugging
export async function debugCommands() {
  console.log(`\n🛠️ MANUAL DEBUGGING COMMANDS`);
  console.log(`═══════════════════════════════`);
  console.log(`1. Check unsent alerts:`);
  console.log(`   pnpm prisma db pull && pnpm exec tsx -e "import('./src/lib/prisma').then(({prisma}) => prisma.alert.count({where: {sentAt: null}}).then(console.log))"`);
  
  console.log(`\n2. View recent email logs:`);
  console.log(`   pnpm exec tsx -e "import('./src/lib/prisma').then(({prisma}) => prisma.\\$queryRaw\`SELECT * FROM EmailLog ORDER BY sentAt DESC LIMIT 10\`.then(console.table).catch(() => console.log('EmailLog table does not exist')))"`);
  
  console.log(`\n3. Test SMTP connection:`);
  console.log(`   pnpm exec tsx -e "import('./src/lib/mailer').then(({sendMail}) => sendMail({to: 'test@example.com', subject: 'Test', html: 'Test'}).then(console.log))"`);
  
  console.log(`\n4. Run notifications manually:`);
  console.log(`   pnpm run notify`);
  
  console.log(`\n5. Test CRON endpoint:`);
  console.log(`   curl -X POST "http://localhost:3000/api/cron/notify?secret=dev-cron-secret"`);
  
  console.log(`\n6. Check agent logs:`);
  console.log(`   pnpm exec tsx -e "import('./src/lib/prisma').then(({prisma}) => prisma.agentLog.findMany({where: {component: 'notify'}, orderBy: {timestamp: 'desc'}, take: 5}).then(console.table))"`);
}

if (require.main === module) {
  runDiagnostics()
    .then(() => debugCommands())
    .finally(() => prisma.$disconnect());
}