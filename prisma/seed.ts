import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.processLog.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.hotspot.deleteMany();
  await prisma.district.deleteMany();
  await prisma.state.deleteMany();

  // Create States first (required for Districts)
  const states = await Promise.all([
    prisma.state.create({
      data: {
        code: 'DL',
        name: 'Delhi',
        geomGeoJSON: '{}',
      }
    }),
    prisma.state.create({
      data: {
        code: 'MH',
        name: 'Maharashtra',
        geomGeoJSON: '{}',
      }
    }),
    prisma.state.create({
      data: {
        code: 'KA',
        name: 'Karnataka',
        geomGeoJSON: '{}',
      }
    }),
    prisma.state.create({
      data: {
        code: 'UP',
        name: 'Uttar Pradesh',
        geomGeoJSON: '{}',
      }
    }),
  ]);

  // Create sample districts with correct stateCode references
  const districtList = await Promise.all([
    prisma.district.create({
      data: {
        code: 'DL-CENTRAL',
        name: 'Delhi Central',
        stateCode: 'DL',
        geomGeoJSON: '{}',
        bbox: '[76.8, 28.5, 77.5, 28.9]',
        contactEmail: 'delhi@lightsentinel.org'
      }
    }),
    prisma.district.create({
      data: {
        code: 'MH-MUMBAI',
        name: 'Mumbai',
        stateCode: 'MH',
        geomGeoJSON: '{}',
        bbox: '[72.8, 19.0, 73.0, 19.2]',
        contactEmail: 'mumbai@lightsentinel.org'
      }
    }),
    prisma.district.create({
      data: {
        code: 'KA-BANGALORE',
        name: 'Bangalore',
        stateCode: 'KA',
        geomGeoJSON: '{}',
        bbox: '[77.4, 12.9, 77.8, 13.2]',
        contactEmail: 'bangalore@lightsentinel.org'
      }
    }),
    prisma.district.create({
      data: {
        code: 'UP-LUCKNOW',
        name: 'Lucknow',
        stateCode: 'UP',
        geomGeoJSON: '{}',
        bbox: '[80.8, 26.7, 81.1, 27.0]',
        contactEmail: 'lucknow@lightsentinel.org'
      }
    }),
  ]);
  
  // Create sample hotspots
  await prisma.hotspot.createMany({
    data: [
      {
        lat: 28.7041,
        lng: 77.1025,
        brightness: 45.2,
        delta: 5.2,
        severity: 'high',
        districtCode: districtList[0]?.code || '',
        detectedAt: new Date(),
      },
      {
        lat: 19.0760,
        lng: 72.8777,
        brightness: 38.5,
        delta: 3.5,
        severity: 'medium',
        districtCode: districtList[1]?.code || '',
        detectedAt: new Date(),
      },
      {
        lat: 13.0827,
        lng: 80.2707,
        brightness: 52.1,
        delta: 8.1,
        severity: 'extreme',
        districtCode: districtList[2]?.code || '',
        detectedAt: new Date(),
      },
    ]
  });

  // Create sample alerts with different severities
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  await prisma.alert.createMany({
    data: [
      {
        level: 'critical',
        code: 'DL-001',
        message: 'High light pollution detected in Central Delhi',
        severity: 3,
        confirmed: false,
        detectedAt: now,
        createdAt: now,
        updatedAt: now,
        districtId: districtList[0]?.districtId || undefined,
      },
      {
        level: 'warning',
        code: 'MH-001',
        message: 'Unusual radiance spike in Mumbai',
        severity: 2,
        confirmed: false,
        detectedAt: oneHourAgo,
        createdAt: oneHourAgo,
        updatedAt: oneHourAgo,
        districtId: districtList[1]?.districtId || undefined,
      },
      {
        level: 'warning',
        code: 'KA-001',
        message: 'Sustained high pollution in Bangalore',
        severity: 2,
        confirmed: false,
        detectedAt: twoHoursAgo,
        createdAt: twoHoursAgo,
        updatedAt: twoHoursAgo,
        districtId: districtList[2]?.districtId || undefined,
      },
      {
        level: 'info',
        code: 'UP-001',
        message: 'Minor light pollution in Lucknow',
        severity: 1,
        confirmed: false,
        detectedAt: threeHoursAgo,
        createdAt: threeHoursAgo,
        updatedAt: threeHoursAgo,
        districtId: districtList[3]?.districtId || undefined,
      },
      {
        level: 'critical',
        code: 'DL-002',
        message: 'Critical alert: Extreme pollution in Gurgaon area',
        severity: 3,
        confirmed: false,
        detectedAt: new Date(now.getTime() - 30 * 60 * 1000),
        createdAt: new Date(now.getTime() - 30 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
        districtId: districtList[0]?.districtId || undefined,
      },
    ]
  });

  // Add process logs
  await prisma.processLog.createMany({
    data: [
      {
        type: 'INGEST',
        status: 'RUNNING',
        createdAt: now,
        updatedAt: now
      },
      {
        type: 'INGEST',
        status: 'SUCCESS',
        createdAt: oneHourAgo,
        updatedAt: oneHourAgo
      },
      {
        type: 'PROCESSING',
        status: 'SUCCESS',
        createdAt: twoHoursAgo,
        updatedAt: twoHoursAgo
      },
      {
        type: 'ALERTS',
        status: 'SUCCESS',
        createdAt: twoHoursAgo,
        updatedAt: twoHoursAgo
      }
    ]
  });

  // Ensure we have system settings
  await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {
      alertsEnabled: true,
      ingestSchedule: '0 */1 * * *', // Every hour
      processSchedule: '*/15 * * * *' // Every 15 minutes
    },
    create: {
      id: 'default',
      alertsEnabled: true,
      ingestSchedule: '0 */1 * * *', // Every hour
      processSchedule: '*/15 * * * *' // Every 15 minutes
    }
  });

  console.log('✅ Seed data created successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });