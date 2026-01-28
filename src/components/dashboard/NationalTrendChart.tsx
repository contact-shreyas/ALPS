'use client';

import React from 'react';
import { AreaChart } from '@tremor/react';

const chartdata = [
  { date: '9/1', average: 12.5 },
  { date: '9/2', average: 14.2 },
  { date: '9/3', average: 11.8 },
  { date: '9/4', average: 13.5 },
  { date: '9/5', average: 15.1 },
  { date: '9/6', average: 14.8 },
  { date: '9/7', average: 12.9 },
  { date: '9/8', average: 13.7 },
  { date: '9/9', average: 14.5 },
  { date: '9/10', average: 13.2 },
  { date: '9/11', average: 14.0 },
];

export function NationalTrendChart() {
  return (
    <AreaChart
      className="h-72 mt-4"
      data={chartdata}
      index="date"
      categories={["average"]}
      colors={["blue"]}
      valueFormatter={(value) => `${value.toFixed(1)} nW`}
      yAxisWidth={40}
    />
  );
}