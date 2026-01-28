'use client';

import React from 'react';
import { Card, Title, Text, BarList } from '@tremor/react';

interface EmailAnalytics {
  totalSent: number;
  delivered: number;
  opened: number;
  actioned: number;
}

interface AlertAnalyticsProps {
  emailStats?: EmailAnalytics;
}

export function AlertAnalytics({ emailStats }: AlertAnalyticsProps) {
  const data = emailStats ? [
    { name: 'Alerts Sent', value: emailStats.totalSent },
    { name: 'Delivered', value: emailStats.delivered },
    { name: 'Opened', value: emailStats.opened },
    { name: 'Actioned', value: emailStats.actioned },
  ] : [
    { name: 'Alerts Sent', value: 45 },
    { name: 'Delivered', value: 45 },
    { name: 'Opened', value: 32 },
    { name: 'Actioned', value: 18 },
  ];

  return (
    <Card>
      <Title>Alert Analytics</Title>
      <Text className="mt-2">Last 30 days</Text>
      <BarList
        data={data}
        className="mt-4"
        valueFormatter={(number: number) => Intl.NumberFormat('us').format(number).toString()}
      />
    </Card>
  );
}