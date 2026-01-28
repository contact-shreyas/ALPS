import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // Get CRON_SECRET from environment or use a default for development
    const expectedSecret = process.env.CRON_SECRET || 'dev-cron-secret';
    
    // Check authorization
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '') || 
                          request.nextUrl.searchParams.get('secret');
    
    if (providedSecret !== expectedSecret) {
      console.log(`🔒 Unauthorized CRON attempt. Expected: ${expectedSecret}, Got: ${providedSecret}`);
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid CRON_SECRET' },
        { status: 401 }
      );
    }
    
    console.log(`🕐 CRON job triggered at ${new Date().toISOString()}`);
    
    // Execute the notify script
    const { stdout, stderr } = await execAsync('pnpm run notify', {
      cwd: process.cwd(),
      timeout: 300000 // 5 minute timeout
    });
    
    console.log('CRON stdout:', stdout);
    if (stderr) {
      console.error('CRON stderr:', stderr);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification job completed',
      timestamp: new Date().toISOString(),
      output: stdout,
      errors: stderr || null
    });
    
  } catch (error) {
    console.error('CRON job failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint for debugging
export async function GET(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET || 'dev-cron-secret';
    
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Return CRON job status and recent runs
    const { prisma } = await import('../../../../lib/prisma');
    
    const recentRuns = await prisma.agentLog.findMany({
      where: { component: 'notify' },
      orderBy: { timestamp: 'desc' },
      take: 10
    });
    
    const unsentAlerts = await prisma.alert.count({
      where: { sentAt: null }
    });
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      recentRuns,
      unsentAlerts,
      environment: {
        hasSmtpHost: !!process.env.SMTP_HOST,
        hasSmtpUser: !!process.env.SMTP_USER,
        hasSmtpPass: !!process.env.SMTP_PASS,
        hasMunicipalityEmail: !!process.env.MUNICIPALITY_EMAIL,
        cronSecret: expectedSecret
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}