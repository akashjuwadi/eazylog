export function TopBar({ streak }: { streak?: number }) {
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-2">
      <div className="flex items-baseline gap-1.5">
        <span className="font-display font-medium text-[15px] tracking-tight text-ink">
          Eazy<span className="text-gold">Log</span>
        </span>
      </div>
      {streak !== undefined && (
        <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-pill border hairline">
          <FlameIcon />
          <span className="font-display text-[13px] font-medium text-ink font-tabular">
            {streak}
          </span>
        </div>
      )}
    </div>
  );
}

function FlameIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2c1 3-3 4-3 8a3 3 0 006 0c1.5 1 2 2.8 2 4.3A6.3 6.3 0 0112 21a6.3 6.3 0 01-5-9.7C8.5 8.5 11 7 12 2z"
        fill="#E8B23D"
      />
    </svg>
  );
}
