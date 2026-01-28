import OpenAI from 'openai';
import { prisma } from '../prisma';
import { cache } from '../cache';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

interface InsightGenerationParams {
  timeframe: 'daily' | 'weekly' | 'monthly';
  region?: string;
  metrics: any[];
}

export class GenerativeInsights {
  /**
   * Generates natural language insights from light pollution data
   */
  static async generateInsights(params: InsightGenerationParams) {
    if (!process.env.OPENAI_API_KEY) {
      return 'AI insights temporarily unavailable. Please configure OPENAI_API_KEY.';
    }

    const cacheKey = `insights:${params.timeframe}:${params.region || 'global'}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached as string);

    const prompt = this.constructPrompt(params);
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const insights = completion.choices[0]?.message?.content || '';
    await cache.set(cacheKey, JSON.stringify(insights), 3600); // Cache for 1 hour
    return insights;
  }

  /**
   * Generates policy recommendations based on light pollution patterns
   */
  static async generatePolicyRecommendations(region: string) {
    const metrics = await prisma.districtMetric.findMany({
      where: { district: { stateCode: region } },
      include: { district: true },
      orderBy: { year: 'desc' },
      take: 5
    });

    const prompt = `Based on light pollution data from ${region}, generate evidence-based policy recommendations. Consider:
    - Current light pollution levels and trends
    - Impact on local wildlife and ecosystems
    - Energy consumption patterns
    - Public safety requirements
    - Economic implications`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.6,
    });

    return completion.choices[0]?.message?.content || '';
  }

  /**
   * Generates educational content about light pollution impact
   */
  static async generateEducationalContent(topic: string, audience: 'general' | 'student' | 'expert') {
    const prompt = `Create educational content about ${topic} related to light pollution for ${audience} audience. Include:
    - Key concepts and definitions
    - Real-world examples and case studies
    - Impact on environment and society
    - Action items and solutions`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  }

  private static constructPrompt({ timeframe, region, metrics }: InsightGenerationParams) {
    return `Analyze the following light pollution metrics for ${region || 'global'} over ${timeframe} period:
    ${JSON.stringify(metrics, null, 2)}
    
    Generate insights focusing on:
    1. Significant changes and patterns
    2. Environmental impact assessment
    3. Energy efficiency implications
    4. Recommendations for improvement
    
    Format the response in clear, actionable bullet points.`;
  }
}