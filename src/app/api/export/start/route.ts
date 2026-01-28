import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { redis } from '@/lib/queue';
import { Ratelimit } from '@upstash/ratelimit';
import { exportQueue } from '@/lib/queue';

// Create rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 exports per hour
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const { success, reset } = await ratelimit.limit(session.user.id);
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.', reset },
        { status: 429 }
      );
    }

    // Get export options
    const options = await req.json();

    // Validate options
    if (!options.dateRange?.from || !options.dateRange?.to) {
      return NextResponse.json(
        { error: 'Invalid date range' },
        { status: 400 }
      );
    }

    // Add job to queue
    const job = await exportQueue.add(options, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: false,
      removeOnFail: false,
    });

    // Simulate background processing
    processExport(jobId, options);

    return NextResponse.json({ jobId }, { status: 200 });
  } catch (error) {
    console.error('Error starting export:', error);
    return NextResponse.json({ error: 'Failed to start export' }, { status: 500 });
  }
}

async function processExport(jobId: string, options: any) {
  const job = global.exportJobs.get(jobId);
  if (!job) return;

  try {
    // Simulate progress steps
    for (let progress = 0; progress <= 100; progress += 10) {
      job.progress = progress;
      global.exportJobs.set(jobId, job);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate export file
    const filename = `light-pollution-data-${Date.now()}.${options.format}`;
    const url = `/api/export/download/${filename}`; // This would be a pre-signed URL in production

    job.status = 'completed';
    job.url = url;
    global.exportJobs.set(jobId, job);
  } catch (error) {
    console.error('Error processing export:', error);
    job.status = 'failed';
    global.exportJobs.set(jobId, job);
  }
}