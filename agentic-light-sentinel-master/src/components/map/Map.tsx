"use client";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { HotspotMarkers } from "./HotspotMarkers";

// ---------- Types ----------
type Level = "state" | "district";
type Props = {
  level: Level;                               // current layer to show
  year?: number;                              // metric year (default 2025)
  selectedCode?: string | null;               // highlight this region
  onDrill?: (next: Level, code: string) => void; // state -> district
  onSelect?: (sel: { level: Level; code: string }) => void; // choose a district
  showHotspots?: boolean;                    // show hotspot markers
};

type Shape = { code: string; name: string; geomGeoJSON: any };
type Metric = { code: string; year: number; radiance: number; hotspots: number };
type Nowcast = { lat: number; lng: number; meanBrightness: number; z: number; dateUsed: string } | null;

// ---------- Helpers ----------
function FitToShapes({ shapes }: { shapes: Shape[] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!shapes || shapes.length === 0) return;
    try {
      const layers = shapes.map(s => L.geoJSON(s.geomGeoJSON));
      const group = L.featureGroup(layers);
      const bounds = group.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.1));
    } catch (e) {
      console.error("fit bounds failed:", e);
    }
    setTimeout(() => map.invalidateSize(), 50);
  }, [shapes, map]);
  return null;
}

function AutoResize() {
  const map = useMap();
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const onResize = () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => map.invalidateSize());
    };
    window.addEventListener("resize", onResize);
    const id = setInterval(() => map.invalidateSize(), 500);
    return () => {
      window.removeEventListener("resize", onResize);
      clearInterval(id);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [map]);
  return null;
}

// Click anywhere to fetch VIIRS Black Marble "nowcast" via /api/nowcast
function ClickNowcast({ setNowcast }: { setNowcast: (n: Nowcast) => void }) {
  useMapEvents({
    async click(e) {
      try {
        const { lat, lng } = e.latlng;
        const r = await fetch(`/api/nowcast?lat=${lat}&lng=${lng}&z=7`, { cache: "no-store" });
        const j = await r.json();
        if (r.ok) setNowcast({ lat, lng, meanBrightness: j.meanBrightness, z: j.z, dateUsed: j.dateUsed });
      } catch {
        // ignore
      }
    }
  });
  return null;
}

// ---------- Main component ----------
export default function LeafletMap(props: Props) {
  const level = props.level;
  const year = props.year ?? 2025;
  const selectedCode = props.selectedCode ?? null;
  const onDrill = props.onDrill ?? (() => {});
  const onSelect = props.onSelect ?? (() => {});
  const showHotspots = props.showHotspots ?? true;

  const [data, setData] = useState<{ shapes: Shape[]; metrics: Metric[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nowcast, setNowcast] = useState<Nowcast>(null);

  // Load shapes + metrics for current level/year
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const res = await fetch(`/api/metrics/${level}?year=${year}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        if (cancelled) return;
        setData({
          shapes: (d.shapes || []).map((s: any) => ({ code: s.code, name: s.name, geomGeoJSON: s.geomGeoJSON })),
          metrics: (d.metrics || []) as Metric[]
        });
        console.log(`Loaded ${level} metrics:`, { year, shapes: d.shapes?.length || 0, metrics: d.metrics?.length || 0 });
      } catch (e: any) {
        console.error("Map data load failed:", e?.message || e);
        setError(e?.message || "Failed to load data");
      }
    })();
    return () => { cancelled = true; };
  }, [level, year]);

  const metricByCode = useMemo(() => {
    const m = new globalThis.Map<string, Metric>();
    data?.metrics.forEach(x => m.set(x.code, x));
    return m;
  }, [data]);

  const colorFor = (code: string) => {
    const v = metricByCode.get(code)?.radiance ?? 0;
    if (v > 30) return "#7f1d1d";
    if (v > 26) return "#b91c1c";
    if (v > 22) return "#dc2626";
    if (v > 18) return "#ef4444";
    if (v > 14) return "#f97316";
    return "#fde68a";
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute right-2 top-2 z-[1000] text-[11px] bg-black/60 text-white px-2 py-1 rounded">
        {level.toUpperCase()} • yr {year} • shapes {data?.shapes?.length ?? 0} • metrics {data?.metrics?.length ?? 0}
      </div>

      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
          <div className="text-sm text-red-700 border border-red-300 bg-red-50 px-3 py-2 rounded">
            Map error: {error}
          </div>
        </div>
      )}

      <MapContainer center={[23.5, 80]} zoom={5} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoResize />
        <FitToShapes shapes={data?.shapes ?? null} />
        <ClickNowcast setNowcast={setNowcast} />
        {showHotspots && <HotspotMarkers />}

        {data?.shapes?.map((s) => (
          <GeoJSON
            key={s.code}
            data={s.geomGeoJSON}
            style={{
              color: selectedCode === s.code ? "#111827" : "#1f2937",
              weight: selectedCode === s.code ? 2 : 1,
              fillOpacity: 0.6,
              fillColor: colorFor(s.code)
            }}
            eventHandlers={{
              click: () => {
                if (level === "state") onDrill("district", s.code);
                else onSelect({ level, code: s.code });
              }
            }}
          />
        ))}

        {nowcast && (
          <Marker position={[nowcast.lat, nowcast.lng]}>
            <Popup>
              <div style={{ fontSize: 12 }}>
                <div><b>Nowcast</b> (VIIRS Black Marble)</div>
                <div>Mean brightness: {nowcast.meanBrightness.toFixed(1)} / 255</div>
                <div>Date: {nowcast.dateUsed}</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
