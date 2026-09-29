"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { savedMeals } from "@/lib/mock-data";
import { useLog, MEAL_ORDER, MEAL_LABELS, currentMealSlot, type MealSlot } from "@/lib/store";

type Tab = "photo" | "voice" | "search" | "saved";

const tabs: { id: Tab; label: string }[] = [
  { id: "photo", label: "Photo" },
  { id: "voice", label: "Voice" },
  { id: "search", label: "Search" },
  { id: "saved", label: "Saved" },
];

export default function LogFoodPage() {
  return (
    <Suspense fallback={null}>
      <LogFoodScreen />
    </Suspense>
  );
}

function LogFoodScreen() {
  const [tab, setTab] = useState<Tab>("photo");
  const searchParams = useSearchParams();
  const requested = searchParams.get("meal") as MealSlot | null;
  const [meal, setMeal] = useState<MealSlot>(requested ?? currentMealSlot());

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <Link href="/" aria-label="Close" className="w-8 h-8 flex items-center justify-center -ml-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="#F1EFE9" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </Link>
        <p className="text-[14px] text-ink">Log food</p>
        <span className="w-8" />
      </div>

      {/* Which meal this entry counts toward */}
      <div className="flex px-5 gap-2 mb-4 overflow-x-auto scroll-region">
        {MEAL_ORDER.map((slot) => (
          <button
            key={slot}
            onClick={() => setMeal(slot)}
            className={`shrink-0 px-3 py-1.5 rounded-pill text-[12.5px] border ${
              meal === slot ? "border-gold bg-gold/10 text-ink" : "hairline text-faint"
            }`}
          >
            {MEAL_LABELS[slot]}
          </button>
        ))}
      </div>

      <div className="flex px-5 gap-1 mb-5 border-b hairline">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 pb-3 text-[13px] border-b-2 -mb-px transition-colors ${
              tab === t.id ? "text-ink border-gold" : "text-faint border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 scroll-region px-5 pb-6">
        {tab === "photo" && <PhotoTab meal={meal} />}
        {tab === "voice" && <VoiceTab meal={meal} />}
        {tab === "search" && <SearchTab meal={meal} />}
        {tab === "saved" && <SavedTab meal={meal} />}
      </div>
    </>
  );
}

function useAddAndReturn() {
  const { addEntry } = useLog();
  const router = useRouter();
  return (entry: Parameters<typeof addEntry>[0]) => {
    addEntry(entry);
    router.push("/");
  };
}

function PhotoTab({ meal }: { meal: MealSlot }) {
  const [captured, setCaptured] = useState(false);
  const addAndReturn = useAddAndReturn();

  if (!captured) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-10 text-center">
        <div className="w-full aspect-[4/5] rounded-card border-2 border-dashed hairline flex flex-col items-center justify-center gap-3 mb-6">
          <CameraIcon />
          <p className="text-[13px] text-faint px-8">Point your camera at the plate</p>
        </div>
        <button
          onClick={() => setCaptured(true)}
          className="w-16 h-16 rounded-pill bg-ink flex items-center justify-center"
          aria-label="Take photo"
        >
          <span className="w-12 h-12 rounded-pill border-2 border-bg" />
        </button>
      </div>
    );
  }

  const items = [
    { name: "Chicken breast", qty: "~150 g", cal: 248 },
    { name: "Rice", qty: "~1 cup", cal: 206 },
    { name: "Chickpea curry", qty: "~½ cup", cal: 165 },
    { name: "Green beans", qty: "~½ cup", cal: 63 },
  ];

  return (
    <div>
      <div className="w-full aspect-[4/5] rounded-card bg-surface2 mb-4 flex items-center justify-center overflow-hidden">
        <PlatePlaceholder />
      </div>
      <p className="text-[13px] text-dim mb-3">AI identified {items.length} items</p>
      <div className="flex flex-col gap-2 mb-5">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between px-4 py-3 bg-surface border hairline rounded-card">
            <div>
              <p className="text-[14px] text-ink">{item.name}</p>
              <p className="text-[12px] text-faint">{item.qty}</p>
            </div>
            <span className="font-tabular text-[13px] text-dim">{item.cal} cal</span>
          </div>
        ))}
      </div>
      <div className="bg-surface border hairline rounded-card px-4 py-3 mb-5">
        <p className="font-tabular text-[15px] text-ink mb-1">Estimated: 682 calories</p>
        <p className="text-[12px] text-faint">Protein 51g · Carbs 71g · Fat 19g · Fiber 11g</p>
      </div>
      <button
        onClick={() =>
          addAndReturn({
            meal,
            title: "Chicken, rice & chickpea curry",
            items: items.map((i) => `${i.name}, ${i.qty}`),
            cal: 682,
            protein: 51,
            carbs: 71,
            fat: 19,
            fiber: 11,
            source: "photo",
          })
        }
        className="w-full text-center text-[14px] font-medium text-bg bg-gold rounded-card py-3.5"
      >
        Add
      </button>
    </div>
  );
}

