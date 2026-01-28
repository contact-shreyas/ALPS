type P = { width: number; height: number; a: { x: number; y: number }[]; b: { x: number; y: number }[] };

export function CompareChart({ width, height, a, b }: P) {
  const pad = 8;
  const all = [...a, ...b];
  if (all.length === 0) return <svg width={width} height={height} />;
  const xs = all.map(d => d.x);
  const ys = all.map(d => d.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const sx = (x: number) => pad + ((x - minX) / (maxX - minX || 1)) * (width - 2 * pad);
  const sy = (y: number) => height - pad - ((y - minY) / (maxY - minY || 1)) * (height - 2 * pad);

  const path = (arr: { x:number; y:number }[]) => arr.map((p, i) => `${i ? "L" : "M"} ${sx(p.x)} ${sy(p.y)}`).join(" ");

  return (
    <svg width={width} height={height} role="img" aria-label="Compare">
      <path d={path(a)} fill="none" stroke="currentColor" strokeWidth="2" />
      <path d={path(b)} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    </svg>
  );
}
