import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing process logs
  await prisma.processLog.deleteMany();

  // Add initial process logs
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
  
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
        createdAt: oneMinuteAgo,
        updatedAt: oneMinuteAgo
      },
      {
        type: 'PROCESSING',
        status: 'SUCCESS',
        createdAt: twoMinutesAgo,
        updatedAt: twoMinutesAgo
      },
      {
        type: 'ALERTS',
        status: 'SUCCESS',
        createdAt: twoMinutesAgo,
        updatedAt: twoMinutesAgo
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
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });