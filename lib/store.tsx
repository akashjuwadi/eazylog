"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snacks";
export type Goal = "lose" | "fat" | "maintain" | "gain";
export type ActivityLevel = "sedentary" | "light" | "active";

export type UserProfile = {
  goal: Goal;
  sex: "female" | "male";
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFatPct?: number;
  strengthDays: number;
  activity: ActivityLevel;
  targets: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  onboarded: boolean;
};

export const DEFAULT_PROFILE: UserProfile = {
  goal: "lose", sex: "male", age: 29, heightCm: 170, weightKg: 73.5,
  strengthDays: 4, activity: "sedentary",
  targets: { calories: 2000, protein: 150, carbs: 200, fat: 65, fiber: 35 },
  onboarded: false,
};

export type LogEntry = {
  id: string;
  meal: MealSlot;
  title: string;
  items?: string[];
  cal: number;
  protein: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  time: string;
  createdAt: number;
  source: "photo" | "voice" | "search" | "saved" | "manual";
};

const STORAGE_KEY = "eazylog:entries:v1";
const PROFILE_KEY = "eazylog:profile:v1";

// Seed a couple of entries so the app doesn't look empty on first load —
// equivalent to "today's log so far" in the PRD's home-screen example.
const seedEntries: LogEntry[] = [
  {
    id: "seed-1",
    meal: "breakfast",
    title: "Eggs, banana & protein shake",
    items: ["2 boiled eggs", "1 banana", "ON Gold Standard Whey, 1 scoop", "Whole milk, 3 fl oz"],
    cal: 436,
    protein: 40,
    time: "7:12 AM",
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    source: "voice",
  },
  {
    id: "seed-2",
    meal: "lunch",
    title: "Chicken, rice & chickpea curry",
    items: ["Chicken breast, ~150g", "Rice, ~1 cup", "Chickpea curry, ~½ cup", "Green beans, ~½ cup"],
    cal: 682,
    protein: 51,
    carbs: 71,
    fat: 19,
    fiber: 11,
    time: "12:42 PM",
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    source: "photo",
  },
];

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function makeId() {
  return `e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

type NewEntry = Omit<LogEntry, "id" | "createdAt" | "time"> & { time?: string };

type LogContextType = {
  entries: LogEntry[];
  addEntry: (entry: NewEntry) => LogEntry;
  updateEntry: (id: string, patch: Partial<Omit<LogEntry, "id">>) => void;
  deleteEntry: (id: string) => void;
  duplicateEntry: (id: string) => void;
  resetToSeed: () => void;
  profile: UserProfile;
  saveProfile: (profile: UserProfile) => void;
};

const LogContext = createContext<LogContextType | null>(null);

export function LogProvider({ children }: { children: ReactNode }) {
  // Start from the same seed on server and client to avoid hydration
  // mismatches, then swap in anything saved locally after mount.
  const [entries, setEntries] = useState<LogEntry[]>(seedEntries);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {
      // ignore malformed/missing storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));\n      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // storage may be unavailable (private mode, quota) — fail silently
    }
  }, [entries, hydrated]);

  const addEntry: LogContextType["addEntry"] = (entry) => {
    const full: LogEntry = {
      ...entry,
      id: makeId(),
      createdAt: Date.now(),
      time: entry.time ?? timeNow(),
    };
    setEntries((prev) => [full, ...prev]);
    return full;
  };

  const updateEntry: LogContextType["updateEntry"] = (id, patch) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const deleteEntry: LogContextType["deleteEntry"] = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const duplicateEntry: LogContextType["duplicateEntry"] = (id) => {
    setEntries((prev) => {
      const source = prev.find((e) => e.id === id);
      if (!source) return prev;
      const clone: LogEntry = {
        ...source,
        id: makeId(),
        createdAt: Date.now(),
        time: timeNow(),
      };
      return [clone, ...prev];
    });
  };

  const resetToSeed = () => setEntries(seedEntries);\n  const saveProfile = (next: UserProfile) => setProfile(next);

  return (
    <LogContext.Provider
      value={{ entries, profile, addEntry, updateEntry, deleteEntry, duplicateEntry, resetToSeed, saveProfile }}
    >
      {children}
    </LogContext.Provider>
  );
}

export function useLog() {
  const ctx = useContext(LogContext);
  if (!ctx) throw new Error("useLog must be used inside <LogProvider>");
  return ctx;
}

export const MEAL_ORDER: MealSlot[] = ["breakfast", "lunch", "dinner", "snacks"];
export const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

/** Guess which meal slot "now" belongs to, for defaulting the logger. */
export function currentMealSlot(): MealSlot {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 20) return "dinner";
  return "snacks";
}
