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
