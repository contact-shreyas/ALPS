import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '@/contexts/MapContext';
import {
  BASEMAPS,
  LAYER_CONFIGS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  MapLayerType
} from '@/lib/map-config';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapLibreMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const {
    setMap,
    activeBasemap,
    activeLayers,
    layerOpacity,
    selectedColorRamp,
    colorBlindMode,
    handleMapClick,
  } = useMap();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAPS[activeBasemap as keyof typeof BASEMAPS].url,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
    });

    map.on('load', () => {
      setMap(map);
      
      // Add all layer sources
      Object.entries(LAYER_CONFIGS).forEach(([key, config]) => {
        const layerType = key as MapLayerType;
        
        if (!map.getSource(config.id)) {
          map.addSource(config.id, {
            type: 'raster',
            tiles: [config.sourceUrl],
            tileSize: config.tileSize,
            minzoom: config.minZoom,
            maxzoom: config.maxZoom,
            attribution: config.attribution,
          });
        }

        if (!map.getLayer(config.id)) {
          map.addLayer({
            id: config.id,
            type: 'raster',
            source: config.id,
            paint: {
              'raster-opacity': config.visible ? config.opacityDefault : 0,
              'raster-opacity-transition': {
                duration: 300,
              },
            },
            layout: {
              visibility: config.visible ? 'visible' : 'none',
            },
          });
        }
      });
    });

    map.on('click', handleMapClick);

    return () => {
      map.remove();
    };
  }, [setMap, activeBasemap, handleMapClick]);

  // Handle layer visibility and opacity changes
  useEffect(() => {
    const map = maplibregl.Map.prototype.getMap(mapContainer.current);
    if (!map) return;

    Object.entries(LAYER_CONFIGS).forEach(([key, config]) => {
      const layerType = key as MapLayerType;
      const layer = map.getLayer(config.id);
      if (!layer) return;

      const isVisible = activeLayers.includes(layerType);
      map.setLayoutProperty(config.id, 'visibility', isVisible ? 'visible' : 'none');

      if (isVisible) {
        map.setPaintProperty(config.id, 'raster-opacity', layerOpacity[layerType]);
      }
    });
  }, [activeLayers, layerOpacity]);

  // Handle color ramp changes
  useEffect(() => {
    const map = maplibregl.Map.prototype.getMap(mapContainer.current);
    if (!map) return;

    Object.entries(LAYER_CONFIGS).forEach(([key, config]) => {
      const layerType = key as MapLayerType;
      const layer = map.getLayer(config.id);
      if (!layer) return;

      const selectedRamp = config.colorRamps.find(
        ramp => (colorBlindMode ? ramp.colorBlindFriendly : true) && ramp.id === selectedColorRamp[layerType]
      ) || config.colorRamps[0];

      map.setPaintProperty(config.id, 'raster-color', [
        'interpolate',
        ['linear'],
        ['band', 1],
        ...selectedRamp.stops.flat(),
      ]);
    });
  }, [selectedColorRamp, colorBlindMode]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full absolute inset-0"
    />
  );
}