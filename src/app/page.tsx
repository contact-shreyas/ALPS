"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MetricsPanel } from '@/components/dashboard/MetricsPanel';

// Dynamically import the map component to avoid SSR issues with Leaflet
const LightPollutionMap = dynamic(
  () => import('@/components/LightPollutionMap'),
  {
    ssr: false
  }
);

export default function Home() {
  interface MetricSummary {
    hotspotPrecision: number;
    hotspotRecall: number;
    ingestToAlertLatencyP50: number;
    ingestToAlertLatencyP95: number;
    districtCoverage: number;
    avgRadiance?: number;
    maxRadiance?: number;
    timestamp: string;
  }

  const [metrics, setMetrics] = useState<MetricSummary>({
    hotspotPrecision: 0,
    hotspotRecall: 0,
    ingestToAlertLatencyP50: 0,
    ingestToAlertLatencyP95: 0,
    districtCoverage: 0,
    timestamp: new Date().toISOString()
  });

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics/current');
      const data = await response.json();
      setMetrics({
        hotspotPrecision: data.hotspotPrecision || 0,
        hotspotRecall: data.hotspotRecall || 0,
        ingestToAlertLatencyP50: data.ingestToAlertLatencyP50 || 0,
        ingestToAlertLatencyP95: data.ingestToAlertLatencyP95 || 0,
        districtCoverage: data.districtCoverage || 0,
        avgRadiance: data.avgRadiance,
        maxRadiance: data.maxRadiance,
        timestamp: data.timestamp || new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Fetch metrics every minute
    const interval = setInterval(fetchMetrics, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex gap-4 relative bg-gray-50">
      {/* Metrics Sidebar */}
      <div className="w-80 overflow-y-auto bg-white border-r border-gray-200 p-4">
        <MetricsPanel metrics={{
          precision: metrics.hotspotPrecision,
          recall: metrics.hotspotRecall,
          ingestAlertP50: metrics.ingestToAlertLatencyP50,
          ingestAlertP95: metrics.ingestToAlertLatencyP95,
          coverage: { percentage: metrics.districtCoverage * 100 },
          avgRadiance: metrics.avgRadiance,
          maxRadiance: metrics.maxRadiance,
          timestamp: metrics.timestamp
        }} />
      </div>
      
      {/* Map Container */}
      <div className="flex-1 relative">
        <LightPollutionMap />
      </div>
    </div>
  );
}