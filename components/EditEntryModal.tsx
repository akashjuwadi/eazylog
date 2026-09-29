"use client";

import { useState } from "react";
import { useLog, type LogEntry } from "@/lib/store";

export function EditEntryModal({
  entry,
  onClose,
}: {
  entry: LogEntry;
  onClose: () => void;
}) {
  const { updateEntry } = useLog();
  const [title, setTitle] = useState(entry.title);
  const [cal, setCal] = useState(String(entry.cal));
  const [protein, setProtein] = useState(String(entry.protein));

  function save() {
    updateEntry(entry.id, {
      title: title.trim() || entry.title,
      cal: Number(cal) || 0,
      protein: Number(protein) || 0,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] bg-surface border-t hairline rounded-t-2xl px-5 pt-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-line rounded-pill mx-auto mb-5" />
        <p className="text-[14px] text-ink mb-5">Edit entry</p>

        <label className="block mb-3">
          <span className="block text-[12px] text-faint mb-1.5">Name</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface2 border hairline rounded-card px-3 py-2.5 text-[14px] text-ink outline-none"
          />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <label className="block">
            <span className="block text-[12px] text-faint mb-1.5">Calories</span>
            <input
              value={cal}
              onChange={(e) => setCal(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              className="w-full bg-surface2 border hairline rounded-card px-3 py-2.5 text-[14px] text-ink font-tabular outline-none"
            />
          </label>
          <label className="block">
            <span className="block text-[12px] text-faint mb-1.5">Protein (g)</span>
            <input
              value={protein}
              onChange={(e) => setProtein(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              className="w-full bg-surface2 border hairline rounded-card px-3 py-2.5 text-[14px] text-ink font-tabular outline-none"
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 text-center text-[14px] text-dim border hairline rounded-card py-3"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 text-center text-[14px] font-medium text-bg bg-gold rounded-card py-3"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
