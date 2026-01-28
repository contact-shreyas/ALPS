import { prisma } from './prisma';

export interface ImpactMetrics {
  energySavings: number;  // in kWh
  co2Reduction: number;   // in kg
  wildlifeImpact: number; // normalized score
  costSavings: number;    // in USD
}

export class SustainabilityImpact {
  /**
   * Calculate environmental impact based on light pollution reduction
   */
  static async calculateImpact(region: string, timeframe: string): Promise<ImpactMetrics> {
    const current = await this.getMetricsForPeriod(region, timeframe);
    const previous = await this.getMetricsForPeriod(region, this.getPreviousPeriod(timeframe));

    const radianceReduction = previous.avgRadiance - current.avgRadiance;
    if (radianceReduction <= 0) return this.getDefaultMetrics();

    // Calculate impact metrics based on radiance reduction
    return {
      energySavings: this.calculateEnergySavings(radianceReduction),
      co2Reduction: this.calculateCO2Reduction(radianceReduction),
      wildlifeImpact: this.calculateWildlifeImpact(radianceReduction),
      costSavings: this.calculateCostSavings(radianceReduction)
    };
  }

  /**
   * Generate sustainability report with recommendations
   */
  static async generateReport(region: string) {
    const dailyImpact = await this.calculateImpact(region, 'daily');
    const monthlyImpact = await this.calculateImpact(region, 'monthly');
    const yearlyImpact = await this.calculateImpact(region, 'yearly');

    return {
      daily: dailyImpact,
      monthly: monthlyImpact,
      yearly: yearlyImpact,
      recommendations: this.generateRecommendations(yearlyImpact)
    };
  }

  private static async getMetricsForPeriod(region: string, timeframe: string) {
    const metrics = await prisma.districtMetric.aggregate({
      where: {
        district: { stateCode: region },
        createdAt: { gte: this.getTimeframeDateRange(timeframe) }
      },
      _avg: { radiance: true }
    });

    return { avgRadiance: metrics._avg.radiance || 0 };
  }

  private static calculateEnergySavings(radianceReduction: number): number {
    // Convert radiance reduction to estimated energy savings
    // Based on research correlating light pollution to energy consumption
    return radianceReduction * 42.5; // kWh per radiance unit
  }

  private static calculateCO2Reduction(radianceReduction: number): number {
    // Calculate CO2 reduction based on energy savings
    // Using average grid emission factor
    const energySavings = this.calculateEnergySavings(radianceReduction);
    return energySavings * 0.85; // kg CO2 per kWh
  }

  private static calculateWildlifeImpact(radianceReduction: number): number {
    // Normalized score (0-10) based on research about light pollution impact on wildlife
    return Math.min(10, radianceReduction * 2.5);
  }

  private static calculateCostSavings(radianceReduction: number): number {
    // Calculate cost savings based on energy reduction
    const energySavings = this.calculateEnergySavings(radianceReduction);
    return energySavings * 0.12; // USD per kWh
  }

  private static getDefaultMetrics(): ImpactMetrics {
    return {
      energySavings: 0,
      co2Reduction: 0,
      wildlifeImpact: 0,
      costSavings: 0
    };
  }

  private static getPreviousPeriod(timeframe: string): string {
    // Implementation to get previous period based on timeframe
    return timeframe;
  }

  private static getTimeframeDateRange(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case 'daily':
        return new Date(now.setDate(now.getDate() - 1));
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'yearly':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return now;
    }
  }

  private static generateRecommendations(impact: ImpactMetrics): string[] {
    const recommendations = [];
    
    if (impact.energySavings < 1000) {
      recommendations.push('Implement smart lighting controls in high-consumption areas');
    }
    
    if (impact.wildlifeImpact < 5) {
      recommendations.push('Create dark sky preserves in sensitive wildlife areas');
    }
    
    if (impact.co2Reduction < 500) {
      recommendations.push('Upgrade to energy-efficient LED lighting systems');
    }

    return recommendations;
  }
}