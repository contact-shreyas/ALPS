"use client";

interface TrendSparklineProps {
  data: Array<{ timestamp: string; value: number }>;
  width?: number;
  height?: number;
  strokeColor?: string;
  className?: string;
}

export function TrendSparkline({
  data,
  width = 100,
  height = 30,
  strokeColor = "currentColor",
  className
}: TrendSparklineProps) {
  if (!data || data.length < 2) return null;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  // Normalize data points to fit in the SVG
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ overflow: "visible" }}
    >
      {/* Draw the sparkline */}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Add a gradient for the area under the line */}
      <defs>
        <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.1" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Fill area under the line */}
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill="url(#sparkline-gradient)"
      />
      
      {/* Add a dot for the last value */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1].value - min) / range) * height}
        r="2"
        fill={strokeColor}
      />
    </svg>
  );
}