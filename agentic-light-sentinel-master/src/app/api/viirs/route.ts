import { NextResponse } from 'next/server';
import { join } from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2024';
    const month = searchParams.get('month') || '01';
    const day = searchParams.get('day') || '01';
    const z = searchParams.get('z') || '0';
    const x = searchParams.get('x') || '0';
    const y = searchParams.get('y') || '0';
    
    // For now, return a redirect to the light pollution map tile server
    const tileUrl = `https://tiles.lightpollutionmap.info/w3/${z}/${x}/${y}.png`;
    return NextResponse.redirect(tileUrl);
  } catch (error) {
    console.error('Error serving tile:', error);
    return NextResponse.error();
  }
}