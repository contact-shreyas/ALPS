"use client";

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from '@/contexts/MapContext';
import { Button } from '@/components/ui/button';
import * as turf from '@turf/turf';
import { createCircleMode, createSquareMode } from '@/lib/draw-modes';
import { MapboxDrawEvent } from '@mapbox/mapbox-gl-draw';
import {
  MapPin,
  Circle,
  Square,
  Ruler,
  MousePointer,
  Trash2,
  Minus,
} from 'lucide-react';

import MapboxDraw from '@mapbox/mapbox-gl-draw';

type MeasurementType = 'point' | 'circle' | 'square' | 'line' | 'none';

interface DrawEvent {
  type: string;
  features: GeoJSON.Feature[];
}

interface Measurement {
  type: MeasurementType;
  label: string;
  value: string;
}

type Feature = GeoJSON.Feature<GeoJSON.Geometry>;

export function MeasurementTools() {
  const { map } = useMap();
  const [activeTool, setActiveTool] = useState<MeasurementType>('none');
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const drawRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    // MapboxDraw is already imported
    drawRef.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: false,
        trash: false,
      },
      modes: {
        ...MapboxDraw.modes,
        draw_circle: createCircleMode(),
        draw_square: createSquareMode(),
      },
      styles: [
        // Active vertex point (cursor dot) - hidden
        {
          'id': 'highlight-active-points',
          'type': 'circle',
          'filter': ['all',
            ['==', '$type', 'Point'],
            ['==', 'meta', 'feature'],
            ['==', 'active', 'true']],
          'paint': {
            'circle-radius': 0,
            'circle-opacity': 0,
            'circle-stroke-opacity': 0
          }
        },
        // Inactive vertex points
        {
          'id': 'points-are-blue',
          'type': 'circle',
          'filter': ['all',
            ['==', '$type', 'Point'],
            ['==', 'meta', 'feature'],
            ['==', 'active', 'false']],
          'paint': {
            'circle-radius': 4,
            'circle-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#3b82f6',
            'circle-opacity': 1,
            'circle-stroke-opacity': 0.6
          }
        },
        // Measurement lines
        {
          'id': 'measure-lines',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'LineString']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#3b82f6',
            'line-width': 2,
            'line-opacity': 0.75,
            'line-dasharray': [2, 2]
          }
        },
        // Measurement polygons (circles and squares)
        {
          'id': 'measure-polygons',
          'type': 'fill',
          'filter': ['all', ['==', '$type', 'Polygon']],
          'paint': {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.08,
            'fill-outline-color': '#3b82f6'
          }
        },
        // Polygon outlines
        {
          'id': 'measure-polygon-outline',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'Polygon']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#3b82f6',
            'line-width': 2,
            'line-opacity': 0.75
          }
        }
      ]
    });

    map.addControl(drawRef.current);

    map.on('draw.create', handleDrawCreate as any);
    map.on('draw.update', handleDrawUpdate as any);

    return () => {
      map.removeControl(drawRef.current);
    };
  }, [map]);

  const handleDrawCreate = (e: DrawEvent) => {
    const feature = e.features[0];
    switch (activeTool) {
      case 'circle':
        addCircleMeasurement(feature);
        break;
      case 'square':
        addSquareMeasurement(feature);
        break;
      case 'line':
        addLineMeasurement(feature);
        break;
    }
  };

  const handleDrawUpdate = (e: DrawEvent) => {
    // Update measurements when features are modified
  };

  const handleToolClick = (tool: MeasurementType) => {
    if (!map || !drawRef.current) return;

    if (activeTool === tool) {
      setActiveTool('none');
      drawRef.current.deleteAll();
      return;
    }

    setActiveTool(tool);
    drawRef.current.deleteAll();

    switch (tool) {
      case 'point':
        drawRef.current.changeMode('simple_select');
        map.once('click', handlePointClick);
        break;
      case 'circle':
        drawRef.current.changeMode('draw_circle');
        break;
      case 'square':
        drawRef.current.changeMode('draw_square');
        break;
      case 'line':
        drawRef.current.changeMode('draw_line_string');
        break;
      default:
        drawRef.current.changeMode('simple_select');
    }
  };

  const handlePointClick = (e: maplibregl.MapMouseEvent) => {
    if (!map) return;
    
    const { lngLat } = e;
    addPointMeasurement(lngLat);
    setActiveTool('none');
  };

  const addPointMeasurement = (lngLat: maplibregl.LngLat) => {
    setMeasurements([...measurements, {
      type: 'point',
      label: 'Location',
      value: `${lngLat.lat.toFixed(6)}°N, ${lngLat.lng.toFixed(6)}°E`
    }]);
  };

  const addCircleMeasurement = (feature: any) => {
    const coords = feature.geometry.coordinates[0];
    const center = turf.centerOfMass(feature);
    const radius = turf.distance(
      center,
      turf.point(coords[0]),
      { units: 'kilometers' }
    );
    const area = Math.PI * radius * radius;

    setMeasurements([...measurements, {
      type: 'circle',
      label: 'Circle',
      value: `Area: ${area.toFixed(2)} km²\nRadius: ${radius.toFixed(2)} km`
    }]);
  };

  const addSquareMeasurement = (feature: any) => {
    const area = turf.area(feature) / 1000000; // Convert to km²
    const bounds = turf.bbox(feature);
    const width = turf.distance(
      turf.point([bounds[0], bounds[1]]),
      turf.point([bounds[2], bounds[1]]),
      { units: 'kilometers' }
    );

    setMeasurements([...measurements, {
      type: 'square',
      label: 'Square',
      value: `Area: ${area.toFixed(2)} km²\nSide: ${width.toFixed(2)} km`
    }]);
  };

  const addLineMeasurement = (feature: any) => {
    const length = turf.length(feature, { units: 'kilometers' });
    setMeasurements([...measurements, {
      type: 'line',
      label: 'Distance',
      value: `${length.toFixed(2)} km`
    }]);
  };

  const clearMeasurements = () => {
    if (!map || !drawRef.current) return;
    drawRef.current.deleteAll();
    setMeasurements([]);
    setActiveTool('none');
  };

  return (
    <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
      <div className="flex items-center space-x-2">
        <Button
          variant={activeTool === 'point' ? 'default' : 'outline'}
          size="icon"
          onClick={() => handleToolClick('point')}
          title="Point measurement"
        >
          <MapPin className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === 'circle' ? 'default' : 'outline'}
          size="icon"
          onClick={() => handleToolClick('circle')}
          title="Circle measurement"
        >
          <Circle className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === 'square' ? 'default' : 'outline'}
          size="icon"
          onClick={() => handleToolClick('square')}
          title="Square measurement"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === 'line' ? 'default' : 'outline'}
          size="icon"
          onClick={() => handleToolClick('line')}
          title="Distance measurement"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={clearMeasurements}
          title="Clear measurements"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {measurements.length > 0 && (
        <div className="mt-2 space-y-1 text-sm">
          {measurements.map((m, i) => (
            <div key={i} className="flex items-center justify-between">
              <span>{m.label}</span>
              <span>{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}