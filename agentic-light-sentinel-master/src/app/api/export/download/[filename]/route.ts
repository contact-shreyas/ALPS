import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';

const LOCAL_STORAGE = path.join(process.cwd(), 'tmp', 'exports');

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename } = params;
    const filePath = path.join(LOCAL_STORAGE, filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await fs.readFile(filePath);
    
    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === '.csv' ? 'text/csv'
      : ext === '.xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/json';
    
    // Convert Buffer to Uint8Array for Blob
    const uint8Array = new Uint8Array(fileBuffer);

    return new NextResponse(new Blob([uint8Array]), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=${filename}`,
      },
    });
  } catch (error) {
    console.error('Error downloading export:', error);
    return NextResponse.json(
      { error: 'Failed to download export file' },
      { status: 500 }
    );
  }
}