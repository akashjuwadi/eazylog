import Link from "next/link";
import { Crown } from "@/components/Crown";

export default function DayCompletePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <div className="w-20 h-20 rounded-pill bg-gold/10 flex items-center justify-center mb-6">
        <Crown size={36} />
      </div>
      <p className="font-display text-[26px] text-ink font-medium mb-2">Day complete</p>
      <p className="text-[14px] text-dim mb-8 leading-relaxed">
        Logged fully, 1,860 of 2,000 calories, 138g protein.
        <br />
        Your streak is now 13 days.
      </p>

      <div className="w-full flex flex-col gap-3 mb-8">
        <Badge label="Fully logged" done />
        <Badge label="Protein goal crushed — 138/150g" done />
        <Badge label="Within calorie target" done />
      </div>

      <Link
        href="/calendar"
        className="w-full text-center text-[14px] font-medium text-bg bg-gold rounded-card py-3.5 mb-3"
      >
        See your streak
      </Link>
      <Link href="/" className="text-[13px] text-faint">
        Back to today
      </Link>
    </div>
  );
}

function Badge({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 bg-surface border hairline rounded-card px-4 py-3">
      <span className={`w-1.5 h-1.5 rounded-pill ${done ? "bg-green" : "bg-line"}`} />
      <span className="text-[13px] text-ink text-left">{label}</span>
    </div>
  );
}
