#!/usr/bin/env node

/**
 * Health Check Script for Agentic Light Pollution Sentinel
 * Verifies system components and dependencies are working
 */

import { prisma } from '../src/lib/prisma';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

async function healthCheck() {
  console.log('🏥 Running Health Check...\n');
  
  const checks = {
    database: false,
    email: false,
    files: false,
    environment: false
  };

  // Database check
  try {
    await prisma.$connect();
    await prisma.district.count();
    checks.database = true;
    console.log('✅ Database: Connected');
  } catch (error) {
    console.log('❌ Database: Failed to connect');
    console.error('  Error:', error);
  }

  // Email check
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.verify();
    checks.email = true;
    console.log('✅ Email: SMTP connection verified');
  } catch (error) {
    console.log('❌ Email: SMTP connection failed');
    console.error('  Error:', error);
  }

  // File system checks
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const primsaDir = path.join(process.cwd(), 'prisma');
    
    if (fs.existsSync(dataDir) && fs.existsSync(primsaDir)) {
      checks.files = true;
      console.log('✅ Files: Data directories exist');
    } else {
      console.log('❌ Files: Missing required directories');
    }
  } catch (error) {
    console.log('❌ Files: Error checking directories');
    console.error('  Error:', error);
  }

  // Environment check
  try {
    const requiredEnvs = ['DATABASE_URL', 'SMTP_HOST', 'SMTP_USER'];
    const missing = requiredEnvs.filter(env => !process.env[env]);
    
    if (missing.length === 0) {
      checks.environment = true;
      console.log('✅ Environment: All required variables set');
    } else {
      console.log('❌ Environment: Missing variables:', missing.join(', '));
    }
  } catch (error) {
    console.log('❌ Environment: Error checking variables');
  }

  console.log('\n📊 Health Check Summary:');
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  console.log(`  Passed: ${passed}/${total} checks`);
  
  if (passed === total) {
    console.log('🎉 All systems operational!');
    process.exit(0);
  } else {
    console.log('⚠️  Some systems need attention');
    process.exit(1);
  }
}

healthCheck().catch(console.error);