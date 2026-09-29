export function ProgressBar({
  value,
  target,
  color = "bg-gold",
  track = "bg-surface2",
  height = "h-2",
}: {
  value: number;
  target: number;
  color?: string;
  track?: string;
  height?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / target) * 100));
  return (
    <div className={`w-full ${height} ${track} rounded-pill overflow-hidden`}>
      <div
        className={`${height} ${color} rounded-pill transition-[width] duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
