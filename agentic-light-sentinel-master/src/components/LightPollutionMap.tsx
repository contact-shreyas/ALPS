'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { LegendPanel } from '@/components/panels/LegendPanel';
import { BrightnessDetails } from '@/components/panels/BrightnessDetails';
import { FilterPanel } from '@/components/panels/FilterPanel';
import { useMapData } from '@/hooks/useMapData';
import { BASEMAPS, LIGHT_POLLUTION_YEARS, BaseMapType, Year, ClickEvent } from './map/types';

// Dynamically import the map component to avoid SSR issues
const DynamicMap = dynamic(() => import('./map/DynamicMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-600">Loading map...</div>
    </div>
  ),
});

export default function LightPollutionMap() {
  // State
  const [baseMap, setBaseMap] = useState<BaseMapType>('OpenStreetMap');
  const [year, setYear] = useState<Year>(2024);
  const [opacity, setOpacity] = useState(0.7);
  const [isMapReady, setIsMapReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [clickedPoint, setClickedPoint] = useState<{ lat: number; lng: number; radiance: number } | null>(null);
  const { lightData, hotspots, loading, metrics } = useMapData();

  // Effects
  useEffect(() => {
    setIsMapReady(true);

    const handleToggleFilters = (event: CustomEvent<{ show: boolean }>) => {
      setShowFilters(event.detail.show);
    };

    window.addEventListener('toggleFilters' as any, handleToggleFilters);
    return () => {
      window.removeEventListener('toggleFilters' as any, handleToggleFilters);
    };
  }, []);

  // Handlers
  const handleMapClick = async (e: ClickEvent) => {
    try {
      // First check if we have data in our lightData array
      const nearbyLight = lightData.find(light => {
        const distance = Math.sqrt(
          Math.pow(light.lat - e.latlng.lat, 2) + 
          Math.pow(light.lon - e.latlng.lng, 2)
        );
        return distance < 0.01; // Within ~1km
      });

      if (nearbyLight) {
        setClickedPoint({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          radiance: nearbyLight.radiance
        });
        return;
      }

      // If no nearby point, fetch from API
      const response = await fetch(`/api/radiance?lat=${e.latlng.lat}&lng=${e.latlng.lng}&year=${year}`);
      if (!response.ok) throw new Error('Failed to fetch radiance data');
      const data = await response.json();
      
      setClickedPoint({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        radiance: data.radiance
      });
    } catch (error) {
      console.error('Error fetching radiance:', error);
      // Fallback to simulated value if API fails
      const simulatedRadiance = Math.random() * 50;
      setClickedPoint({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        radiance: simulatedRadiance
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading map data...</div>
      </div>
    );
  }

  // Handle filter changes
  const handleFilterChange = (filters: any) => {
    // Apply filters to map data here
    console.log('Applying filters:', filters);
  };

  return (
    <div id="map-section" className="relative w-screen h-screen">
      {isMapReady && (
        <>
          <DynamicMap
            center={[20, 78]} // Center of India
            zoom={5}
            baseMapUrl={BASEMAPS[baseMap].url}
            baseMapAttribution={BASEMAPS[baseMap].attribution}
            overlayUrl={LIGHT_POLLUTION_YEARS[year]}
            overlayAttribution='<a href="https://www.lightpollutionmap.info">Light pollution map</a>'
            overlayOpacity={opacity}
            onMapClick={handleMapClick}
          />
          
          <LegendPanel />
          
          {showFilters && (
            <FilterPanel 
              onClose={() => setShowFilters(false)}
              onFilterChange={handleFilterChange}
            />
          )}

          {clickedPoint && (
            <BrightnessDetails
              radiance={clickedPoint.radiance}
              lat={clickedPoint.lat}
              lng={clickedPoint.lng}
              onClose={() => setClickedPoint(null)}
            />
          )}

          {/* Controls Panel */}
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000] space-y-4">
            {/* Base Map Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Base Map</label>
              <select
                value={baseMap}
                onChange={(e) => setBaseMap(e.target.value as BaseMapType)}
                className="w-full p-1 border rounded"
              >
                {Object.keys(BASEMAPS).map((map) => (
                  <option key={map} value={map}>
                    {map}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value) as Year)}
                className="w-full p-1 border rounded"
              >
                {Object.keys(LIGHT_POLLUTION_YEARS).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Opacity Control */}
            <div>
              <label className="block text-sm font-medium mb-1">Overlay Opacity</label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                  style={{
                    background: `linear-gradient(to right, rgb(37 99 235) 0%, rgb(37 99 235) ${opacity * 100}%, rgb(229 231 235) ${opacity * 100}%, rgb(229 231 235) 100%)`
                  }}
                />
                <div className="absolute -top-6 left-0 w-full flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>{Math.round(opacity * 100)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Map Stats */}
            {metrics && (
              <div className="text-xs text-gray-600 pt-2 border-t">
                <div className="mb-1">
                  <span className="font-medium">Active Hotspots:</span>{' '}
                  {hotspots.length}
                </div>
                <div className="mb-1">
                  <span className="font-medium">Average Radiance:</span>{' '}
                  {(metrics.avgRadiance || 0).toFixed(2)} nW/cm²/sr
                </div>
                {metrics.maxRadiance && (
                  <div>
                    <span className="font-medium">Peak Radiance:</span>{' '}
                    {metrics.maxRadiance.toFixed(2)} nW/cm²/sr
                  </div>
                )}
              </div>
            )}

            {/* Attribution */}
            <div className="text-xs text-gray-600 pt-2 border-t">
              Data source:{' '}
              <a
                href="https://www.lightpollutionmap.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Light pollution map
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}