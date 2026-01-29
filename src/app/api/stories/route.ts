import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch success stories from the database (using Feedback model)
    const stories = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Transform the data for visualization
    const visualStories = stories.map((story, idx) => ({
      id: story.id,
      title: `Success Story ${idx + 1}`,
      description: story.note,
      location: {
        lat: 20 + Math.random() * 5,
        lng: 75 + Math.random() * 5,
        zoom: 13
      },
      metrics: {
        impact: 'Success'
      },
      images: []
    }));

    return NextResponse.json(visualStories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}