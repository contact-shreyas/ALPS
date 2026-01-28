type P = { width: number; height: number; data: { x: number; y: number }[] };

export function TrendChart({ width, height, data }: P) {
  if (!data || data.length === 0) return <svg width={width} height={height} />;
  const pad = 8;
  const xs = data.map(d => d.x);
  const ys = data.map(d => d.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const sx = (x: number) => pad + ((x - minX) / (maxX - minX || 1)) * (width - 2 * pad);
  const sy = (y: number) => height - pad - ((y - minY) / (maxY - minY || 1)) * (height - 2 * pad);
  const dAttr = data.map((p, i) => `${i ? "L" : "M"} ${sx(p.x)} ${sy(p.y)}`).join(" ");
  return (
    <svg width={width} height={height} role="img" aria-label="Trend">
      <path d={dAttr} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
