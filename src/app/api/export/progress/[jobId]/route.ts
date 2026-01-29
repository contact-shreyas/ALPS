import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { exportQueue } from '@/lib/queue';

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = params;
    const job = await exportQueue.getJob(jobId);

    if (!job) {
      return NextResponse.json({ error: 'Export job not found' }, { status: 404 });
    }

    const state = await job.getState();
    const progress = await job.progress();
    const result = job.returnvalue;

    // Map Bull job state to our status
    let status: 'processing' | 'completed' | 'failed';
    switch (state) {
      case 'completed':
        status = 'completed';
        break;
      case 'failed':
        status = 'failed';
        break;
      default:
        status = 'processing';
    }

    return NextResponse.json({
      progress,
      status,
      url: result?.url,
    });
  } catch (error) {
    console.error('Error checking export progress:', error);
    return NextResponse.json(
      { error: 'Failed to check export progress' },
      { status: 500 }
    );
  }
}