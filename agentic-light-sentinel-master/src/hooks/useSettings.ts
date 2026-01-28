import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SettingsData } from '@/types/settings';
import { toast } from 'sonner';

async function fetchSettings(): Promise<SettingsData> {
  const response = await fetch('/api/settings');
  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  return response.json();
}

async function updateSettings(settings: Partial<SettingsData>): Promise<SettingsData> {
  const response = await fetch('/api/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error('Failed to update settings');
  }
  return response.json();
}

export function useSettings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (newSettings) => {
      // Update cache with new settings
      queryClient.setQueryData(['settings'], newSettings);
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    },
  });

  return {
    settings,
    isLoading,
    error,
    saveSettings: mutation.mutate,
    isSaving: mutation.isPending,
  };
}

// Export default settings for new users
export const defaultSettings: SettingsData = {
  mapSettings: {
    defaultZoom: 5,
    defaultCenter: { lat: 20, lng: 78 },
    defaultBaseMap: 'OpenStreetMap',
  },
  displaySettings: {
    theme: 'system',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    unit: 'metric',
  },
  notificationSettings: {
    emailNotifications: true,
    alertThreshold: 50,
    notificationFrequency: 'daily',
  },
  dataSettings: {
    dataRetentionPeriod: 90,
    autoRefreshInterval: 5,
    dataQualityThreshold: 'medium',
  },
};