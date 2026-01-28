import { NextRequest, NextResponse } from 'next/server';
import openApiConfig from '../../../../lib/openapi-config';

export async function GET(req: NextRequest) {
  return NextResponse.json(openApiConfig, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}