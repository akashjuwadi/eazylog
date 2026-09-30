import type { ActivityLevel, UserProfile } from "./store";

/**
 * Onboarding maths: maintenance calories, goal-based calorie target, macros.
 * Everything here is pure (no React, no storage) so it is easy to test.
 */

export const KCAL_PER_KG = 7700; // ≈ energy in 1 kg of body weight change
export const GAIN_SURPLUS = 250; // default daily surplus for a "gain" goal
export const DEFAULT_LOSS_DEFICIT = 500; // used when a loss goal has no usable date
export const MIN_TARGET = 800;
export const MAX_TARGET = 6000;

// Baseline multiplier for life outside workouts…
const ACTIVITY_BASE: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.35,
  active: 1.5,
};
// …plus a bump per weekly strength session (≈ 290 kcal/session for a ~1,650 kcal BMR).
const STRENGTH_BONUS_PER_DAY = 0.025;

export type PlanInput = Pick<
  UserProfile,
  | "goal"
  | "sex"
  | "age"
  | "heightCm"
  | "weightKg"
  | "bodyFatPct"
  | "strengthDays"
  | "activity"
  | "targetWeightKg"
  | "targetBodyFatPct"
  | "targetDate"
>;

export type Plan = {
  maintenance: number;
  /** The calorie target in effect (the recommendation, or the manual override). */
  target: number;
  /** target − maintenance. Negative = deficit, positive = surplus. */
  adjustment: number;
  /** What we would recommend, regardless of any override. */
  recommended: number;
  /** Expected weekly weight change in kg (negative = loss) at `target`. */
  weeklyChangeKg: number;
  goalWeightKg: number | null;
  /** ISO date the goal is reached at `target`, if it can be estimated. */
  finishISO: string | null;
  notes: string[];
  warnings: string[];
};

export type Issue = { message: string; kind: "missing" | "invalid" };

// ---------- small helpers ----------

const n = (x: number) => x.toLocaleString("en-US");
const finite = (x: number | undefined): x is number => typeof x === "number" && Number.isFinite(x);
const inRange = (x: number | undefined, lo: number, hi: number): x is number =>
  finite(x) && x >= lo && x <= hi;

// ---------- dates (all local, all ISO "YYYY-MM-DD") ----------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseISODate(iso: string | undefined): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getMonth() === Number(m[2]) - 1 ? d : null; // rejects e.g. 02-31
}

/** "Dec 31", or "Feb 11, 2027" when the year isn't the current one. */
export function formatDate(iso: string | undefined, now = new Date()): string {
  const d = parseISODate(iso);
  if (!d) return "";
  const base = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  return d.getFullYear() === now.getFullYear() ? base : `${base}, ${d.getFullYear()}`;
}

export function daysUntil(iso: string | undefined, now = new Date()): number | null {
  const end = parseISODate(iso);
  if (!end) return null;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

/** Dec 31 of this year, or of next year if that is less than two weeks away. */
export function defaultTargetDate(now = new Date()): string {
  const end = new Date(now.getFullYear(), 11, 31);
  const days = daysUntil(toISODate(end), now) ?? 0;
  return toISODate(days >= 14 ? end : new Date(now.getFullYear() + 1, 11, 31));
}

function addDaysISO(now: Date, days: number): string {
  return toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + days));
}

// ---------- energy ----------

/** Mifflin–St Jeor basal metabolic rate. */
export function bmr(i: Pick<PlanInput, "sex" | "age" | "heightCm" | "weightKg">): number {
  const base = 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age;
  return i.sex === "male" ? base + 5 : base - 161;
}

/** Estimated maintenance calories, rounded to the nearest 10. */
export function maintenanceCalories(i: PlanInput): number {
  const days = Math.min(7, Math.max(0, i.strengthDays));
  const multiplier = ACTIVITY_BASE[i.activity] + STRENGTH_BONUS_PER_DAY * days;
  return Math.round((bmr(i) * multiplier) / 10) * 10;
}

export function calorieFloor(sex: PlanInput["sex"]): number {
  return sex === "male" ? 1500 : 1200;
}

/** Largest deficit we are willing to recommend. */
function maxDeficit(i: PlanInput, maintenance: number): number {
  return Math.max(
    0,
    Math.min(
      0.25 * maintenance, // never cut more than a quarter of maintenance
      11 * i.weightKg, // ≈ 1% of body weight per week
      1000,
      maintenance - calorieFloor(i.sex)
    )
  );
}

/**
 * Weight the user is aiming for. For a body-fat goal we assume lean mass is
 * kept, so goal weight = lean mass ÷ (1 − target body-fat fraction).
 */
export function goalWeightKg(i: PlanInput): number | null {
  if (i.goal === "lose") return finite(i.targetWeightKg) ? i.targetWeightKg : null;
  if (i.goal === "fat") {
    const bf = i.bodyFatPct;
    const tbf = i.targetBodyFatPct;
    if (finite(bf) && finite(tbf) && tbf < bf && finite(i.weightKg)) {
      const lean = i.weightKg * (1 - bf / 100);
      return lean / (1 - tbf / 100);
    }
  }
  return null;
}

function goalLabel(i: PlanInput, kg: number): string {
  const rounded = Math.round(kg * 10) / 10;
  return i.goal === "fat" ? `${i.targetBodyFatPct}% body fat (about ${rounded} kg)` : `${rounded} kg`;
}

// ---------- validation ----------

const missing = (message: string): Issue => ({ message, kind: "missing" });
const invalid = (message: string): Issue => ({ message, kind: "invalid" });

