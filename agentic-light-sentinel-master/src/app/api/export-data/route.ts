import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Fetch light pollution data from database
    const data = await prisma.lightPollutionData.findMany({
      select: {
        id: true,
        timestamp: true,
        latitude: true,
        longitude: true,
        brightness: true,
        quality: true,
        source: true,
        createdAt: true,
      },
      where: {
        timestamp: {
          gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lte: endDate ? new Date(endDate) : new Date()
        }
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Format data based on requested format
    switch (format) {
      case 'json': {
        return NextResponse.json(data, {
          headers: {
            'Content-Disposition': `attachment; filename=light-pollution-data-${new Date().toISOString().split('T')[0]}.json`,
          }
        });
      }

      case 'xlsx': {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Light Pollution Data');

        // Add headers
        worksheet.columns = [
          { header: 'ID', key: 'id' },
          { header: 'Timestamp', key: 'timestamp' },
          { header: 'Latitude', key: 'latitude' },
          { header: 'Longitude', key: 'longitude' },
          { header: 'Brightness', key: 'brightness' },
          { header: 'Quality', key: 'quality' },
          { header: 'Source', key: 'source' },
          { header: 'Created At', key: 'createdAt' }
        ];

        // Add data
        data.forEach(row => {
          worksheet.addRow({
            ...row,
            timestamp: row.timestamp.toISOString(),
            createdAt: row.createdAt.toISOString()
          });
        });

        // Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=light-pollution-data-${new Date().toISOString().split('T')[0]}.xlsx`
          }
        });
      }

      default: {
        // CSV format
        const headers = ['ID', 'Timestamp', 'Latitude', 'Longitude', 'Brightness', 'Quality', 'Source', 'Created At'];
        const csvRows = [
          headers.join(','),
          ...data.map(row => [
            row.id,
            row.timestamp.toISOString(),
            row.latitude,
            row.longitude,
            row.brightness,
            row.quality,
            row.source,
            row.createdAt.toISOString()
          ].join(','))
        ];

        const csvContent = csvRows.join('\n');
        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename=light-pollution-data-${new Date().toISOString().split('T')[0]}.csv`
          }
        });
      }
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    return new NextResponse('Error exporting data', { status: 500 });
  }
}