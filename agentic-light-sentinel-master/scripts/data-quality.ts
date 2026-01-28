#!/usr/bin/env node

/**
 * Data Quality Assessment and Cleanup Script
 */

import { dataCleanup, validateDatabaseIntegrity } from '../src/lib/data-validation';
import { prisma } from '../src/lib/prisma';

async function runDataQualityCheck() {
  console.log('🔍 Running Data Quality Assessment...\n');

  try {
    // 1. Database integrity check
    console.log('📊 Checking database integrity...');
    const integrity = await validateDatabaseIntegrity();
    
    if (integrity.issues.length > 0) {
      console.log('❌ Issues found:');
      integrity.issues.forEach(issue => console.log(`  - ${issue}`));
      
      console.log('\n💡 Suggestions:');
      integrity.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
    } else {
      console.log('✅ No integrity issues found');
    }

    // 2. Cleanup old data
    console.log('\n🧹 Cleaning up old data...');
    const oldDataCleanup = await dataCleanup.cleanupOldHotspots(30);
    console.log(`✅ ${oldDataCleanup.details}`);

    // 3. Remove orphaned data
    console.log('\n🔗 Removing orphaned data...');
    const orphanCleanup = await dataCleanup.cleanupOrphanedData();
    console.log(`✅ ${orphanCleanup.details}`);

    // 4. Remove duplicates
    console.log('\n🔄 Removing duplicate data...');
    const duplicateCleanup = await dataCleanup.removeDuplicateHotspots();
    console.log(`✅ ${duplicateCleanup.details}`);

    // 5. Generate summary statistics
    console.log('\n📈 Database Statistics:');
    const [districtCount, hotspotCount, recentHotspots] = await Promise.all([
      prisma.district.count(),
      prisma.hotspot.count(),
      prisma.hotspot.count({
        where: {
          detectedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    console.log(`  📍 Total Districts: ${districtCount}`);
    console.log(`  🔥 Total Hotspots: ${hotspotCount}`);
    console.log(`  🆕 Recent Hotspots (7 days): ${recentHotspots}`);

    console.log('\n✅ Data quality assessment completed successfully!');
  } catch (error) {
    console.error('❌ Data quality assessment failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run with command line options
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');

if (dryRun) {
  console.log('🔍 Running in dry-run mode (no changes will be made)');
} else if (!force) {
  console.log('⚠️  This will modify your database. Use --force to proceed or --dry-run to preview.');
  process.exit(0);
}

runDataQualityCheck();