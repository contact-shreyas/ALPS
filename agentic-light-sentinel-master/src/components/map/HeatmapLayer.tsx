import L from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet.heat';
import { LightData } from '@/hooks/useMapData';

declare module 'leaflet' {
  interface HeatMapOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: { [key: number]: string };
  }
  
  interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: L.LatLngExpression[]): void;
    addLatLng(latlng: L.LatLngExpression): void;
    redraw(): void;
  }
  
  function heatLayer(
    latlngs: L.LatLngExpression[],
    options?: HeatMapOptions
  ): HeatLayer;
}

type HeatmapLayerProps = {
  data: LightData[];
  colorScale: (value: number) => string;
};

export function HeatmapLayer({ data, colorScale }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!data.length) return;

    const points = data.map(d => [
      d.lat,
      d.lon,
      d.radiance
    ] as [number, number, number]);

    const maxRadiance = Math.max(...data.map(d => d.radiance));
    const gradient: Record<number, string> = {};
    for (let i = 0; i <= 1; i += 0.1) {
      gradient[i] = colorScale(maxRadiance * i);
    }

    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      max: maxRadiance,
      gradient
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [data, colorScale, map]);

  return null;
}