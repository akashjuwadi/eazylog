"use client";

import { useState } from "react";
import Link from "next/link";

const STEP_COUNT = 4;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("lose");

  const next = () => setStep((s) => Math.min(STEP_COUNT - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <>
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2 mb-6">
          {step > 0 ? (
            <button onClick={back} aria-label="Back" className="w-7 h-7 flex items-center justify-center -ml-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="#F1EFE9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <span className="w-7" />
          )}
          <div className="flex-1 flex gap-1.5">
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-pill ${i <= step ? "bg-gold" : "bg-line"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 scroll-region px-5 pb-4">
        {step === 0 && <GoalStep goal={goal} setGoal={setGoal} />}
        {step === 1 && <AboutStep />}
        {step === 2 && <TargetStep />}
        {step === 3 && <MacroStep />}
      </div>

      <div className="px-5 pb-8 pt-3">
        {step < STEP_COUNT - 1 ? (
          <button
            onClick={next}
            className="w-full text-center text-[14px] font-medium text-bg bg-gold rounded-card py-3.5"
          >
            Continue
          </button>
        ) : (
          <Link
            href="/"
            className="block text-center text-[14px] font-medium text-bg bg-gold rounded-card py-3.5"
          >
            Let's go
          </Link>
        )}
      </div>
    </>
  );
}

function GoalStep({ goal, setGoal }: { goal: string; setGoal: (g: string) => void }) {
  const goals = [
    { id: "lose", label: "Lose weight", detail: "73.5 kg → 68 kg · by Dec 31" },
    { id: "fat", label: "Reduce body fat", detail: "30% → 20%" },
    { id: "maintain", label: "Maintain / recomposition", detail: "Hold weight, shift composition" },
    { id: "gain", label: "Gain muscle", detail: "Build weight steadily" },
  ];

  return (
    <div>
      <h1 className="font-display text-[24px] text-ink font-medium mb-1.5">What's your goal?</h1>
      <p className="text-[13px] text-dim mb-6">You can refine the specifics after this.</p>
      <div className="flex flex-col gap-2.5">
        {goals.map((g) => (
          <button
            key={g.id}
            onClick={() => setGoal(g.id)}
            className={`text-left px-4 py-3.5 rounded-card border ${
              goal === g.id ? "border-gold bg-gold/5" : "hairline bg-surface"
            }`}
          >
            <p className="text-[14px] text-ink mb-0.5">{g.label}</p>
            <p className="text-[12px] text-faint">{g.detail}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function AboutStep() {
  return (
    <div>
      <h1 className="font-display text-[24px] text-ink font-medium mb-1.5">Tell us about you</h1>
      <p className="text-[13px] text-dim mb-6">Only what's needed to estimate your maintenance calories.</p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Sex">
          <select className="field-select">
            <option>Female</option>
            <option>Male</option>
          </select>
        </Field>
        <Field label="Age">
          <input defaultValue={29} className="field-input" />
        </Field>
        <Field label="Height">
          <input defaultValue="170 cm" className="field-input" />
        </Field>
        <Field label="Weight">
          <input defaultValue="73.5 kg" className="field-input" />
        </Field>
      </div>
      <Field label="Body-fat % (optional)">
        <input placeholder="Skip if unknown" className="field-input" />
      </Field>

      <p className="text-[12px] uppercase tracking-wide text-faint mt-6 mb-3">Activity</p>
      <Field label="Strength training days / week">
        <input defaultValue={4} className="field-input" />
      </Field>
      <Field label="Activity outside workouts">
        <select className="field-select">
          <option>Mostly sitting</option>
          <option>On my feet often</option>
          <option>Physically active job</option>
        </select>
      </Field>

      <style>{`
        .field-input, .field-select {
          width: 100%; background: #1D2027; border: 1px solid #2B2E36; border-radius: 4px;
          padding: 10px 12px; font-size: 14px; color: #F1EFE9; outline: none;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-[12px] text-faint mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function TargetStep() {
  return (
    <div>
      <h1 className="font-display text-[24px] text-ink font-medium mb-1.5">Set your calorie target</h1>
      <p className="text-[13px] text-dim mb-6">Based on your goal and timeline. You can adjust this manually.</p>

      <div className="flex flex-col gap-2.5 mb-6">
        <Row label="Estimated maintenance" value="2,450 cal/day" />
        <Row label="Daily deficit" value="−450 cal/day" accent="text-red" />
        <div className="h-px bg-line my-1" />
        <Row label="Daily calorie target" value="2,000 cal/day" big />
      </div>

      <button className="w-full text-center text-[13px] text-dim border hairline rounded-card py-3">
        Adjust manually
      </button>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  big,
}: {
  label: string;
  value: string;
  accent?: string;
  big?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[14px] ${big ? "text-ink" : "text-dim"}`}>{label}</span>
      <span className={`font-tabular ${big ? "text-[18px] text-ink font-display font-medium" : "text-[14px]"} ${accent ?? "text-ink"}`}>
        {value}
      </span>
    </div>
  );
}

function MacroStep() {
  const macros = [
    { label: "Calories", value: "2,000 kcal", required: true },
    { label: "Protein", value: "150 g", required: true },
    { label: "Fiber", value: "35 g", required: true },
    { label: "Carbs", value: "200 g", required: false },
    { label: "Fat", value: "65 g", required: false },
  ];

  return (
    <div>
      <h1 className="font-display text-[24px] text-ink font-medium mb-1.5">Macro goals</h1>
      <p className="text-[13px] text-dim mb-6">
        Calories, protein and fiber are your core targets. Carbs and fat are tracked but optional to worry about.
      </p>
      <div className="flex flex-col gap-2.5">
        {macros.map((m) => (
          <div key={m.label} className="flex items-center justify-between px-4 py-3.5 bg-surface border hairline rounded-card">
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-ink">{m.label}</span>
              {!m.required && <span className="text-[10.5px] text-faint border hairline rounded-pill px-1.5 py-0.5">optional</span>}
            </div>
            <span className="font-tabular text-[14px] text-dim">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
