import { describe, expect, it } from "vitest";
import {
  computeProductivityTrend,
  generateWeeklySuggestions,
} from "@/application/services/weekly-report";

describe("computeProductivityTrend", () => {
  it("returns 0 when both weeks have no hours", () => {
    expect(computeProductivityTrend(0, 0)).toBe(0);
  });

  it("returns 100 when starting from zero hours last week", () => {
    expect(computeProductivityTrend(5, 0)).toBe(100);
  });

  it("computes a positive percent increase", () => {
    expect(computeProductivityTrend(12, 10)).toBe(20);
  });

  it("computes a negative percent decrease", () => {
    expect(computeProductivityTrend(5, 10)).toBe(-50);
  });
});

describe("generateWeeklySuggestions", () => {
  it("flags a weak subject under 50% preparation", () => {
    const suggestions = generateWeeklySuggestions({
      hoursThisWeek: 10,
      hoursLastWeek: 10,
      tasksCompleted: 2,
      currentStreak: 3,
      weakestSubject: { name: "Algorithms", preparationPercent: 30 },
      bestSubject: { name: "History", preparationPercent: 90 },
    });
    expect(suggestions.some((s) => s.includes("Algorithms"))).toBe(true);
  });

  it("celebrates a big increase in study hours", () => {
    const suggestions = generateWeeklySuggestions({
      hoursThisWeek: 15,
      hoursLastWeek: 10,
      tasksCompleted: 3,
      currentStreak: 5,
      weakestSubject: null,
      bestSubject: null,
    });
    expect(suggestions.some((s) => s.toLowerCase().includes("momentum"))).toBe(true);
  });

  it("warns about a big drop in study hours", () => {
    const suggestions = generateWeeklySuggestions({
      hoursThisWeek: 4,
      hoursLastWeek: 10,
      tasksCompleted: 1,
      currentStreak: 2,
      weakestSubject: null,
      bestSubject: null,
    });
    expect(suggestions.some((s) => s.includes("dropped"))).toBe(true);
  });

  it("falls back to a generic encouragement when nothing else triggers", () => {
    const suggestions = generateWeeklySuggestions({
      hoursThisWeek: 10,
      hoursLastWeek: 10,
      tasksCompleted: 3,
      currentStreak: 5,
      weakestSubject: { name: "Physics", preparationPercent: 80 },
      bestSubject: { name: "Physics", preparationPercent: 80 },
    });
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it("always returns at least one suggestion", () => {
    const suggestions = generateWeeklySuggestions({
      hoursThisWeek: 0,
      hoursLastWeek: 0,
      tasksCompleted: 0,
      currentStreak: 0,
      weakestSubject: null,
      bestSubject: null,
    });
    expect(suggestions.length).toBeGreaterThan(0);
  });
});
