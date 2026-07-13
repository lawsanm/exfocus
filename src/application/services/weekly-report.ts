export interface WeeklyReportInput {
  hoursThisWeek: number;
  hoursLastWeek: number;
  tasksCompleted: number;
  currentStreak: number;
  weakestSubject: { name: string; preparationPercent: number } | null;
  bestSubject: { name: string; preparationPercent: number } | null;
}

export interface WeeklyReportSuggestion {
  text: string;
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function generateWeeklySuggestions(input: WeeklyReportInput): string[] {
  const suggestions: string[] = [];
  const trend = percentChange(input.hoursThisWeek, input.hoursLastWeek);

  if (input.weakestSubject && input.weakestSubject.preparationPercent < 50) {
    suggestions.push(
      `Spend more time on ${input.weakestSubject.name} — preparation is at ${input.weakestSubject.preparationPercent}%.`,
    );
  }

  if (trend <= -20) {
    suggestions.push(
      `Your study hours dropped ${Math.abs(trend)}% from last week. Try scheduling shorter, more frequent sessions.`,
    );
  } else if (trend >= 20) {
    suggestions.push(`Great momentum — you studied ${trend}% more than last week.`);
  }

  if (input.currentStreak === 0) {
    suggestions.push("Start a new streak today with a quick focus session.");
  }

  if (input.tasksCompleted === 0) {
    suggestions.push(
      "Nothing was marked complete this week — check in on your assignment progress.",
    );
  }

  if (suggestions.length === 0) {
    suggestions.push("Solid week overall — keep the same pace going into next week.");
  }

  return suggestions;
}

export function computeProductivityTrend(hoursThisWeek: number, hoursLastWeek: number): number {
  return percentChange(hoursThisWeek, hoursLastWeek);
}
