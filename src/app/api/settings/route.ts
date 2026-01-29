import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { SettingsData } from '@/types/settings';

const defaultSettings = {
  mapSettings: JSON.stringify({
    defaultZoom: 5,
    defaultCenter: { lat: 20, lng: 78 },
    defaultBaseMap: 'OpenStreetMap',
  }),
  displaySettings: JSON.stringify({
    theme: 'system',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    unit: 'metric',
  }),
  notificationSettings: JSON.stringify({
    emailNotifications: true,
    alertThreshold: 50,
    notificationFrequency: 'daily',
  }),
  dataSettings: JSON.stringify({
    dataRetentionPeriod: 90,
    autoRefreshInterval: 5,
    dataQualityThreshold: 'medium',
  }),
};

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const settings = await prisma.userSettings.findFirst({
      where: {
        userEmail: session.user.email,
      },
    });

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json(defaultSettings);
    }

    // Parse the JSON strings back into objects before returning
    const parsedSettings = {
      mapSettings: JSON.parse(settings.mapSettings),
      displaySettings: JSON.parse(settings.displaySettings),
      notificationSettings: JSON.parse(settings.notificationSettings),
      dataSettings: JSON.parse(settings.dataSettings),
    };
    return NextResponse.json(parsedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();
    const { mapSettings, displaySettings, notificationSettings, dataSettings } = data;

    // Validate that each setting object is present
    if (!mapSettings || !displaySettings || !notificationSettings || !dataSettings) {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
    }

    const settings = await prisma.userSettings.upsert({
      where: {
        userEmail: session.user.email,
      },
      create: {
        userEmail: session.user.email,
        mapSettings: JSON.stringify(mapSettings),
        displaySettings: JSON.stringify(displaySettings),
        notificationSettings: JSON.stringify(notificationSettings),
        dataSettings: JSON.stringify(dataSettings),
      },
      update: {
        mapSettings: JSON.stringify(mapSettings),
        displaySettings: JSON.stringify(displaySettings),
        notificationSettings: JSON.stringify(notificationSettings),
        dataSettings: JSON.stringify(dataSettings),
      },
    });

    // Parse the JSON strings back into objects before returning
    const parsedSettings = {
      mapSettings: JSON.parse(settings.mapSettings),
      displaySettings: JSON.parse(settings.displaySettings),
      notificationSettings: JSON.parse(settings.notificationSettings),
      dataSettings: JSON.parse(settings.dataSettings),
    };

    return NextResponse.json(parsedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}