function VoiceTab({ meal }: { meal: MealSlot }) {
  const [recorded, setRecorded] = useState(false);
  const addAndReturn = useAddAndReturn();

  if (!recorded) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-10 text-center">
        <button
          onClick={() => setRecorded(true)}
          className="w-20 h-20 rounded-pill bg-gold flex items-center justify-center mb-5 active:scale-95 transition-transform"
          aria-label="Hold to talk"
        >
          <MicIcon />
        </button>
        <p className="text-[13px] text-faint px-10">
          Hold and describe what you ate — talk to it like you would ChatGPT
        </p>
      </div>
    );
  }

  const items = [
    { name: "2 boiled eggs", cal: 156 },
    { name: "1 banana", cal: 105 },
    { name: "ON Gold Standard Whey — 1 scoop", cal: 120 },
    { name: "Whole milk — 3 fl oz", cal: 55 },
  ];

  return (
    <div>
      <div className="bg-surface border hairline rounded-card px-4 py-3.5 mb-5">
        <p className="text-[13px] text-dim italic leading-relaxed">
          "I had two boiled eggs, one banana and a coffee protein shake with one scoop
          ON vanilla whey and three ounces whole milk."
        </p>
      </div>
      <p className="text-[13px] text-dim mb-3">Parsed {items.length} items</p>
      <div className="flex flex-col gap-2 mb-5">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between px-4 py-3 bg-surface border hairline rounded-card">
            <p className="text-[14px] text-ink">{item.name}</p>
            <span className="font-tabular text-[13px] text-dim">{item.cal} cal</span>
          </div>
        ))}
      </div>
      <div className="bg-surface border hairline rounded-card px-4 py-3 mb-5">
        <p className="font-tabular text-[15px] text-ink">~436 calories · 43g protein</p>
      </div>
      <button
        onClick={() =>
          addAndReturn({
            meal,
            title: "Eggs, banana & protein shake",
            items: items.map((i) => i.name),
            cal: 436,
            protein: 43,
            source: "voice",
          })
        }
        className="w-full text-center text-[14px] font-medium text-bg bg-gold rounded-card py-3.5"
      >
        Add
      </button>
    </div>
  );
}

// A tiny mock food table so search feels alive for a few common terms;
// anything unrecognized falls back to a generic 100-cal placeholder item.
const FOOD_TABLE: Record<string, { cal: number; protein: number }> = {
  banana: { cal: 105, protein: 1 },
  "chicken breast": { cal: 165, protein: 31 },
  rice: { cal: 206, protein: 4 },
  eggs: { cal: 78, protein: 6 },
  apple: { cal: 95, protein: 0.5 },
};

function SearchTab({ meal }: { meal: MealSlot }) {
  const [query, setQuery] = useState("");
  const [qty, setQty] = useState(1);
  const addAndReturn = useAddAndReturn();
  const showResult = query.trim().length > 0;

  const key = Object.keys(FOOD_TABLE).find((k) => query.toLowerCase().includes(k));
  const base = key ? FOOD_TABLE[key] : { cal: 100, protein: 3 };
  const resultName = key ? key[0].toUpperCase() + key.slice(1) : query;

  return (
    <div>
      <div className="flex items-center gap-2 bg-surface border hairline rounded-card px-4 py-3 mb-4">
        <SearchIcon />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search or type '150g grilled chicken'"
          className="flex-1 bg-transparent text-[14px] text-ink placeholder:text-faint outline-none"
        />
      </div>

      {!showResult && (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] uppercase tracking-wide text-faint mb-1">Recent</p>
          {["Banana", "Chicken breast, 100g", "Rice, 1 cup"].map((r) => (
            <button
              key={r}
              onClick={() => setQuery(r)}
              className="text-left px-4 py-3 bg-surface border hairline rounded-card text-[14px] text-dim"
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {showResult && (
        <div className="bg-surface border hairline rounded-card px-4 py-4">
          <p className="text-[15px] text-ink mb-1">{resultName}</p>
          <p className="font-tabular text-[13px] text-faint mb-4">
            {base.cal} cal · {base.protein}g protein (per unit)
          </p>
          <div className="flex items-center justify-between mb-5">
            <span className="text-[13px] text-dim">Quantity</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-pill border hairline flex items-center justify-center text-ink"
              >
                −
              </button>
              <span className="font-tabular text-[15px] text-ink w-4 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 rounded-pill border hairline flex items-center justify-center text-ink"
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={() =>
              addAndReturn({
                meal,
                title: resultName,
                cal: Math.round(base.cal * qty),
                protein: Math.round(base.protein * qty),
                source: "search",
              })
            }
            className="w-full text-center text-[14px] font-medium text-bg bg-gold rounded-card py-3.5"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

function SavedTab({ meal }: { meal: MealSlot }) {
  const addAndReturn = useAddAndReturn();

  return (
    <div className="flex flex-col gap-2">
      {savedMeals.map((sm) => (
        <div key={sm.id} className="flex items-center justify-between px-4 py-3.5 bg-surface border hairline rounded-card">
          <div>
            <p className="text-[14px] text-ink mb-0.5">{sm.name}</p>
            <p className="text-[12px] text-faint">
              {sm.ingredients.length} ingredients · {sm.cal} cal · {sm.protein}g protein
            </p>
          </div>
          <button
            onClick={() =>
              addAndReturn({
                meal,
                title: sm.name,
                items: sm.ingredients,
                cal: sm.cal,
                protein: sm.protein,
                source: "saved",
              })
            }
            className="shrink-0 text-[13px] font-medium text-bg bg-gold px-3 py-1.5 rounded-pill"
          >
            Add
          </button>
        </div>
      ))}
      <button className="mt-2 text-center text-[13px] text-gold border border-dashed hairline rounded-card py-3">
        + Save a new meal
      </button>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 8a2 2 0 012-2h1.5l1-1.5h7L16.5 6H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" stroke="#5E616B" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" stroke="#5E616B" strokeWidth="1.6" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="#14161B" />
      <path d="M6 11a6 6 0 0012 0M12 19v2" stroke="#14161B" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="#5E616B" strokeWidth="1.8" />
      <path d="M20 20l-4.5-4.5" stroke="#5E616B" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlatePlaceholder() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#5E616B" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="5" stroke="#5E616B" strokeWidth="1.4" />
    </svg>
  );
}
