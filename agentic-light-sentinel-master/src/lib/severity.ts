export type LightPollutionSeverity = 'EXTREME' | 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'NEGLIGIBLE';

export type RadianceDetails = {
  radiance: number;
  magArcsec2: number;
  artificialToNatural: number;
  severity: LightPollutionSeverity;
};

export function getSeverityLevel(radiance: number): LightPollutionSeverity {
  if (radiance < 1) return 'NEGLIGIBLE';
  if (radiance < 5) return 'LOW';
  if (radiance < 15) return 'MODERATE';
  if (radiance < 30) return 'HIGH';
  if (radiance < 50) return 'VERY_HIGH';
  return 'EXTREME';
}

export function getSeverityColor(severity: LightPollutionSeverity): string {
  switch (severity) {
    case 'EXTREME': return '#7A0022';
    case 'VERY_HIGH': return '#FF0000';
    case 'HIGH': return '#FF6B00';
    case 'MODERATE': return '#FFD300';
    case 'LOW': return '#00C853';
    case 'NEGLIGIBLE': return '#00796B';
  }
}

export function getSeverityDescription(severity: LightPollutionSeverity): string {
  switch (severity) {
    case 'EXTREME': return 'Extreme light pollution';
    case 'VERY_HIGH': return 'Very high light pollution';
    case 'HIGH': return 'High light pollution';
    case 'MODERATE': return 'Moderate light pollution';
    case 'LOW': return 'Low light pollution';
    case 'NEGLIGIBLE': return 'Negligible light pollution';
  }
}

// Color scale for different severity levels
export const SEVERITY_COLORS = {
  low: '#4ade80',     // green
  medium: '#facc15',  // yellow
  high: '#ef4444',    // red
};

export const SEVERITY_RANGES = {
  low: '< 10 nW/cm²/sr',
  medium: '10-30 nW/cm²/sr',
  high: '> 30 nW/cm²/sr',
};

// Legend descriptions for severity levels
export const SEVERITY_DESCRIPTIONS = {
  low: 'Minimal light pollution - near natural conditions',
  medium: 'Moderate light pollution - artificial sky glow noticeable',
  high: 'Severe light pollution - natural night sky mostly obscured',
};