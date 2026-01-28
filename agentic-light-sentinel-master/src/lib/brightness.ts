// Approximate conversions for demo purposes.
// Input radiance r in nW/cm^2/sr

export function radianceToMagArcsec2(r: number): number {
  // Map radiance roughly into 16..22 mag/arcsec^2 range
  const x = Math.max(0, r);
  const mag = 22 - 2.5 * Math.log10(1 + x / 20);
  return Number(mag.toFixed(2));
}

export function artificialToNaturalRatio(r: number, naturalBaseline = 20): number {
  // Ratio of (natural + artificial) / natural; 1.0 => pristine
  const ratio = 1 + Math.max(0, r) / Math.max(1e-6, naturalBaseline);
  return Number(ratio.toFixed(2));
}

