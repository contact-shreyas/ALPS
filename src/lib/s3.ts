import fs from 'fs/promises';
import path from 'path';

const LOCAL_STORAGE = path.join(process.cwd(), 'tmp', 'exports');

// Ensure tmp/exports directory exists
async function ensureDirectory() {
  await fs.mkdir(LOCAL_STORAGE, { recursive: true });
}

// Helper function to generate a local URL for file download
export async function generatePresignedUrl(key: string): Promise<string> {
  // In development, we'll just serve the file through a local API endpoint
  return `/api/export/download/${key}`;
}

// Helper function to store a file locally
export async function uploadToS3(key: string, body: Buffer): Promise<void> {
  await ensureDirectory();
  const filePath = path.join(LOCAL_STORAGE, key);
  await fs.writeFile(filePath, body);
}