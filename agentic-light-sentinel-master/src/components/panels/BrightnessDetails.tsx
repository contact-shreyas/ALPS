'use client';

import { radianceToMagArcsec2, artificialToNaturalRatio } from '../../lib/brightness';
import { getSeverityLevel, getSeverityColor, getSeverityDescription } from '../../lib/severity';

interface BrightnessDetailsProps {
  radiance: number;
  lat: number;
  lng: number;
  onClose: () => void;
}

export function BrightnessDetails({ radiance, lat, lng, onClose }: BrightnessDetailsProps) {
  const magArcsec2 = radianceToMagArcsec2(radiance).toFixed(2);
  const ratio = artificialToNaturalRatio(radiance).toFixed(1);
  const severity = getSeverityLevel(radiance);

  return (
    <div className="absolute left-1/2 bottom-20 -translate-x-1/2 bg-white p-6 rounded-lg shadow-xl z-[1000] w-96 border border-gray-200">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
      >
        ×
      </button>
      <h3 className="font-semibold mb-4 text-black text-lg">Light Pollution Details</h3>
      <div className="space-y-3 text-base">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-black font-medium">Location:</div>
          <div className="text-black">{lat.toFixed(4)}N, {lng.toFixed(4)}E</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-black font-medium">Radiance:</div>
          <div className="text-black">{radiance.toFixed(2)} nW/cm/sr</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-black font-medium">Brightness:</div>
          <div className="text-black">{magArcsec2} mag/arcsec</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-black font-medium">Artificial/Natural:</div>
          <div className="text-black">{ratio}x natural</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-black font-medium">Severity:</div>
          <div className="flex items-center gap-2">
            <span className="capitalize font-semibold text-lg" style={{ color: getSeverityColor(severity) }}>
              {severity}
            </span>
            <span className="text-sm text-black">
              ({getSeverityDescription(severity)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}