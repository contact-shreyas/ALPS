/**
 * Data validation and cleanup utilities
 */

import { prisma } from './prisma';
import { z } from 'zod';

// Validation schemas
export const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const districtSchema = z.object({
  name: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number(),
  }),
});

export const hotspotSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  brightness: z.number().min(0),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  detectedAt: z.date(),
});

export const emailSchema = z.object({
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
});

// Data validation functions
export async function validateHotspotData(data: any[]): Promise<{
  valid: any[];
  invalid: { data: any; errors: string[] }[];
}> {
  const valid: any[] = [];
  const invalid: { data: any; errors: string[] }[] = [];

  for (const item of data) {
    try {
      const validated = hotspotSchema.parse(item);
      valid.push(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        invalid.push({
          data: item,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        });
      }
    }
  }

  return { valid, invalid };
}

export async function validateDistrictData(data: any[]): Promise<{
  valid: any[];
  invalid: { data: any; errors: string[] }[];
}> {
  const valid: any[] = [];
  const invalid: { data: any; errors: string[] }[] = [];

  for (const item of data) {
    try {
      const validated = districtSchema.parse(item);
      valid.push(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        invalid.push({
          data: item,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        });
      }
    }
  }

  return { valid, invalid };
}

// Data cleanup functions
export async function cleanupOldHotspots(daysOld = 30): Promise<{
  deleted: number;
  details: string;
}> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  try {
    const result = await prisma.hotspot.deleteMany({
      where: {
        detectedAt: {
          lt: cutoffDate,
        },
      },
    });

    return {
      deleted: result.count,
      details: `Deleted ${result.count} hotspots older than ${daysOld} days`,
    };
  } catch (error) {
    throw new Error(`Failed to cleanup old hotspots: ${error}`);
  }
}

export async function cleanupOrphanedData(): Promise<{
  hotspotsRemoved: number;
  metricsRemoved: number;
  details: string;
}> {
  try {
    // Remove hotspots without valid districts
    const orphanedHotspots = await prisma.hotspot.deleteMany({
      where: {
        district: null,
      },
    });

    // Remove metrics without valid districts
    const orphanedMetrics = await prisma.districtMetric.deleteMany({
      where: {
        district: null,
      },
    });

    return {
      hotspotsRemoved: orphanedHotspots.count,
      metricsRemoved: orphanedMetrics.count,
      details: `Removed ${orphanedHotspots.count} orphaned hotspots and ${orphanedMetrics.count} orphaned metrics`,
    };
  } catch (error) {
    throw new Error(`Failed to cleanup orphaned data: ${error}`);
  }
}

export async function removeDuplicateHotspots(): Promise<{
  removed: number;
  details: string;
}> {
  try {
    // Find duplicates based on coordinates and detection time (within 1 hour)
    const duplicates = await prisma.$queryRaw`
      SELECT id, latitude, longitude, "detectedAt", 
             ROW_NUMBER() OVER (
               PARTITION BY latitude, longitude, 
               DATE_TRUNC('hour', "detectedAt") 
               ORDER BY "detectedAt"
             ) as rn
      FROM "Hotspot"
    ` as { id: string; rn: number }[];

    const duplicateIds = duplicates
      .filter(item => item.rn > 1)
      .map(item => item.id);

    if (duplicateIds.length === 0) {
      return {
        removed: 0,
        details: 'No duplicate hotspots found',
      };
    }

    const result = await prisma.hotspot.deleteMany({
      where: {
        id: {
          in: duplicateIds,
        },
      },
    });

    return {
      removed: result.count,
      details: `Removed ${result.count} duplicate hotspots`,
    };
  } catch (error) {
    throw new Error(`Failed to remove duplicate hotspots: ${error}`);
  }
}

export async function validateDatabaseIntegrity(): Promise<{
  issues: string[];
  suggestions: string[];
}> {
  const issues: string[] = [];
  const suggestions: string[] = [];

  try {
    // Check for districts without any hotspots
    const districtsWithoutHotspots = await prisma.district.count({
      where: {
        hotspots: {
          none: {},
        },
      },
    });

    if (districtsWithoutHotspots > 0) {
      issues.push(`${districtsWithoutHotspots} districts have no hotspots recorded`);
      suggestions.push('Consider running data ingestion for areas with missing hotspot data');
    }

    // Check for hotspots with invalid coordinates
    const invalidCoordinates = await prisma.hotspot.count({
      where: {
        OR: [
          { latitude: { lt: -90 } },
          { latitude: { gt: 90 } },
          { longitude: { lt: -180 } },
          { longitude: { gt: 180 } },
        ],
      },
    });

    if (invalidCoordinates > 0) {
      issues.push(`${invalidCoordinates} hotspots have invalid coordinates`);
      suggestions.push('Run data validation and cleanup for hotspots with invalid coordinates');
    }

    // Check for future dates
    const futureHotspots = await prisma.hotspot.count({
      where: {
        detectedAt: {
          gt: new Date(),
        },
      },
    });

    if (futureHotspots > 0) {
      issues.push(`${futureHotspots} hotspots have future detection dates`);
      suggestions.push('Correct detection dates for hotspots with timestamps in the future');
    }

    // Check for very old hotspots (older than 2 years)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    const veryOldHotspots = await prisma.hotspot.count({
      where: {
        detectedAt: {
          lt: twoYearsAgo,
        },
      },
    });

    if (veryOldHotspots > 0) {
      issues.push(`${veryOldHotspots} hotspots are older than 2 years`);
      suggestions.push('Consider archiving or removing very old hotspot data to improve performance');
    }

    return { issues, suggestions };
  } catch (error) {
    issues.push(`Database integrity check failed: ${error}`);
    return { issues, suggestions };
  }
}

// Export all cleanup functions for use in scripts
export const dataCleanup = {
  cleanupOldHotspots,
  cleanupOrphanedData,
  removeDuplicateHotspots,
  validateDatabaseIntegrity,
};