import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch success stories from the database
    const stories = await prisma.successStory.findMany({
      orderBy: { impactScore: 'desc' },
      take: 5
    });

    // Transform the data for visualization
    const visualStories = stories.map(story => ({
      id: story.id,
      title: story.title,
      description: story.description,
      location: {
        lat: story.latitude,
        lng: story.longitude,
        zoom: 13
      },
      metrics: {
        before: story.beforeRadiance,
        after: story.afterRadiance,
        impact: `${((story.beforeRadiance - story.afterRadiance) / story.beforeRadiance * 100).toFixed(0)}%`
      },
      images: story.imageUrls
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