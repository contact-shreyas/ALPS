'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { useSettings, defaultSettings } from '@/hooks/useSettings';

export default function SettingsPage() {
  const { settings, isLoading, saveSettings } = useSettings();

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 p-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex items-center justify-center h-64'>
            <Loader2 className='w-6 h-6 animate-spin text-gray-500' />
            <div className='text-gray-500 ml-2'>Loading settings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex items-center mb-8'>
          <Link
            href='/dashboard'
            className='text-gray-600 hover:text-gray-900 transition-colors'
          >
            <ArrowLeft className='w-6 h-6' />
          </Link>
          <h1 className='text-2xl font-semibold text-gray-900 ml-4'>Settings</h1>
        </div>

        <div className='space-y-8'>
          <SettingsForm
            initialSettings={settings ?? defaultSettings}
            onSave={saveSettings}
          />
        </div>
      </div>
    </div>
  );
}