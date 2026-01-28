import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Map, MapLayerMouseEvent } from 'maplibre-gl';
import { MapLayerType, LAYER_CONFIGS } from '@/lib/map-config';

interface MapContextType {
  map: Map | null;
  setMap: (map: Map) => void;
  activeBasemap: string;
  setActiveBasemap: (basemap: string) => void;
  activeLayers: MapLayerType[];
  toggleLayer: (layer: MapLayerType) => void;
  layerOpacity: Record<MapLayerType, number>;
  setLayerOpacity: (layer: MapLayerType, opacity: number) => void;
  selectedColorRamp: Record<MapLayerType, string>;
  setColorRamp: (layer: MapLayerType, rampId: string) => void;
  colorBlindMode: boolean;
  setColorBlindMode: (enabled: boolean) => void;
  handleMapClick: (e: MapLayerMouseEvent) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<Map | null>(null);
  const [activeBasemap, setActiveBasemap] = useState('dark');
  const [activeLayers, setActiveLayers] = useState<MapLayerType[]>(['viirs']);
  const [layerOpacity, setLayerOpacity] = useState<Record<MapLayerType, number>>({
    viirs: LAYER_CONFIGS.viirs.opacityDefault,
    worldAtlas: LAYER_CONFIGS.worldAtlas.opacityDefault,
    clouds: LAYER_CONFIGS.clouds.opacityDefault,
    aurora: LAYER_CONFIGS.aurora.opacityDefault,
  });
  const [selectedColorRamp, setSelectedColorRamp] = useState<Record<MapLayerType, string>>({
    viirs: 'default',
    worldAtlas: 'default',
    clouds: 'default',
    aurora: 'default',
  });
  const [colorBlindMode, setColorBlindMode] = useState(false);

  const toggleLayer = useCallback((layer: MapLayerType) => {
    setActiveLayers(prev => {
      const isActive = prev.includes(layer);
      if (isActive) {
        return prev.filter(l => l !== layer);
      } else {
        return [...prev, layer];
      }
    });
  }, []);

  const setLayerOpacityValue = useCallback((layer: MapLayerType, opacity: number) => {
    setLayerOpacity(prev => ({
      ...prev,
      [layer]: opacity,
    }));
  }, []);

  const setColorRampValue = useCallback((layer: MapLayerType, rampId: string) => {
    setSelectedColorRamp(prev => ({
      ...prev,
      [layer]: rampId,
    }));
  }, []);

  const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
    if (!map) return;
    
    // Get features at click point
    const features = map.queryRenderedFeatures(e.point);
    
    // Extract light pollution data from features
    const lightData = features.find(f => 
      activeLayers.some(layer => f.layer.id.startsWith(LAYER_CONFIGS[layer].id))
    );

    if (lightData) {
      console.log('Light pollution data:', lightData.properties);
      // TODO: Show popup with data
    }
  }, [map, activeLayers]);

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        activeBasemap,
        setActiveBasemap,
        activeLayers,
        toggleLayer,
        layerOpacity,
        setLayerOpacity: setLayerOpacityValue,
        selectedColorRamp,
        setColorRamp: setColorRampValue,
        colorBlindMode,
        setColorBlindMode,
        handleMapClick,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}