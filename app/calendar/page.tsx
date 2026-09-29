import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Crown } from "@/components/Crown";
import { calendarDays, streak, type DayStatus } from "@/lib/mock-data";

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
const leadingBlank = 5; // September 2026 starts on a Tuesday

export default function CalendarPage() {
  return (
    <>
      <TopBar streak={streak.loggingStreak} />

      <div className="flex-1 scroll-region px-5 pb-6">
        <p className="text-[13px] text-dim mt-2 mb-5">September 2026</p>

        <div className="grid grid-cols-7 gap-y-3 mb-6">
          {weekdays.map((d, i) => (
            <span key={i} className="text-center text-[11px] text-faint">
              {d}
            </span>
          ))}
          {Array.from({ length: leadingBlank }).map((_, i) => (
            <span key={`b${i}`} />
          ))}
          {calendarDays.map((day) => (
            <DayCell key={day.date} date={day.date} status={day.status} />
          ))}
        </div>

        <div className="flex items-center gap-4 mb-7 px-1">
          <Legend mark={<Crown size={13} />} label="Perfect" />
          <Legend mark={<span className="w-2 h-2 rounded-pill bg-green inline-block" />} label="Logged" />
          <Legend mark={<span className="w-2 h-2 rounded-pill bg-red/70 inline-block" />} label="Missed" />
        </div>

        <div className="bg-surface border hairline rounded-card p-4 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Crown size={16} />
            <p className="font-display text-[20px] text-ink font-medium">{streak.loggingStreak}-day logging streak</p>
          </div>
          <p className="text-[13px] text-faint">
            You've completely logged your food for {streak.loggingStreak} days. Missing your
            calorie target doesn't break this — not logging does.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatTile value={`${streak.perfectDaysThisWeek}`} label="Perfect days this week" />
          <StatTile value={`${streak.loggedDaysThisWeek}/7`} label="Days completely logged" />
          <StatTile value={`${streak.proteinHitDaysThisWeek}/7`} label="Protein target hit" />
        </div>
      </div>

      <BottomNav />
    </>
  );
}

function DayCell({ date, status }: { date: number; status: DayStatus }) {
  const base = "aspect-square flex items-center justify-center rounded-card text-[12px] font-tabular relative";

  if (status === "future") {
    return <span className={`${base} text-faint`}>{date}</span>;
  }
  if (status === "perfect") {
    return (
      <span className={`${base} bg-gold/10 text-ink`}>
        <span className="absolute -top-1"><Crown size={11} /></span>
        <span className="mt-2">{date}</span>
      </span>
    );
  }
  if (status === "logged") {
    return (
      <span className={`${base} text-ink`}>
        {date}
        <span className="absolute bottom-1 w-1 h-1 rounded-pill bg-green" />
      </span>
    );
  }
  if (status === "partial") {
    return (
      <span className={`${base} text-dim`}>
        {date}
        <span className="absolute bottom-1 w-1 h-1 rounded-pill bg-faint" />
      </span>
    );
  }
  return (
    <span className={`${base} text-dim`}>
      {date}
      <span className="absolute bottom-1 w-1 h-1 rounded-pill bg-red/70" />
    </span>
  );
}

function Legend({ mark, label }: { mark: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {mark}
      <span className="text-[11px] text-faint">{label}</span>
    </div>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-surface border hairline rounded-card px-3 py-3.5 text-center">
      <p className="font-display text-[19px] text-ink font-medium font-tabular mb-1">{value}</p>
      <p className="text-[10.5px] text-faint leading-tight">{label}</p>
    </div>
  );
}
