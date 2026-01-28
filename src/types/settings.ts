// Type for settings in their JSON form (used in UI)
export interface SettingsData {
  mapSettings: {
    defaultZoom: number;
    defaultCenter: {
      lat: number;
      lng: number;
    };
    defaultBaseMap: string;
  };
  displaySettings: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    dateFormat: string;
    unit: 'metric' | 'imperial';
  };
  notificationSettings: {
    emailNotifications: boolean;
    alertThreshold: number;
    notificationFrequency: 'daily' | 'weekly' | 'monthly';
  };
  dataSettings: {
    dataRetentionPeriod: number;
    autoRefreshInterval: number;
    dataQualityThreshold: 'low' | 'medium' | 'high';
  };
}

// Type for settings in their database form (as strings)
export interface UserSettingsModel {
  id: number;
  userEmail: string;
  createdAt: Date;
  updatedAt: Date;
  mapSettings: string;
  displaySettings: string;
  notificationSettings: string;
  dataSettings: string;
}

export interface SettingsFormProps {
  initialSettings: SettingsData;
  onSave: (settings: SettingsData) => Promise<void>;
}