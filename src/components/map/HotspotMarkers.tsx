import { CircleMarker, Popup } from "react-leaflet";
import { SEVERITY_STYLES } from "@/lib/map-styles";
import { useEffect, useState } from "react";

type Hotspot = {
  id: string;
  lat: number;
  lng: number;
  brightness: number;
  severity: "extreme" | "high" | "medium" | "low";
  district: string;
  detectedAt: string;
};

export function HotspotMarkers() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  
  useEffect(() => {
    fetch("/api/hotspots")
      .then(r => r.json())
      .then(data => setHotspots(data.hotspots || []));
  }, []);

  return (
    <>
      {hotspots.map(h => (
        <CircleMarker
          key={h.id}
          center={[h.lat, h.lng]}
          {...SEVERITY_STYLES[h.severity]}
        >
          <Popup>
            <div className="font-sans">
              <div className="text-sm font-semibold mb-2 pb-2 border-b">
                {h.district} District
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-600">Severity:</span>{" "}
                  <span className={`
                    px-1.5 py-0.5 rounded text-xs
                    ${h.severity === "extreme" ? "bg-red-100 text-red-800" :
                      h.severity === "high" ? "bg-orange-100 text-orange-800" :
                      h.severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"}
                  `}>
                    {h.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Brightness:</span>{" "}
                  {h.brightness.toFixed(1)} nW/cm²/sr
                </div>
                <div>
                  <span className="text-gray-600">Detected:</span>{" "}
                  {new Date(h.detectedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}