import { describe, expect, it } from "vitest";
import {
  coinsForFocusMinutes,
  getLevelProgress,
  xpForFocusMinutes,
} from "@/application/services/gamification";

describe("getLevelProgress", () => {
  it("starts everyone at level 1 with 0 XP", () => {
    const progress = getLevelProgress(0);
    expect(progress.level).toBe(1);
    expect(progress.xpIntoLevel).toBe(0);
    expect(progress.progress).toBe(0);
  });

  it("advances to level 2 exactly at the level-2 threshold (100 XP)", () => {
    expect(getLevelProgress(99).level).toBe(1);
    expect(getLevelProgress(100).level).toBe(2);
  });

  it("reports progress within the current level as a 0..1 ratio", () => {
    // Level 2 spans [100, 300); halfway is 200 XP.
    const progress = getLevelProgress(200);
    expect(progress.level).toBe(2);
    expect(progress.progress).toBeCloseTo(0.5, 5);
  });

  it("keeps level monotonically non-decreasing as XP grows", () => {
    let previous = 1;
    for (let xp = 0; xp <= 5000; xp += 137) {
      const level = getLevelProgress(xp).level;
      expect(level).toBeGreaterThanOrEqual(previous);
      previous = level;
    }
  });
});

describe("focus reward helpers", () => {
  it("awards 1 XP per completed minute", () => {
    expect(xpForFocusMinutes(25)).toBe(25);
    expect(xpForFocusMinutes(0)).toBe(0);
  });

  it("never awards negative XP", () => {
    expect(xpForFocusMinutes(-10)).toBe(0);
  });

  it("awards 1 coin per 10 completed minutes, floored", () => {
    expect(coinsForFocusMinutes(25)).toBe(2);
    expect(coinsForFocusMinutes(9)).toBe(0);
    expect(coinsForFocusMinutes(50)).toBe(5);
  });
});