/** Step 1: the goal-specific fields. */
export function goalIssue(i: PlanInput, now = new Date()): Issue | null {
  if (i.goal !== "lose" && i.goal !== "fat") return null;

  if (i.goal === "lose") {
    if (!inRange(i.targetWeightKg, 30, 300)) return missing("Enter your goal weight.");
  } else {
    if (!inRange(i.bodyFatPct, 5, 60)) return missing("Enter your current body-fat %.");
    if (!inRange(i.targetBodyFatPct, 3, 60)) return missing("Enter a target body-fat %.");
    if (i.targetBodyFatPct >= i.bodyFatPct) {
      return invalid("Your target body-fat % needs to be lower than your current one.");
    }
  }

  const days = daysUntil(i.targetDate, now);
  if (days === null) return missing("Pick a target date.");
  if (days < 1) return invalid("Pick a target date in the future.");
  return null;
}

/** Step 2: the body stats, plus checks that depend on both steps. */
export function aboutIssue(i: PlanInput): Issue | null {
  if (!inRange(i.age, 14, 100)) return missing("Enter your age (14–100).");
  if (!inRange(i.heightCm, 120, 230)) return missing("Enter your height in cm (120–230).");
  if (!inRange(i.weightKg, 30, 300)) return missing("Enter your weight in kg (30–300).");

  if (i.bodyFatPct !== undefined && !inRange(i.bodyFatPct, 5, 60)) {
    return invalid("Body fat should be between 5% and 60%, or leave it blank.");
  }
  if (i.goal === "fat" && !finite(i.bodyFatPct)) {
    return missing("A body-fat goal needs your current body-fat %.");
  }
  if (i.goal === "lose" && finite(i.targetWeightKg) && i.targetWeightKg >= i.weightKg) {
    return invalid("Your goal weight needs to be below your current weight. Go back to change your goal.");
  }
  return null;
}

// ---------- the plan ----------

/**
 * Build the calorie plan. Pass `override` to evaluate a manually chosen target;
 * the recommendation is still returned alongside it.
 */
export function buildPlan(input: PlanInput, override?: number, now = new Date()): Plan {
  const maintenance = maintenanceCalories(input);
  const floor = calorieFloor(input.sex);
  const goalKg = goalWeightKg(input);
  const toLose = goalKg !== null ? input.weightKg - goalKg : 0;
  const notes: string[] = [];
  const warnings: string[] = [];

  let recommended = maintenance;

  if ((input.goal === "lose" || input.goal === "fat") && goalKg !== null && toLose > 0) {
    const cap = Math.floor(maxDeficit(input, maintenance) / 10) * 10;
    const days = daysUntil(input.targetDate, now);
    let deficit: number;

    if (days !== null && days > 0) {
      const required = (toLose * KCAL_PER_KG) / days;
      if (required > cap) {
        deficit = cap;
        if (cap > 0 && input.targetDate) {
          const finish = addDaysISO(now, Math.ceil((toLose * KCAL_PER_KG) / cap));
          notes.push(
            `Reaching ${goalLabel(input, goalKg)} by ${formatDate(input.targetDate, now)} would take about ` +
              `${n(Math.round(required))} cal/day, which is more than we'd recommend. We capped the deficit at ` +
              `${n(cap)}, which gets you there around ${formatDate(finish, now)}.`
          );
        }
      } else {
        // Round up so the projected finish lands on or before the chosen date.
        deficit = Math.min(Math.ceil(required / 10) * 10, cap);
      }
    } else {
      deficit = Math.min(DEFAULT_LOSS_DEFICIT, cap);
    }
    recommended = maintenance - deficit;
  } else if (input.goal === "gain") {
    recommended = maintenance + GAIN_SURPLUS;
  }

  const target = Math.round(finite(override) ? override : recommended);
  const adjustment = target - maintenance;
  const weeklyChangeKg = (adjustment * 7) / KCAL_PER_KG;

  let finishISO: string | null = null;
  if (goalKg !== null && toLose > 0) {
    if (adjustment < 0) {
      finishISO = addDaysISO(now, Math.ceil((toLose * KCAL_PER_KG) / -adjustment));
    } else {
      warnings.push("At or above maintenance, this target won't move your weight down.");
    }
  }
  if (input.goal === "gain" && adjustment <= 0) {
    warnings.push("At or below maintenance, this target won't help you gain weight.");
  }
  if (input.goal === "maintain" && Math.abs(adjustment) > 150) {
    notes.push(
      `This is away from maintenance, so your weight will slowly drift ${adjustment < 0 ? "down" : "up"}.`
    );
  }
  if (target < floor) {
    warnings.push(
      `Going below ${n(floor)} cal/day is hard to sustain and makes it tough to get enough nutrients.`
    );
  }
  if (weeklyChangeKg < -0.01 * input.weightKg) {
    warnings.push(
      "That's faster than about 1% of your body weight per week, which raises the risk of losing muscle."
    );
  }

  return { maintenance, target, adjustment, recommended, weeklyChangeKg, goalWeightKg: goalKg, finishISO, notes, warnings };
}

// ---------- macros ----------

/** Protein ≈ 2 g/kg, fat ≈ 25% of calories, carbs fill the rest, fiber ≈ 14 g per 1,000 kcal. */
export function suggestMacros(input: Pick<PlanInput, "weightKg">, calories: number) {
  const round5 = (x: number) => Math.round(x / 5) * 5;
  const protein = Math.min(round5(2 * input.weightKg), round5((0.35 * calories) / 4));
  const fat = Math.round((0.25 * calories) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  const fiber = Math.max(25, Math.round((14 * calories) / 1000));
  return { protein, carbs, fat, fiber };
}
