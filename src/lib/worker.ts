import { exportQueue } from './queue';

console.log('Starting export worker...');

process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  await exportQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await exportQueue.close();
  process.exit(0);
});

// Keep the process running
process.stdin.resume();