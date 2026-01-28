'use client';

import { SEVERITY_COLORS, SEVERITY_RANGES, SEVERITY_DESCRIPTIONS } from '@/lib/severity';

export function LegendPanel() {
  return (
    <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
      <h3 className="font-medium mb-2">Light Pollution Severity</h3>
      <div className="space-y-2">
        {(Object.keys(SEVERITY_COLORS) as Array<keyof typeof SEVERITY_COLORS>).map((severity) => (
          <div key={severity} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: SEVERITY_COLORS[severity] }}
            />
            <div>
              <div className="text-sm font-medium">{severity.charAt(0).toUpperCase() + severity.slice(1)}</div>
              <div className="text-xs text-gray-500">{SEVERITY_RANGES[severity]}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-600">
        Click anywhere on the map to see detailed brightness measurements
      </div>
    </div>
  );
}