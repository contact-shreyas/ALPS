"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useMapData } from "@/hooks/useMapData";
import type { LatLngExpression } from "leaflet";

// Dynamically import the map component to avoid SSR issues
const DynamicMap = dynamic(() => import("./map/DynamicMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-pulse">Loading map...</div>
    </div>
  ),
});

// Type definitions
type BaseMapType = "OpenStreetMap" | "Esri WorldImagery" | "Esri WorldTopoMap" | "OpenTopoMap";
type Year = 2005 | 2010 | 2020 | 2022 | 2023 | 2024;

export function LightPollutionMap() {
  // State management
  const [baseMap, setBaseMap] = useState<BaseMapType>("OpenStreetMap");
  const [year, setYear] = useState<Year>(2024);
  const [opacity, setOpacity] = useState(0.7);
  const [zoom, setZoom] = useState(5);
  const { data: mapData } = useMapData();

  // Calculate map center
  const center: LatLngExpression = useMemo(() => {
    if (mapData?.center) {
      return [mapData.center.lat, mapData.center.lng];
    }
    return [20, 78]; // Default center (India)
  }, [mapData?.center]);

  return (
    <div className="relative w-full h-full">
      <DynamicMap
        center={center}
        zoom={zoom}
        baseMap={baseMap}
        year={year}
        opacity={opacity}
        onZoomChange={setZoom}
      />

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
            <option value="OpenStreetMap">OpenStreetMap</option>
            <option value="Esri WorldImagery">Satellite</option>
            <option value="Esri WorldTopoMap">Topographic</option>
            <option value="OpenTopoMap">OpenTopoMap</option>
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
            {[2005, 2010, 2020, 2022, 2023, 2024].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Opacity Control */}
        <div>
          <label className="block text-sm font-medium mb-1">Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Attribution */}
        <div className="text-xs text-gray-600">
          <a
            href="https://www.lightpollutionmap.info"
            target="_blank"
            rel="noopener noreferrer"
          >
            Light Pollution Map Info
          </a>
        </div>
      </div>
    </div>
  );
}