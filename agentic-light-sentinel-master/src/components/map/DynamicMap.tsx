'use client';

import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@/styles/map.css';
import '@/styles/leaflet-overrides.css';
import L from 'leaflet';
import React, { useEffect, useRef } from 'react';

interface EventHandlerProps {
  onMapClick?: (e: { latlng: { lat: number; lng: number }; originalEvent: MouseEvent }) => void;
}

const EventHandler: React.FC<EventHandlerProps> = ({ onMapClick }) => {
  const map = useMapEvents({
    click(e: L.LeafletMouseEvent) {
      if (onMapClick) {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
        onMapClick(e);
      }
    },
  });
  return null;
};

// Fix Leaflet marker icons
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

interface DynamicMapProps {
  center: [number, number];
  zoom: number;
  baseMapUrl: string;
  baseMapAttribution: string;
  overlayUrl?: string;
  overlayAttribution?: string;
  overlayOpacity?: number;
  onMapClick?: (e: { latlng: { lat: number; lng: number }; originalEvent: MouseEvent }) => void;
}

export default function DynamicMap({
  center,
  zoom,
  baseMapUrl,
  baseMapAttribution,
  overlayUrl,
  overlayAttribution,
  overlayOpacity = 0.7,
  onMapClick,
}: DynamicMapProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  // Internal component to manage the overlay tile layer imperatively so
  // opacity updates reflect immediately when `overlayOpacity` changes.
  const OverlayLayer: React.FC<{ url?: string; attribution?: string; opacity?: number }> = ({ url, attribution, opacity = 0.7 }) => {
    const map = useMap();
    const layerRef = useRef<L.TileLayer | null>(null);

    useEffect(() => {
      if (!url) return;

      // Remove existing layer if URL changed
      if (layerRef.current) {
        try { map.removeLayer(layerRef.current); } catch (e) { /* ignore */ }
        layerRef.current = null;
      }

      const tl = L.tileLayer(url, { attribution, opacity });
      layerRef.current = tl;
      tl.addTo(map);
      try {
        // Browser console log to help debug opacity updates
        // eslint-disable-next-line no-console
        console.debug('[OverlayLayer] added layer', { url, opacity });
      } catch (e) {}

      return () => {
        if (layerRef.current) {
          try { map.removeLayer(layerRef.current); } catch (e) { /* ignore */ }
          layerRef.current = null;
        }
      };
    }, [url, attribution, map]);

    // Update opacity when prop changes
    useEffect(() => {
      if (layerRef.current && typeof opacity === 'number') {
        try { layerRef.current.setOpacity(opacity); } catch (e) { /* ignore */ }
        try {
          // eslint-disable-next-line no-console
          console.debug('[OverlayLayer] setOpacity', opacity);
        } catch (e) {}
      }
    }, [opacity]);

    return null;
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
    >
      <EventHandler onMapClick={onMapClick} />
      <TileLayer url={baseMapUrl} attribution={baseMapAttribution} />
      {overlayUrl && (
        <OverlayLayer url={overlayUrl} attribution={overlayAttribution} opacity={overlayOpacity} />
      )}
    </MapContainer>
  );
}