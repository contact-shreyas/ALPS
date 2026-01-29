import { StyleSpecification } from 'maplibre-gl';

export type MapLayerType = 'viirs' | 'worldAtlas' | 'clouds' | 'aurora';

export interface TileLayerConfig {
  id: string;
  name: string;
  description: string;
  attribution: string;
  minZoom: number;
  maxZoom: number;
  tileSize: number;
  sourceUrl: string;
  colorRamps: ColorRamp[];
  opacityDefault: number;
  visible: boolean;
}

export interface ColorRamp {
  id: string;
  name: string;
  description: string;
  colorBlindFriendly: boolean;
  stops: Array<[number, string]>;
}

export const BASEMAPS = {
  light: {
    name: 'Light',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
  },
  dark: {
    name: 'Dark',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
  },
  satellite: {
    name: 'Satellite',
    url: `https://api.maptiler.com/maps/hybrid/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
  }
};

// Initial map view settings
export const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // Center of India
export const DEFAULT_ZOOM = 5;
export const MAX_ZOOM = 16;
export const MIN_ZOOM = 2;

// Layer configurations
export const LAYER_CONFIGS: Record<MapLayerType, TileLayerConfig> = {
  viirs: {
    id: 'viirs-layer',
    name: 'VIIRS Night Lights',
    description: 'NASA Black Marble / VIIRS nighttime lights data',
    attribution: '© NASA Earth Observatory/NOAA NCEI',
    minZoom: MIN_ZOOM,
    maxZoom: 13,
    tileSize: 256,
    sourceUrl: process.env.NEXT_PUBLIC_VIIRS_TILE_URL || '',
    colorRamps: [
      {
        id: 'default',
        name: 'Default',
        description: 'Standard VIIRS color ramp',
        colorBlindFriendly: false,
        stops: [
          [0, '#000000'],
          [0.1, '#191970'],
          [0.2, '#000080'],
          [0.3, '#0000FF'],
          [0.4, '#4169E1'],
          [0.5, '#00FFFF'],
          [0.6, '#7FFF00'],
          [0.7, '#FFFF00'],
          [0.8, '#FFD700'],
          [0.9, '#FFA500'],
          [1.0, '#FF0000']
        ]
      },
      {
        id: 'colorblind',
        name: 'Colorblind Friendly',
        description: 'Color-blind accessible ramp',
        colorBlindFriendly: true,
        stops: [
          [0, '#000000'],
          [0.2, '#2c7bb6'],
          [0.4, '#abd9e9'],
          [0.6, '#ffffbf'],
          [0.8, '#fdae61'],
          [1.0, '#d7191c']
        ]
      }
    ],
    opacityDefault: 0.8,
    visible: true
  },
  worldAtlas: {
    id: 'world-atlas-layer',
    name: 'World Atlas',
    description: 'World Atlas of Artificial Night Sky Brightness',
    attribution: '© Falchi et al. 2016',
    minZoom: MIN_ZOOM,
    maxZoom: 12,
    tileSize: 256,
    sourceUrl: process.env.NEXT_PUBLIC_WORLD_ATLAS_TILE_URL || '',
    colorRamps: [
      {
        id: 'default',
        name: 'Default',
        description: 'Standard World Atlas color ramp',
        colorBlindFriendly: false,
        stops: [
          [0, '#000000'],
          [0.2, '#191970'],
          [0.4, '#0000FF'],
          [0.6, '#00FFFF'],
          [0.8, '#FFFF00'],
          [1.0, '#FF0000']
        ]
      }
    ],
    opacityDefault: 0.7,
    visible: false
  },
  clouds: {
    id: 'clouds-layer',
    name: 'Cloud Cover',
    description: 'Real-time cloud coverage',
    attribution: '© OpenWeatherMap',
    minZoom: MIN_ZOOM,
    maxZoom: 10,
    tileSize: 256,
    sourceUrl: process.env.NEXT_PUBLIC_CLOUDS_TILE_URL || '',
    colorRamps: [
      {
        id: 'default',
        name: 'Default',
        description: 'Cloud coverage visualization',
        colorBlindFriendly: true,
        stops: [
          [0, 'rgba(255,255,255,0)'],
          [0.5, 'rgba(255,255,255,0.5)'],
          [1, 'rgba(255,255,255,0.8)']
        ]
      }
    ],
    opacityDefault: 0.6,
    visible: false
  },
  aurora: {
    id: 'aurora-layer',
    name: 'Aurora Forecast',
    description: 'Aurora activity forecast',
    attribution: '© NOAA/SWPC',
    minZoom: MIN_ZOOM,
    maxZoom: 8,
    tileSize: 256,
    sourceUrl: process.env.NEXT_PUBLIC_AURORA_TILE_URL || '',
    colorRamps: [
      {
        id: 'default',
        name: 'Default',
        description: 'Aurora intensity',
        colorBlindFriendly: true,
        stops: [
          [0, 'rgba(0,255,0,0)'],
          [0.3, 'rgba(0,255,0,0.3)'],
          [0.6, 'rgba(255,255,0,0.5)'],
          [1, 'rgba(255,0,0,0.7)']
        ]
      }
    ],
    opacityDefault: 0.7,
    visible: false
  }
};