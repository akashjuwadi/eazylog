"use client";

import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ProgressBar } from "@/components/ProgressBar";
import { today, streak, savedMeals } from "@/lib/mock-data";
import { useLog, MEAL_ORDER, MEAL_LABELS, currentMealSlot } from "@/lib/store";

export default function HomePage() {
  const { entries, addEntry } = useLog();

  const totals = entries.reduce(
    (acc, e) => {
      acc.cal += e.cal;
      acc.protein += e.protein;
      acc.carbs += e.carbs ?? 0;
      acc.fat += e.fat ?? 0;
      acc.fiber += e.fiber ?? 0;
      return acc;
    },
    { cal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const remaining = today.calories.target - totals.cal;
  const proteinLeft = Math.max(0, today.protein.target - totals.protein);
  const fiberLeft = Math.max(0, today.fiber.target - totals.fiber);

  const frequentSuggestion = savedMeals[0];

  const mealGroups = MEAL_ORDER.map((slot) => {
    const items = entries
      .filter((e) => e.meal === slot)
      .sort((a, b) => b.createdAt - a.createdAt);
    const cal = items.reduce((sum, e) => sum + e.cal, 0);
    return { slot, items, cal, lastTime: items[0]?.time };
  });

  function addSuggestionAgain() {
    addEntry({
      meal: currentMealSlot(),
      title: frequentSuggestion.name,
      items: frequentSuggestion.ingredients,
      cal: frequentSuggestion.cal,
      protein: frequentSuggestion.protein,
      source: "saved",
    });
  }

  return (
    <>
      <TopBar streak={streak.loggingStreak} />

      <div className="flex-1 scroll-region px-5 pb-6">
        {/* Calorie hero */}
        <div className="mt-3 mb-6">
          <p className="text-[13px] text-dim mb-2">Today</p>
          <div className="flex items-end justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[44px] leading-none font-medium text-ink font-tabular">
                {totals.cal.toLocaleString()}
              </span>
              <span className="text-[15px] text-faint">
                / {today.calories.target.toLocaleString()} kcal
              </span>
            </div>
          </div>
          <ProgressBar value={totals.cal} target={today.calories.target} color="bg-gold" height="h-2.5" />
          <p className="text-[13px] text-dim mt-2">
            {remaining >= 0
              ? `${remaining.toLocaleString()} calories remaining`
              : `${Math.abs(remaining).toLocaleString()} calories over`}
          </p>
        </div>

        {/* Macro rows */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MacroTile label="Protein" value={totals.protein} target={today.protein.target} unit="g" left={proteinLeft} color="bg-blue" />
          <MacroTile label="Fiber" value={totals.fiber} target={today.fiber.target} unit="g" left={fiberLeft} color="bg-green" />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-7">
          <MacroTileSmall label="Carbs" value={totals.carbs} target={today.carbs.target} />
          <MacroTileSmall label="Fat" value={totals.fat} target={today.fat.target} />
        </div>

        {/* Frequent combo nudge */}
        <div className="flex items-center justify-between bg-surface border hairline rounded-card px-4 py-3 mb-7">
          <div className="pr-3">
            <p className="text-[13px] text-ink leading-snug">
              You usually have <span className="text-gold">{frequentSuggestion.name}</span> around now.
            </p>
          </div>
          <button
            onClick={addSuggestionAgain}
            className="shrink-0 text-[13px] font-medium text-bg bg-gold px-3 py-1.5 rounded-pill"
          >
            Add again
          </button>
        </div>

        {/* Meals list */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] uppercase tracking-wide text-faint">Meals</p>
          <Link href="/history" className="text-[13px] text-dim">
            See all
          </Link>
        </div>

        <div className="flex flex-col gap-2 mb-8">
          {mealGroups.map((group) => (
            <div
              key={group.slot}
              className="flex items-center justify-between px-4 py-3.5 bg-surface border hairline rounded-card"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-1.5 h-1.5 rounded-pill ${
                    group.items.length > 0 ? "bg-green" : "bg-line"
                  }`}
                />
                <div>
                  <p className="text-[14px] text-ink">{MEAL_LABELS[group.slot]}</p>
                  {group.items.length > 0 ? (
                    <p className="text-[12px] text-faint">
                      {group.items.length} {group.items.length === 1 ? "item" : "items"} · {group.lastTime}
                    </p>
                  ) : (
                    <p className="text-[12px] text-faint">Not logged yet</p>
                  )}
                </div>
              </div>
              {group.items.length > 0 ? (
                <span className="font-tabular text-[13px] text-dim">{group.cal} cal</span>
              ) : (
                <Link href={`/log?meal=${group.slot}`} className="text-[13px] text-gold font-medium">
                  Log
                </Link>
              )}
            </div>
          ))}
        </div>

        <Link
          href="/day-complete"
          className="block text-center text-[14px] text-ink border hairline rounded-card py-3.5"
        >
          Done eating for today? Finish today's log →
        </Link>
      </div>

      <BottomNav />
    </>
  );
}

function MacroTile({
  label,
  value,
  target,
  unit,
  left,
  color,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  left: number;
  color: string;
}) {
  return (
    <div className="bg-surface border hairline rounded-card px-4 py-3.5">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[13px] text-dim">{label}</span>
        <span className="font-tabular text-[13px] text-ink">
          {value}
          <span className="text-faint">/{target}{unit}</span>
        </span>
      </div>
      <ProgressBar value={value} target={target} color={color} height="h-1.5" />
      <p className="text-[11px] text-faint mt-1.5">{left > 0 ? `${left}${unit} to go` : "Goal hit"}</p>
    </div>
  );
}

function MacroTileSmall({ label, value, target }: { label: string; value: number; target: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-surface border hairline rounded-card">
      <span className="text-[13px] text-dim">{label}</span>
      <span className="font-tabular text-[13px] text-ink">
        {value}
        <span className="text-faint">/{target}g</span>
      </span>
    </div>
  );
}
