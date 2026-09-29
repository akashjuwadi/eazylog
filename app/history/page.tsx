"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { EditEntryModal } from "@/components/EditEntryModal";
import { streak } from "@/lib/mock-data";
import { useLog, MEAL_LABELS, type LogEntry } from "@/lib/store";

export default function HistoryPage() {
  const { entries, deleteEntry, duplicateEntry } = useLog();
  const [editing, setEditing] = useState<LogEntry | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const sorted = [...entries].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <>
      <TopBar streak={streak.loggingStreak} />

      <div className="flex-1 scroll-region px-5 pb-6">
        <p className="text-[13px] text-dim mt-2 mb-5">Today's log</p>

        {sorted.length === 0 && (
          <p className="text-[13px] text-faint text-center mt-10">
            Nothing logged yet today.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {sorted.map((entry) => (
            <div key={entry.id} className="bg-surface border hairline rounded-card px-4 py-4">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[14px] text-ink">
                  {MEAL_LABELS[entry.meal]} <span className="text-faint">— {entry.time}</span>
                </p>
                <span className="font-tabular text-[13px] text-dim">
                  {entry.cal} cal · {entry.protein}g
                </span>
              </div>
              <p className="text-[14px] text-ink mb-1">{entry.title}</p>
              {entry.items && entry.items.length > 0 && (
                <p className="text-[13px] text-faint mb-3">{entry.items.join(", ")}</p>
              )}

              {confirmingDelete === entry.id ? (
                <div className="flex items-center justify-between border-t hairline pt-3">
                  <span className="text-[12.5px] text-dim">Delete this entry?</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setConfirmingDelete(null)}
                      className="text-[12.5px] text-dim"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        deleteEntry(entry.id);
                        setConfirmingDelete(null);
                      }}
                      className="text-[12.5px] text-red font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 border-t hairline pt-3">
                  <button onClick={() => setEditing(entry)} className="text-[12.5px] text-dim">
                    Edit
                  </button>
                  <button onClick={() => duplicateEntry(entry.id)} className="text-[12.5px] text-dim">
                    Duplicate
                  </button>
                  <button onClick={() => setConfirmingDelete(entry.id)} className="text-[12.5px] text-red">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {editing && <EditEntryModal entry={editing} onClose={() => setEditing(null)} />}

      <BottomNav />
    </>
  );
}
