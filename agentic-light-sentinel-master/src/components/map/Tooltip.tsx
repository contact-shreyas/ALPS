type Props = { x: number; y: number; children: React.ReactNode };
export function Tooltip({ x, y, children }: Props) {
  return (
    <div
      className="pointer-events-none fixed z-50 rounded-md bg-black/80 text-white text-xs px-2 py-1"
      style={{ left: x + 12, top: y + 12 }}
    >
      {children}
    </div>
  );
}
