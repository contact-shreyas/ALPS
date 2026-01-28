#!/usr/bin/env node

/**
 * Database Backup Script
 * Creates backup of the Prisma database
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

async function backupDatabase() {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const backupDir = path.join(process.cwd(), 'backups');
  const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);

  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('🗄️  Creating database backup...');
  console.log(`Backup file: ${backupFile}`);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable not set');
    process.exit(1);
  }

  try {
    // For PostgreSQL
    if (databaseUrl.includes('postgresql')) {
      const pg_dump = spawn('pg_dump', [databaseUrl, '-f', backupFile]);
      
      pg_dump.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Database backup completed successfully');
          console.log(`📁 Backup saved to: ${backupFile}`);
        } else {
          console.error('❌ Database backup failed');
          process.exit(code);
        }
      });
    } else {
      // For SQLite (copy the file)
      const dbFile = databaseUrl.replace('file:', '');
      if (fs.existsSync(dbFile)) {
        fs.copyFileSync(dbFile, backupFile.replace('.sql', '.db'));
        console.log('✅ SQLite database backup completed');
        console.log(`📁 Backup saved to: ${backupFile.replace('.sql', '.db')}`);
      } else {
        console.error('❌ Database file not found');
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

backupDatabase();