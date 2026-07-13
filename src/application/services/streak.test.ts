import { describe, expect, it } from "vitest";
import { applyStudyActivity } from "@/application/services/streak";

describe("applyStudyActivity", () => {
  it("starts a streak of 1 when there is no prior study date", () => {
    const result = applyStudyActivity(
      { currentStreak: 0, longestStreak: 0, lastStudyDate: null },
      new Date("2026-01-05T00:00:00Z"),
    );
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });

  it("does not change the streak if already logged today", () => {
    const today = new Date("2026-01-05T12:00:00Z");
    const result = applyStudyActivity(
      { currentStreak: 4, longestStreak: 4, lastStudyDate: new Date("2026-01-05T01:00:00Z") },
      today,
    );
    expect(result.currentStreak).toBe(4);
  });

  it("increments the streak for a consecutive day", () => {
    const result = applyStudyActivity(
      { currentStreak: 4, longestStreak: 4, lastStudyDate: new Date("2026-01-04T00:00:00Z") },
      new Date("2026-01-05T00:00:00Z"),
    );
    expect(result.currentStreak).toBe(5);
    expect(result.longestStreak).toBe(5);
  });

  it("resets the streak to 1 after a skipped day", () => {
    const result = applyStudyActivity(
      { currentStreak: 10, longestStreak: 10, lastStudyDate: new Date("2026-01-01T00:00:00Z") },
      new Date("2026-01-05T00:00:00Z"),
    );
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(10);
  });

  it("keeps the longest streak even after a reset", () => {
    const result = applyStudyActivity(
      { currentStreak: 2, longestStreak: 15, lastStudyDate: new Date("2026-01-01T00:00:00Z") },
      new Date("2026-01-10T00:00:00Z"),
    );
    expect(result.longestStreak).toBe(15);
  });
});
