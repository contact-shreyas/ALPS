'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { SettingsData, SettingsFormProps } from '@/types/settings';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

const settingsSchema = z.object({
  mapSettings: z.object({
    defaultZoom: z.number().min(1).max(20),
    defaultCenter: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    defaultBaseMap: z.string(),
  }),
  displaySettings: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string(),
    dateFormat: z.string(),
    unit: z.enum(['metric', 'imperial']),
  }),
  notificationSettings: z.object({
    emailNotifications: z.boolean(),
    alertThreshold: z.number().min(0).max(100),
    notificationFrequency: z.enum(['daily', 'weekly', 'monthly']),
  }),
  dataSettings: z.object({
    dataRetentionPeriod: z.number().min(1),
    autoRefreshInterval: z.number().min(1),
    dataQualityThreshold: z.enum(['low', 'medium', 'high']),
  }),
});

export function SettingsForm({ initialSettings, onSave }: SettingsFormProps) {
  const form = useForm<SettingsData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialSettings,
  });

  const onSubmit = async (values: SettingsData) => {
    try {
      await onSave(values);
      toast({
        title: 'Settings saved',
        description: 'Your settings have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Map Settings</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultZoom">Default Zoom Level</Label>
                <Input
                  type="number"
                  id="defaultZoom"
                  {...form.register('mapSettings.defaultZoom', {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div>
                <Label htmlFor="defaultBaseMap">Default Base Map</Label>
                <Select
                  {...form.register('mapSettings.defaultBaseMap')}
                  onValueChange={(value) =>
                    form.setValue('mapSettings.defaultBaseMap', value)
                  }
                  value={form.watch('mapSettings.defaultBaseMap')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select base map" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OpenStreetMap">OpenStreetMap</SelectItem>
                    <SelectItem value="Satellite">Satellite</SelectItem>
                    <SelectItem value="Dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultLat">Default Latitude</Label>
                <Input
                  type="number"
                  id="defaultLat"
                  {...form.register('mapSettings.defaultCenter.lat', {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div>
                <Label htmlFor="defaultLng">Default Longitude</Label>
                <Input
                  type="number"
                  id="defaultLng"
                  {...form.register('mapSettings.defaultCenter.lng', {
                    valueAsNumber: true,
                  })}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Display Settings</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select
                  {...form.register('displaySettings.theme')}
                  onValueChange={(value: 'light' | 'dark' | 'system') =>
                    form.setValue('displaySettings.theme', value)
                  }
                  value={form.watch('displaySettings.theme')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  {...form.register('displaySettings.language')}
                  onValueChange={(value) =>
                    form.setValue('displaySettings.language', value)
                  }
                  value={form.watch('displaySettings.language')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  {...form.register('displaySettings.dateFormat')}
                  onValueChange={(value) =>
                    form.setValue('displaySettings.dateFormat', value)
                  }
                  value={form.watch('displaySettings.dateFormat')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="unit">Unit System</Label>
                <Select
                  {...form.register('displaySettings.unit')}
                  onValueChange={(value: 'metric' | 'imperial') =>
                    form.setValue('displaySettings.unit', value)
                  }
                  value={form.watch('displaySettings.unit')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric</SelectItem>
                    <SelectItem value="imperial">Imperial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch
                id="emailNotifications"
                checked={form.watch('notificationSettings.emailNotifications')}
                onCheckedChange={(checked) =>
                  form.setValue(
                    'notificationSettings.emailNotifications',
                    checked
                  )
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
                <Input
                  type="number"
                  id="alertThreshold"
                  {...form.register('notificationSettings.alertThreshold', {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div>
                <Label htmlFor="notificationFrequency">
                  Notification Frequency
                </Label>
                <Select
                  {...form.register('notificationSettings.notificationFrequency')}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                    form.setValue(
                      'notificationSettings.notificationFrequency',
                      value
                    )
                  }
                  value={form.watch('notificationSettings.notificationFrequency')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Data Settings</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataRetentionPeriod">
                  Data Retention Period (days)
                </Label>
                <Input
                  type="number"
                  id="dataRetentionPeriod"
                  {...form.register('dataSettings.dataRetentionPeriod', {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div>
                <Label htmlFor="autoRefreshInterval">
                  Auto Refresh Interval (minutes)
                </Label>
                <Input
                  type="number"
                  id="autoRefreshInterval"
                  {...form.register('dataSettings.autoRefreshInterval', {
                    valueAsNumber: true,
                  })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dataQualityThreshold">
                Data Quality Threshold
              </Label>
              <Select
                {...form.register('dataSettings.dataQualityThreshold')}
                onValueChange={(value: 'low' | 'medium' | 'high') =>
                  form.setValue('dataSettings.dataQualityThreshold', value)
                }
                value={form.watch('dataSettings.dataQualityThreshold')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="w-32">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}