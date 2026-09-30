"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLog, type ActivityLevel, type Goal, type UserProfile } from "@/lib/store";
import {
  MAX_TARGET,
  MIN_TARGET,
  aboutIssue,
  buildPlan,
  defaultTargetDate,
  formatDate,
  goalIssue,
  suggestMacros,
  type Issue,
  type Plan,
  type PlanInput,
} from "@/lib/plan";

const STEP_COUNT = 4;

const ACTIVITY_OPTIONS: { id: ActivityLevel; label: string; detail: string }[] = [
  { id: "sedentary", label: "Mostly sitting", detail: "Desk job, short walks" },
  { id: "light", label: "On my feet often", detail: "Teaching, retail, lots of walking" },
  { id: "active", label: "Physically active job", detail: "Trades, nursing, hospitality" },
];

// ---------- form state ----------
// Inputs are kept as strings while typing and converted to numbers on demand.

type Form = {
  goal: Goal;
  targetWeight: string;
  targetBodyFat: string;
  targetDate: string;
  sex: UserProfile["sex"];
  age: string;
  height: string;
  weight: string;
  bodyFat: string;
  strengthDays: number;
  activity: ActivityLevel;
};

type SetField = <K extends keyof Form>(key: K, value: Form[K]) => void;

function formFromProfile(p: UserProfile): Form {
  return {
    goal: p.goal,
    targetWeight: String(p.targetWeightKg ?? 68),
    targetBodyFat: p.targetBodyFatPct !== undefined ? String(p.targetBodyFatPct) : "",
    targetDate: p.targetDate ?? defaultTargetDate(),
    sex: p.sex,
    age: String(p.age),
    height: String(p.heightCm),
    weight: String(p.weightKg),
    bodyFat: p.bodyFatPct !== undefined ? String(p.bodyFatPct) : "",
    strengthDays: p.strengthDays,
    activity: p.activity,
  };
}

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));
const optNum = (s: string) => {
  const v = num(s);
  return Number.isFinite(v) ? v : undefined;
};
const fmt = (x: number) => String(Math.round(x * 10) / 10);
const commas = (x: number) => x.toLocaleString("en-US");

function toInput(f: Form): PlanInput {
  const hasDate = f.goal === "lose" || f.goal === "fat";
  return {
    goal: f.goal,
    sex: f.sex,
    age: num(f.age),
    heightCm: num(f.height),
    weightKg: num(f.weight),
    bodyFatPct: optNum(f.bodyFat),
    strengthDays: f.strengthDays,
    activity: f.activity,
    targetWeightKg: f.goal === "lose" ? optNum(f.targetWeight) : undefined,
    targetBodyFatPct: f.goal === "fat" ? optNum(f.targetBodyFat) : undefined,
    targetDate: hasDate ? f.targetDate : undefined,
  };
}

