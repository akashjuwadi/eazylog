export const today = {
  calories: { eaten: 1240, target: 2000 },
  protein: { eaten: 100, target: 150 },
  fiber: { eaten: 18, target: 35 },
  carbs: { eaten: 130, target: 200 },
  fat: { eaten: 48, target: 65 },
};

export const meals = [
  {
    id: "breakfast",
    label: "Breakfast",
    time: "7:12 AM",
    done: true,
    items: [
      { name: "2 boiled eggs", cal: 156, protein: 12 },
      { name: "1 banana", cal: 105, protein: 1 },
      { name: "ON Gold Standard Whey, 1 scoop", cal: 120, protein: 24 },
      { name: "Whole milk, 3 fl oz", cal: 55, protein: 3 },
    ],
    total: { cal: 436, protein: 40 },
  },
  {
    id: "lunch",
    label: "Lunch",
    time: "12:42 PM",
    done: true,
    items: [
      { name: "Chicken breast, ~150g", cal: 248, protein: 46 },
      { name: "Rice, ~1 cup", cal: 206, protein: 4 },
      { name: "Chickpea curry, ~½ cup", cal: 165, protein: 6 },
      { name: "Green beans, ~½ cup", cal: 63, protein: 1 },
    ],
    total: { cal: 682, protein: 51 },
  },
  {
    id: "dinner",
    label: "Dinner",
    time: "",
    done: false,
    items: [],
    total: { cal: 0, protein: 0 },
  },
  {
    id: "snacks",
    label: "Snacks",
    time: "",
    done: false,
    items: [],
    total: { cal: 0, protein: 0 },
  },
];

export const savedMeals = [
  {
    id: "protein-shake",
    name: "Protein Shake",
    cal: 490,
    protein: 43,
    ingredients: [
      "ON Vanilla Whey — 1 scoop",
      "Whole milk — 3 fl oz",
      "Almonds — 5",
      "Walnuts — 4",
      "Strawberries — 4",
    ],
  },
  {
    id: "chicken-rice-bowl",
    name: "Chicken & Rice Bowl",
    cal: 682,
    protein: 51,
    ingredients: [
      "Chicken breast — 150g",
      "Rice — 1 cup",
      "Chickpea curry — ½ cup",
      "Green beans — ½ cup",
    ],
  },
  {
    id: "overnight-oats",
    name: "Overnight Oats",
    cal: 410,
    protein: 22,
    ingredients: ["Rolled oats — ½ cup", "Whey — 1 scoop", "Chia seeds — 1 tbsp", "Almond milk — 1 cup"],
  },
];

// 30-day calendar mock — day status drives the crown / partial / miss marks.
export type DayStatus = "perfect" | "logged" | "partial" | "missed" | "future";
export const calendarDays: { date: number; status: DayStatus }[] = [
  { date: 1, status: "perfect" }, { date: 2, status: "perfect" }, { date: 3, status: "logged" },
  { date: 4, status: "perfect" }, { date: 5, status: "partial" }, { date: 6, status: "missed" },
  { date: 7, status: "perfect" }, { date: 8, status: "perfect" }, { date: 9, status: "logged" },
  { date: 10, status: "perfect" }, { date: 11, status: "perfect" }, { date: 12, status: "partial" },
  { date: 13, status: "logged" }, { date: 14, status: "perfect" }, { date: 15, status: "perfect" },
  { date: 16, status: "perfect" }, { date: 17, status: "missed" }, { date: 18, status: "perfect" },
  { date: 19, status: "logged" }, { date: 20, status: "perfect" }, { date: 21, status: "perfect" },
  { date: 22, status: "partial" }, { date: 23, status: "perfect" }, { date: 24, status: "future" },
  { date: 25, status: "future" }, { date: 26, status: "future" }, { date: 27, status: "future" },
  { date: 28, status: "future" }, { date: 29, status: "future" }, { date: 30, status: "future" },
];

export const streak = {
  loggingStreak: 12,
  perfectDaysThisWeek: 5,
  loggedDaysThisWeek: 7,
  proteinHitDaysThisWeek: 6,
};

export const history = [
  {
    id: "lunch",
    label: "Lunch",
    time: "12:42 PM",
    cal: 682,
    protein: 51,
    items: ["Chicken breast", "Rice", "Chickpea curry", "Green beans"],
  },
  {
    id: "breakfast",
    label: "Breakfast",
    time: "7:12 AM",
    cal: 436,
    protein: 40,
    items: ["2 boiled eggs", "1 banana", "ON Gold Standard Whey", "Whole milk"],
  },
];
