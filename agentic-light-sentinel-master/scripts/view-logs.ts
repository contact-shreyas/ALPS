#!/usr/bin/env node

/**
 * Log Viewer Script
 * Displays recent application logs and system status
 */

import { prisma } from '../src/lib/prisma';
import { format } from 'date-fns';

async function viewLogs() {
  console.log('📋 Agentic Light Pollution Sentinel - System Logs\n');

  try {
    console.log('🤖 Recent Agent Activity:');
    const agentLogs = await prisma.agentLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
    });

    if (agentLogs.length > 0) {
      agentLogs.forEach(log => {
        const time = format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss');
        const status = log.status === 'success' ? '✅' : '❌';
        console.log(`  ${status} ${time} - ${log.component} (${log.error || 'Success'})`);
      });
    } else {
      console.log('  No agent logs found');
    }

    console.log('\n🔥 Recent Hotspots:');
    const hotspots = await prisma.hotspot.findMany({
      take: 5,
      orderBy: { detectedAt: 'desc' },
      include: { district: true },
    });

    if (hotspots.length > 0) {
      hotspots.forEach(spot => {
        const time = format(new Date(spot.detectedAt), 'yyyy-MM-dd HH:mm:ss');
        console.log(`  🔥 ${time} - ${spot.district.name} (Severity: ${spot.severity})`);
      });
    } else {
      console.log('  No recent hotspots found');
    }

    console.log('\n📊 System Stats:');
    const [districtCount, hotspotCount, agentLogCount] = await Promise.all([
      prisma.district.count(),
      prisma.hotspot.count(),
      prisma.agentLog.count(),
    ]);

    console.log(`  📍 Total Districts: ${districtCount}`);
    console.log(`  🔥 Total Hotspots: ${hotspotCount}`);
    console.log(`  🤖 Total Agent Logs: ${agentLogCount}`);

  } catch (error) {
    console.error('❌ Error fetching logs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

viewLogs();