export const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
  { value: "VERY_HARD", label: "Very hard" },
] as const;

export const DIFFICULTY_WEIGHT: Record<(typeof DIFFICULTY_OPTIONS)[number]["value"], number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  VERY_HARD: 4,
};

export const FOCUS_MODE_PRESETS = {
  POMODORO_25_5: { label: "Pomodoro 25/5", workMinutes: 25, breakMinutes: 5 },
  DEEP_FOCUS_50_10: { label: "Deep Focus 50/10", workMinutes: 50, breakMinutes: 10 },
  SESSION_90: { label: "90 Minute Session", workMinutes: 90, breakMinutes: 0 },
  CUSTOM: { label: "Custom", workMinutes: 25, breakMinutes: 5 },
} as const;

export type FocusModeKey = keyof typeof FOCUS_MODE_PRESETS;

export const SUBJECT_COLOR_SWATCHES = [
  "#0D9488", // teal (brand)
  "#2563EB", // blue
  "#7C3AED", // violet
  "#DB2777", // pink
  "#DC2626", // red
  "#EA580C", // orange
  "#CA8A04", // yellow
  "#16A34A", // green
  "#0891B2", // cyan
  "#64748B", // slate
] as const;
