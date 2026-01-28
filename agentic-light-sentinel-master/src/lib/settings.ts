import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Settings {
  mapSettings: string;
  displaySettings: string;
  notificationSettings: string;
  dataSettings: string;
}

export async function getUserSettings(email: string): Promise<Settings | null> {
  const settings = await prisma.settings.findFirst({
    where: { key: `user:${email}` },
  });
  
  if (!settings) return null;
  
  try {
    const parsedValue = JSON.parse(settings.value);
    return {
      mapSettings: parsedValue.mapSettings || '{}',
      displaySettings: parsedValue.displaySettings || '{}',
      notificationSettings: parsedValue.notificationSettings || '{}',
      dataSettings: parsedValue.dataSettings || '{}',
    };
  } catch (e) {
    console.error('Error parsing user settings:', e);
    return null;
  }
}

export async function updateUserSettings(email: string, settings: Partial<Settings>): Promise<Settings> {
  const existingSettings = await prisma.settings.findFirst({
    where: { key: `user:${email}` },
  });

  const currentSettings = existingSettings 
    ? JSON.parse(existingSettings.value)
    : {
        mapSettings: '{}',
        displaySettings: '{}',
        notificationSettings: '{}',
        dataSettings: '{}',
      };

  const newSettings = {
    ...currentSettings,
    ...settings,
  };

  if (existingSettings) {
    // Update existing settings
    await prisma.settings.update({
      where: { key: `user:${email}` },
      data: {
        value: JSON.stringify(newSettings),
      },
    });
  } else {
    // Create new settings
    await prisma.settings.create({
      data: {
        key: `user:${email}`,
        value: JSON.stringify(newSettings),
      },
    });
  }

  return newSettings;
}