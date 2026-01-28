import type { StyleSpecification } from 'maplibre-gl';

export interface IMapProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onClick?: (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => void;
  style?: StyleSpecification;
  center?: [number, number];
  zoom?: number;
  maxBounds?: maplibregl.LngLatBoundsLike;
  fitBounds?: maplibregl.LngLatBoundsLike;
  padding?: number;
  bearing?: number;
  pitch?: number;
  className?: string;
}

export interface MapPosition {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}