import { useState } from 'react';
import { useMap } from '@/contexts/MapContext';
import { LAYER_CONFIGS, MapLayerType } from '@/lib/map-config';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function MapControls() {
  const {
    activeBasemap,
    setActiveBasemap,
    activeLayers,
    toggleLayer,
    layerOpacity,
    setLayerOpacity,
    selectedColorRamp,
    setColorRamp,
    colorBlindMode,
    setColorBlindMode,
  } = useMap();

  return (
    <div className="absolute top-4 right-4 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Base Map</h3>
        <Select value={activeBasemap} onValueChange={setActiveBasemap}>
          <SelectTrigger>
            <SelectValue placeholder="Select a base map" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="satellite">Satellite</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Layers</h3>
        {Object.entries(LAYER_CONFIGS).map(([key, config]) => {
          const layerType = key as MapLayerType;
          const isActive = activeLayers.includes(layerType);

          return (
            <div key={layerType} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">{config.name}</label>
                <Switch
                  checked={isActive}
                  onCheckedChange={() => toggleLayer(layerType)}
                />
              </div>
              {isActive && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Opacity</label>
                    <Slider
                      value={[layerOpacity[layerType] * 100]}
                      onValueChange={([value]) => setLayerOpacity(layerType, value / 100)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                  {config.colorRamps.length > 1 && (
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Color Scheme</label>
                      <Select
                        value={selectedColorRamp[layerType]}
                        onValueChange={(value) => setColorRamp(layerType, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color scheme" />
                        </SelectTrigger>
                        <SelectContent>
                          {config.colorRamps
                            .filter(ramp => colorBlindMode ? ramp.colorBlindFriendly : true)
                            .map(ramp => (
                              <SelectItem key={ramp.id} value={ramp.id}>
                                {ramp.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm">Colorblind Mode</label>
        <Switch
          checked={colorBlindMode}
          onCheckedChange={setColorBlindMode}
        />
      </div>
    </div>
  );
}