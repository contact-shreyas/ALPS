import { NextResponse } from 'next/server';
import { GenerativeInsights } from '@/lib/ai/generative';
import { z } from 'zod';

const insightRequestSchema = z.object({
  timeframe: z.enum(['daily', 'weekly', 'monthly']),
  region: z.string().optional(),
  type: z.enum(['insights', 'policy', 'education']),
  audience: z.enum(['general', 'student', 'expert']).optional(),
  topic: z.string().optional()
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { timeframe, region, type, audience, topic } = insightRequestSchema.parse(json);

    let result;
    switch (type) {
      case 'insights':
        const metrics = await fetchMetrics(timeframe, region);
        result = await GenerativeInsights.generateInsights({
          timeframe,
          region,
          metrics
        });
        break;
      
      case 'policy':
        if (!region) throw new Error('Region required for policy recommendations');
        result = await GenerativeInsights.generatePolicyRecommendations(region);
        break;
      
      case 'education':
        if (!topic || !audience) throw new Error('Topic and audience required for educational content');
        result = await GenerativeInsights.generateEducationalContent(topic, audience);
        break;
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate insights' },
      { status: 400 }
    );
  }
}

async function fetchMetrics(timeframe: string, region?: string) {
  // Implementation to fetch metrics based on timeframe and region
  // This would query your existing metrics database
  return [];
}