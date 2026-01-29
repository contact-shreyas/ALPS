import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get unique regions from entities
    const regionsData = await prisma.entity.findMany({
      select: {
        region: true,
      },
      distinct: ['region'],
      orderBy: {
        region: 'asc',
      },
    });

    const regions = regionsData.map(r => ({ id: r.region, name: r.region }));

    return NextResponse.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
}