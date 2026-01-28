import { useState, useEffect } from 'react';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';

export type LightData = {
  lat: number;
  lon: number;
  radiance: number;
  timestamp: string;
};

export type HotspotData = {
  lat: number;
  lon: number;
  intensity: number;
  district: string;
  lastSeen: string;
};

export type MapDataOptions = {
  level?: "state" | "district";
  year?: number;
  timeRange?: [Date, Date];
};

export function useMapData({ level = "district", year, timeRange: initialTimeRange }: MapDataOptions = {}) {
  const [lightData, setLightData] = useState<LightData[]>([]);
  const [hotspots, setHotspots] = useState<HotspotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<[Date, Date]>(initialTimeRange || [
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    new Date()
  ]);
  const [metrics, setMetrics] = useState<any>(null);

  // Color scale for the heatmap
  const getColorScale = () => {
    const values = lightData.map(d => d.radiance);
    const [min, max] = extent(values) as [number, number];
    return scaleLinear<string>()
      .domain([min || 0, (max || 100) * 0.25, (max || 100) * 0.5, (max || 100) * 0.75, max || 100])
      .range([
        'rgba(255, 255, 0, 0.2)',   // Light yellow
        'rgba(255, 165, 0, 0.4)',   // Orange
        'rgba(255, 69, 0, 0.6)',    // Red-Orange
        'rgba(255, 0, 0, 0.8)',     // Red
        'rgba(255, 0, 0, 1)',       // Bright Red
      ]);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lightResponse, hotspotsResponse, metricsResponse] = await Promise.all([
        fetch('/api/dataset'),
        fetch('/api/hotspots'),
        fetch(`/api/metrics/${level}?year=${year}`)
      ]);

      const lightJson = await lightResponse.json();
      const hotspotsJson = await hotspotsResponse.json();
      const metricsJson = await metricsResponse.json();

      setLightData(lightJson.data || []);
      setHotspots(hotspotsJson.hotspots || []);
      setMetrics(metricsJson);
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [level, year]);

  const filterDataByTimeRange = (data: LightData[]) => {
    const [start, end] = timeRange;
    return data.filter(d => {
      const timestamp = new Date(d.timestamp);
      return timestamp >= start && timestamp <= end;
    });
  };

  return {
    lightData: filterDataByTimeRange(lightData),
    hotspots,
    metrics,
    loading,
    timeRange,
    setTimeRange,
    colorScale: getColorScale(),
    refresh: fetchData
  };
}
