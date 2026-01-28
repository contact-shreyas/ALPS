'use client';

import React from 'react';
import { Card, Metric, Text, Flex, BadgeDelta } from '@tremor/react';

interface MetricsCardProps {
  title: string;
  value: string;
  trend: string;
  trendDescription: string;
}

export function MetricsCard({ title, value, trend, trendDescription }: MetricsCardProps) {
  const isPositive = trend.startsWith('+');
  
  return (
    <Card className="max-w-xs">
      <Text>{title}</Text>
      <Metric className="mt-2">{value}</Metric>
      <Flex className="mt-4">
        <Text className="truncate">{trendDescription}</Text>
        <BadgeDelta deltaType={isPositive ? 'moderateIncrease' : 'moderateDecrease'}>
          {trend}
        </BadgeDelta>
      </Flex>
    </Card>
  );
}