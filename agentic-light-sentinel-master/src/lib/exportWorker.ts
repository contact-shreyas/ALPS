import { exportQueue } from './queue';
import { uploadToS3, generatePresignedUrl } from './s3';
import ExcelJS from 'exceljs';
import { createReadStream } from 'fs';
import { format } from 'date-fns';
import { prisma } from './prisma';

interface MeasurementData {
  date: string;
  location: string;
  value: number;
  latitude: number;
  longitude: number;
}

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  dateRange: {
    from: string;
    to: string;
  };
  includeMetadata: boolean;
  resolution: 'hourly' | 'daily' | 'weekly' | 'monthly';
  regions?: string[];
}

// Process export job
exportQueue.process(async (job) => {
  const { format, dateRange, includeMetadata, resolution, regions } = job.data as ExportOptions;
  const jobId = job.id as string;

  try {
    // Update progress and emit events
    await job.progress(10);
    await job.log('Starting data query...');

    // Query data (implement your data fetching logic here)
    const data = await queryData(dateRange, resolution, regions);
    await job.progress(40);
    await job.log(`Retrieved ${data.length} records`);

    // Format data
    const formattedData = await formatData(data, format, includeMetadata);
    await job.progress(70);
    await job.log(`Data formatted to ${format}`);

    // Upload to S3
    const fileExt = format === 'xlsx' ? 'xlsx' : format;
    const filename = `export-${jobId}-${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.${fileExt}`;
    await uploadToS3(filename, formattedData instanceof Buffer ? formattedData : Buffer.from(formattedData));
    await job.progress(90);

    // Generate presigned URL
    const downloadUrl = await generatePresignedUrl(filename);
    await job.progress(100);

    return { url: downloadUrl };
  } catch (error) {
    console.error('Export job failed:', error);
    throw error;
  }
});

async function queryData(dateRange: ExportOptions['dateRange'], resolution: string, regions?: string[]) {
  const { from, to } = dateRange;
  const fromDate = new Date(from);
  const toDate = new Date(to);

  const measurements = await prisma.measurement.findMany({
    where: {
      timestamp: {
        gte: fromDate,
        lte: toDate,
      },
      ...(regions?.length ? {
        region: {
          name: {
            in: regions
          }
        }
      } : {}),
    },
    include: {
      region: true,
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  // Aggregate data based on resolution
  switch (resolution) {
    case 'hourly':
      return measurements.map(m => ({
        date: m.timestamp.toISOString(),
        location: m.region.name,
        value: m.value,
        latitude: m.region.latitude,
        longitude: m.region.longitude,
      }));
    
    case 'daily':
      return aggregateByPeriod(measurements, 'day');
    
    case 'weekly':
      return aggregateByPeriod(measurements, 'week');
    
    case 'monthly':
      return aggregateByPeriod(measurements, 'month');
    
    default:
      throw new Error(`Unsupported resolution: ${resolution}`);
  }
}

function aggregateByPeriod(measurements: any[], period: 'day' | 'week' | 'month') {
  const groupedData = measurements.reduce((acc, m) => {
    const date = new Date(m.timestamp);
    let key: string;
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }

    if (!acc[key]) {
      acc[key] = {
        values: [],
        region: m.region,
      };
    }
    acc[key].values.push(m.value);
    return acc;
  }, {});

  return Object.entries(groupedData).map(([date, data]: [string, any]) => ({
    date,
    location: data.region.name,
    value: average(data.values),
    latitude: data.region.latitude,
    longitude: data.region.longitude,
  }));
}

function average(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}
}

async function formatData(data: MeasurementData[], format: string, includeMetadata: boolean): Promise<string | Buffer> {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    
    case 'csv':
      return formatCsv(data, includeMetadata);
    
    case 'xlsx':
      return formatExcel(data, includeMetadata);
    
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

async function formatCsv(data: MeasurementData[], includeMetadata: boolean): Promise<string> {
  const headers = includeMetadata
    ? ['Date', 'Location', 'Value', 'Latitude', 'Longitude']
    : ['Date', 'Location', 'Value'];

  const rows = data.map(row => {
    const values = [row.date, row.location, row.value];
    if (includeMetadata) {
      values.push(row.latitude.toString(), row.longitude.toString());
    }
    return values.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

async function formatExcel(data: MeasurementData[], includeMetadata: boolean): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Light Pollution Data');

  // Set workbook properties
  workbook.creator = 'Light Pollution Sentinel';
  workbook.created = new Date();
  
  // Define columns
  const columns: Partial<ExcelJS.Column>[] = [
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Location', key: 'location', width: 30 },
    { header: 'Value', key: 'value', width: 15 },
  ];

  if (includeMetadata) {
    columns.push(
      { header: 'Latitude', key: 'latitude', width: 15 },
      { header: 'Longitude', key: 'longitude', width: 15 }
    );
  }

  worksheet.columns = columns;

  // Add data
  worksheet.addRows(data);

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Format value column
  const valueColumn = worksheet.getColumn('value');
  valueColumn.numFmt = '0.00';

  if (includeMetadata) {
    const latColumn = worksheet.getColumn('latitude');
    const lonColumn = worksheet.getColumn('longitude');
    latColumn.numFmt = '0.000000';
    lonColumn.numFmt = '0.000000';
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}