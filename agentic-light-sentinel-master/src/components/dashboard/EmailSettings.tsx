'use client';

import React from 'react';
import { Card, Title, Text, Button } from '@tremor/react';

interface EmailSettingsProps {
  currentEmail?: string;
  onSave: (email: string) => void;
}

export function EmailSettings({ currentEmail, onSave }: EmailSettingsProps) {
  const [email, setEmail] = React.useState(currentEmail || '');
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        onSave(email);
      }
    } catch (error) {
      console.error('Failed to save email:', error);
    }
    setIsSaving(false);
  };

  return (
    <Card>
      <Title>Email Settings</Title>
      <div className="mt-4">
        <Text>Notification Email</Text>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter email address"
        />
        <div className="mt-4 flex items-center justify-between">
          <Text className="text-sm text-gray-500">
            Receive alerts and reports at this email
          </Text>
          <Button
            size="xs"
            onClick={handleSave}
            loading={isSaving}
            loadingText="Saving..."
          >
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
}