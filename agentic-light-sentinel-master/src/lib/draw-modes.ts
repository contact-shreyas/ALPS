import { default as MapboxDraw } from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';

export function createCircleMode() {
  const CircleMode: any = {...MapboxDraw.modes.draw_polygon};

  CircleMode.onSetup = function() {
    const polygon = this.newFeature({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[]]
      }
    });

    this.addFeature(polygon);

    this.clearSelectedFeatures();
    this.updateUIClasses({ mouse: 'add' });
    this.activateUIButton();

    (this as any).actionable = true;
    return {
      polygon,
      currentVertexPosition: 0
    };
  };

  CircleMode.clickAnywhere = function(state: any, e: any) {
    if (state.currentVertexPosition === 0) {
      state.currentVertexPosition = 1;
      const center = e.lngLat;
      state.center = center;
      return;
    }
    
    this.updateUIClasses({ mouse: 'pointer' });
    state.currentVertexPosition = 2;
    this.changeMode('simple_select', { featureIds: [state.polygon.id] });
  };

  CircleMode.onMouseMove = function(state: any, e: any) {
    if (state.currentVertexPosition === 1) {
      const center = state.center;
      const radius = turf.distance(
        turf.point([center.lng, center.lat]),
        turf.point([e.lngLat.lng, e.lngLat.lat]),
        { units: 'kilometers' as turf.Units }
      );
      
      const options = { steps: 64, units: 'kilometers' as turf.Units };
      const circle = turf.circle([center.lng, center.lat], radius, options);
      
      state.polygon.setCoordinates([circle.geometry.coordinates[0]]);
    }
  };

  return CircleMode;
}

export function createSquareMode() {
  const SquareMode: any = {...MapboxDraw.modes.draw_polygon};

  SquareMode.onSetup = function() {
    const polygon = this.newFeature({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[]]
      }
    });

    this.addFeature(polygon);

    this.clearSelectedFeatures();
    this.updateUIClasses({ mouse: 'add' });
    this.activateUIButton();

    (this as any).actionable = true;
    return {
      polygon,
      currentVertexPosition: 0
    };
  };

  SquareMode.clickAnywhere = function(state: any, e: any) {
    if (state.currentVertexPosition === 0) {
      state.currentVertexPosition = 1;
      state.center = e.lngLat;
      return;
    }
    
    this.updateUIClasses({ mouse: 'pointer' });
    state.currentVertexPosition = 2;
    this.changeMode('simple_select', { featureIds: [state.polygon.id] });
  };

  SquareMode.onMouseMove = function(state: any, e: any) {
    if (state.currentVertexPosition === 1) {
      const center = state.center;
      const diagonal = turf.distance(
        turf.point([center.lng, center.lat]),
        turf.point([e.lngLat.lng, e.lngLat.lat]),
        { units: 'kilometers' as turf.Units }
      );
      
      const sideLength = diagonal / Math.sqrt(2);
      const bbox = [
        center.lng - sideLength / 2,
        center.lat - sideLength / 2,
        center.lng + sideLength / 2,
        center.lat + sideLength / 2
      ];
      
      const square = turf.bboxPolygon(bbox as any);
      state.polygon.setCoordinates([square.geometry.coordinates[0]]);
    }
  };

  return SquareMode;
}