// ---------- page ----------

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, saveProfile, hydrated } = useLog();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(() => formFromProfile(profile));
  const [loaded, setLoaded] = useState(false);
  const [manual, setManual] = useState(false);
  const [override, setOverride] = useState("");

  // Once saved data is available, start from it (matters if onboarding is re-run).
  useEffect(() => {
    if (hydrated && !loaded) {
      setForm(formFromProfile(profile));
      setLoaded(true);
    }
  }, [hydrated, loaded, profile]);

  const set: SetField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const input = useMemo(() => toInput(form), [form]);
  const gIssue = useMemo(() => goalIssue(input), [input]);
  const aIssue = useMemo(() => aboutIssue(input), [input]);

  const overrideVal = num(override);
  const overrideBad = manual && !(overrideVal >= MIN_TARGET && overrideVal <= MAX_TARGET);
  const tIssue: Issue | null = overrideBad
    ? { kind: "missing", message: `Enter a target between ${commas(MIN_TARGET)} and ${commas(MAX_TARGET)} cal/day.` }
    : null;

  const ready = !gIssue && !aIssue;
  const plan = useMemo(
    () => (ready ? buildPlan(input, manual && !overrideBad ? overrideVal : undefined) : null),
    [ready, input, manual, overrideBad, overrideVal]
  );
  const macros = plan ? suggestMacros(input, plan.target) : null;

  const issue = step === 0 ? gIssue : step === 1 ? aIssue : step === 2 ? tIssue : null;
  const isLast = step === STEP_COUNT - 1;

  const next = () => {
    if (issue) return;
    setStep((s) => Math.min(STEP_COUNT - 1, s + 1));
  };
  const back = () => {
    if (step === 2) setManual(false); // recompute from scratch if earlier answers change
    setStep((s) => Math.max(0, s - 1));
  };

  function finish() {
    if (!plan || !macros) return;
    const hasDate = form.goal === "lose" || form.goal === "fat";
    saveProfile({
      goal: form.goal,
      sex: form.sex,
      age: input.age,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      bodyFatPct: input.bodyFatPct,
      strengthDays: form.strengthDays,
      activity: form.activity,
      targetWeightKg: input.targetWeightKg,
      targetBodyFatPct: input.targetBodyFatPct,
      targetDate: hasDate ? form.targetDate : undefined,
      maintenanceCalories: plan.maintenance,
      targets: { calories: plan.target, ...macros },
      onboarded: true,
    });
    router.push("/");
  }

  return (
    <>
      <style>{FIELD_CSS}</style>

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
              <span key={i} className={`h-1 flex-1 rounded-pill ${i <= step ? "bg-gold" : "bg-line"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 scroll-region px-5 pb-4">
        {step === 0 && <GoalStep form={form} set={set} issue={gIssue} />}
        {step === 1 && <AboutStep form={form} set={set} issue={aIssue} />}
        {step === 2 && plan && (
          <TargetStep
            plan={plan}
            input={input}
            manual={manual}
            override={override}
            overrideVal={overrideVal}
            issue={tIssue}
            onOverride={setOverride}
            onManual={(on) => {
              if (on) setOverride(String(plan.recommended));
              setManual(on);
            }}
          />
        )}
        {step === 3 && plan && macros && <MacroStep plan={plan} macros={macros} />}
      </div>

      <div className="px-5 pb-8 pt-3">
        <button
          onClick={isLast ? finish : next}
          disabled={!!issue}
          className="w-full text-center text-[14px] font-medium text-bg bg-gold rounded-card py-3.5 disabled:opacity-40"
        >
          {isLast ? "Let's go" : "Continue"}
        </button>
      </div>
    </>
  );
}

// ---------- step 1: goal ----------

function GoalStep({ form, set, issue }: { form: Form; set: SetField; issue: Issue | null }) {
  const currentWeight = num(form.weight);
  const goalWeight = num(form.targetWeight);
  const bf = num(form.bodyFat);
  const tbf = num(form.targetBodyFat);
  const by = formatDate(form.targetDate);

  const goals: { id: Goal; label: string; detail: string }[] = [
    {
      id: "lose",
      label: "Lose weight",
      detail:
        Number.isFinite(currentWeight) && Number.isFinite(goalWeight) && by
          ? `${fmt(currentWeight)} kg → ${fmt(goalWeight)} kg · by ${by}`
          : "Set a goal weight and date",
    },
    {
      id: "fat",
      label: "Reduce body fat",
      detail:
        Number.isFinite(bf) && Number.isFinite(tbf)
          ? `${fmt(bf)}% → ${fmt(tbf)}%${by ? ` · by ${by}` : ""}`
          : "Set a target body-fat % and date",
    },
    { id: "maintain", label: "Maintain / recomposition", detail: "Hold weight, shift composition" },
    { id: "gain", label: "Gain muscle", detail: "Build weight steadily" },
  ];

  return (
    <div>
      <h1 className="font-display text-[24px] text-ink font-medium mb-1.5">What&apos;s your goal?</h1>
      <p className="text-[13px] text-dim mb-6">Your calorie target is built around this.</p>

      <div className="flex flex-col gap-2.5">
        {goals.map((g) => {
          const selected = form.goal === g.id;
          return (
            <div
              key={g.id}
              className={`rounded-card border ${selected ? "border-gold bg-gold/5" : "hairline bg-surface"}`}
            >
              <button
                onClick={() => set("goal", g.id)}
                aria-pressed={selected}
                className="w-full text-left px-4 py-3.5"
              >
                <p className="text-[14px] text-ink mb-0.5">{g.label}</p>
                <p className="text-[12px] text-faint">{g.detail}</p>
              </button>

              {selected && g.id === "lose" && (
                <div className="px-4 pb-2 grid grid-cols-2 gap-3">
                  <UnitInput
                    label="Goal weight"
                    unit="kg"
                    value={form.targetWeight}
                    onChange={(v) => set("targetWeight", v)}
                  />
                  <DateField label="Target date" value={form.targetDate} onChange={(v) => set("targetDate", v)} />
                </div>
              )}

              {selected && g.id === "fat" && (
                <div className="px-4 pb-2 grid grid-cols-2 gap-3">
                  <UnitInput
                    label="Current body fat"
                    unit="%"
                    value={form.bodyFat}
                    placeholder="e.g. 30"
                    onChange={(v) => set("bodyFat", v)}
                  />
                  <UnitInput
                    label="Target body fat"
                    unit="%"
                    value={form.targetBodyFat}
                    placeholder="e.g. 20"
                    onChange={(v) => set("targetBodyFat", v)}
                  />
                  <div className="col-span-2">
                    <DateField label="Target date" value={form.targetDate} onChange={(v) => set("targetDate", v)} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Hint issue={issue} />
    </div>
  );
}

// ---------- step 2: about you ----------

function AboutStep({ form, set, issue }: { form: Form; set: SetField; issue: Issue | null }) {
  return (
    <div>
      <h1 className="font-display text-[24px] text-ink font-medium mb-1.5">Tell us about you</h1>
      <p className="text-[13px] text-dim mb-6">Only what&apos;s needed to estimate your maintenance calories.</p>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Sex">
          <select
            className="field-select"
            value={form.sex}
            onChange={(e) => set("sex", e.target.value as Form["sex"])}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </Field>
        <UnitInput label="Age" unit="yrs" decimal={false} value={form.age} onChange={(v) => set("age", v)} />
        <UnitInput label="Height" unit="cm" value={form.height} onChange={(v) => set("height", v)} />
        <UnitInput label="Weight" unit="kg" value={form.weight} onChange={(v) => set("weight", v)} />
      </div>
      <UnitInput
        label={form.goal === "fat" ? "Body-fat %" : "Body-fat % (optional)"}
        unit="%"
        value={form.bodyFat}
        placeholder="Skip if unknown"
        onChange={(v) => set("bodyFat", v)}
      />

      <p className="text-[12px] uppercase tracking-wide text-faint mt-6 mb-3">Activity</p>

      <p className="text-[12px] text-faint mb-1.5">How many days a week do you strength train?</p>
      <div className="flex gap-1.5 mb-5">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((d) => {
          const selected = form.strengthDays === d;
          return (
            <button
              key={d}
              onClick={() => set("strengthDays", d)}
              aria-pressed={selected}
              className={`flex-1 py-2.5 rounded-card border text-[14px] font-tabular ${
                selected ? "border-gold bg-gold/5 text-ink" : "hairline bg-surface text-dim"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      <p className="text-[12px] text-faint mb-1.5">How active are you outside workouts?</p>
      <div className="flex flex-col gap-2">
        {ACTIVITY_OPTIONS.map((o) => {
          const selected = form.activity === o.id;
          return (
            <button
              key={o.id}
              onClick={() => set("activity", o.id)}
              aria-pressed={selected}
              className={`text-left px-4 py-3 rounded-card border ${
                selected ? "border-gold bg-gold/5" : "hairline bg-surface"
              }`}
            >
              <p className="text-[14px] text-ink">{o.label}</p>
              <p className="text-[12px] text-faint">{o.detail}</p>
            </button>
          );
        })}
      </div>

      <Hint issue={issue} />
    </div>
  );
}

// ---------- step 3: calorie target ----------

function TargetStep({
  plan,
  input,
  manual,
  override,
  overrideVal,
  issue,
  onOverride,
  onManual,
}: {
  plan: Plan;
  input: PlanInput;
  manual: boolean;
  override: string;
  overrideVal: number;
  issue: Issue | null;
  onOverride: (v: string) => void;
  onManual: (on: boolean) => void;
}) {
  const { adjustment } = plan;
  const adjustLabel = adjustment < 0 ? "Daily deficit" : adjustment > 0 ? "Daily surplus" : "Daily adjustment";
  const adjustValue =
    adjustment < 0 ? `−${commas(-adjustment)} cal/day` : adjustment > 0 ? `+${commas(adjustment)} cal/day` : "0 cal/day";
  const adjustAccent = adjustment < 0 ? "text-red" : adjustment > 0 ? "text-green" : undefined;

  const stepBy = (delta: number) => {
    const base = Number.isFinite(overrideVal) ? overrideVal : plan.target;
    onOverride(String(Math.min(MAX_TARGET, Math.max(MIN_TARGET, base + delta))));
  };

  return (
    <div>
      <h1 className="font-display text-[24px] text-ink font-medium mb-1.5">Set your calorie target</h1>
      <p className="text-[13px] text-dim mb-6">Based on your goal and timeline. You can adjust this manually.</p>

      <div className="flex flex-col gap-2.5 mb-4">
        <Row label="Estimated maintenance" value={`${commas(plan.maintenance)} cal/day`} />
        <Row label={adjustLabel} value={adjustValue} accent={adjustAccent} />
        <div className="h-px bg-line my-1" />
        <Row label="Daily calorie target" value={`${commas(plan.target)} cal/day`} big />
      </div>

      <p className="text-[13px] text-dim mb-4">{projection(plan, input)}</p>

      {plan.notes.map((t) => (
        <p key={t} className="text-[12px] text-dim bg-surface border hairline rounded-card px-3 py-2.5 mb-2">
          {t}
        </p>
      ))}
      {plan.warnings.map((t) => (
        <p key={t} className="text-[12px] text-red bg-surface border hairline rounded-card px-3 py-2.5 mb-2">
          {t}
        </p>
      ))}

      <div className="mt-4">
        {!manual ? (
          <button
            onClick={() => onManual(true)}
            className="w-full text-center text-[13px] text-dim border hairline rounded-card py-3"
          >
            Adjust manually
          </button>
        ) : (
          <div className="border hairline rounded-card bg-surface px-4 py-3.5">
            <p className="text-[12px] text-faint mb-2">Your daily calorie target</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => stepBy(-50)}
                aria-label="Decrease by 50"
                className="w-10 h-10 shrink-0 rounded-card border hairline text-ink text-[18px]"
              >
                −
              </button>
              <input
                value={override}
                onChange={(e) => onOverride(e.target.value.replace(/[^\d]/g, ""))}
                inputMode="numeric"
                aria-label="Daily calorie target"
                className="field-input text-center font-tabular"
              />
              <button
                onClick={() => stepBy(50)}
                aria-label="Increase by 50"
                className="w-10 h-10 shrink-0 rounded-card border hairline text-ink text-[18px]"
              >
                +
              </button>
            </div>
            <Hint issue={issue} />
            <button onClick={() => onManual(false)} className="mt-3 text-[12px] text-gold">
              Reset to recommended ({commas(plan.recommended)})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function projection(plan: Plan, input: PlanInput): string {
  const weekly = Math.abs(plan.weeklyChangeKg);
  if (plan.goalWeightKg !== null && plan.finishISO) {
    const goal =
      input.goal === "fat"
        ? `about ${input.targetBodyFatPct}% body fat (${fmt(plan.goalWeightKg)} kg)`
        : `${fmt(plan.goalWeightKg)} kg`;
    return `At this target you'd reach ${goal} around ${formatDate(plan.finishISO)}, losing roughly ${fmt(weekly)} kg a week.`;
  }
  if (input.goal === "gain" && plan.weeklyChangeKg > 0) {
    return `Expect to gain roughly ${fmt(weekly)} kg a week.`;
  }
  if (input.goal === "maintain") return "This keeps your weight about steady.";
  return "";
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
      <span
        className={`font-tabular ${big ? "text-[18px] text-ink font-display font-medium" : "text-[14px]"} ${
          accent ?? "text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ---------- step 4: macros ----------

function MacroStep({
  plan,
  macros,
}: {
  plan: Plan;
  macros: { protein: number; carbs: number; fat: number; fiber: number };
}) {
  const rows = [
    { label: "Calories", value: `${commas(plan.target)} kcal`, required: true },
    { label: "Protein", value: `${macros.protein} g`, required: true },
    { label: "Fiber", value: `${macros.fiber} g`, required: true },
    { label: "Carbs", value: `${macros.carbs} g`, required: false },
    { label: "Fat", value: `${macros.fat} g`, required: false },
  ];

  return (
    <div>
      <h1 className="font-display text-[24px] text-ink font-medium mb-1.5">Macro goals</h1>
      <p className="text-[13px] text-dim mb-6">
        Calories, protein and fiber are your core targets. Carbs and fat are tracked but optional to worry about.
      </p>
      <div className="flex flex-col gap-2.5">
        {rows.map((m) => (
          <div
            key={m.label}
            className="flex items-center justify-between px-4 py-3.5 bg-surface border hairline rounded-card"
          >
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-ink">{m.label}</span>
              {!m.required && (
                <span className="text-[10.5px] text-faint border hairline rounded-pill px-1.5 py-0.5">optional</span>
              )}
            </div>
            <span className="font-tabular text-[14px] text-dim">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- shared bits ----------

const FIELD_CSS = `
  .field-input, .field-select {
    width: 100%; background: #1D2027; border: 1px solid #2B2E36; border-radius: 4px;
    padding: 10px 12px; font-size: 14px; color: #F1EFE9; color-scheme: dark;
  }
  .field-input:focus, .field-select:focus { border-color: #E8B23D; }
  .field-input--unit { padding-right: 38px; }
`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-[12px] text-faint mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function sanitize(v: string, decimal: boolean) {
  if (!decimal) return v.replace(/[^\d]/g, "");
  return v.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
}

function UnitInput({
  label,
  unit,
  value,
  onChange,
  placeholder,
  decimal = true,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  decimal?: boolean;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(sanitize(e.target.value, decimal))}
          inputMode={decimal ? "decimal" : "numeric"}
          placeholder={placeholder}
          className="field-input field-input--unit"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-faint pointer-events-none">
          {unit}
        </span>
      </div>
    </Field>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="field-input" />
    </Field>
  );
}

function Hint({ issue }: { issue: Issue | null }) {
  if (!issue) return null;
  return (
    <p className={`text-[12px] mt-3 ${issue.kind === "invalid" ? "text-red" : "text-faint"}`}>{issue.message}</p>
  );
}
