import { describe, expect, it } from "vitest";
import { computeExamReadiness } from "@/application/services/readiness-score";

describe("computeExamReadiness", () => {
  it("returns LOW for no preparation and no hours studied", () => {
    const result = computeExamReadiness(0, 0, 10);
    expect(result.score).toBe(0);
    expect(result.level).toBe("LOW");
  });

  it("returns EXCELLENT for full preparation and hours at or above target", () => {
    const result = computeExamReadiness(100, 10, 10);
    expect(result.score).toBe(100);
    expect(result.level).toBe("EXCELLENT");
  });

  it("caps the hours-studied contribution at the estimated target (no credit for over-studying)", () => {
    const atTarget = computeExamReadiness(50, 10, 10);
    const overTarget = computeExamReadiness(50, 20, 10);
    expect(atTarget.score).toBe(overTarget.score);
  });

  it("handles a zero estimated-hours target without dividing by zero", () => {
    const result = computeExamReadiness(50, 5, 0);
    expect(Number.isFinite(result.score)).toBe(true);
  });

  it("weights preparation and hours studied equally", () => {
    const prepOnly = computeExamReadiness(100, 0, 10);
    const hoursOnly = computeExamReadiness(0, 10, 10);
    expect(prepOnly.score).toBe(hoursOnly.score);
  });
});
