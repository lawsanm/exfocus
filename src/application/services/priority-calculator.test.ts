import { describe, expect, it } from "vitest";
import { calculatePriority } from "@/application/services/priority-calculator";
import type { WorkItem } from "@/domain/entities/scheduling";

const today = new Date("2026-01-01T00:00:00Z");

function makeWorkItem(overrides: Partial<WorkItem> = {}): WorkItem {
  return {
    id: "item-1",
    type: "ASSIGNMENT",
    subjectId: "subject-1",
    subjectName: "Algorithms",
    subjectColor: "#0D9488",
    label: "Test item",
    deadline: new Date("2026-01-15T00:00:00Z"),
    difficultyWeight: 2,
    gradeWeight: 20,
    creditHours: 3,
    remainingHours: 4,
    completionPercent: 0,
    linkedIds: {},
    ...overrides,
  };
}

describe("calculatePriority", () => {
  it("returns a score within 0-100", () => {
    const result = calculatePriority(makeWorkItem(), today);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("forces CRITICAL when the deadline is tomorrow or sooner, regardless of other factors", () => {
    const result = calculatePriority(
      makeWorkItem({
        deadline: new Date("2026-01-02T00:00:00Z"),
        gradeWeight: 1,
        difficultyWeight: 1,
        completionPercent: 90,
      }),
      today,
    );
    expect(result.level).toBe("CRITICAL");
  });

  it("scores a closer deadline higher than a farther one, all else equal", () => {
    const soon = calculatePriority(
      makeWorkItem({ deadline: new Date("2026-01-03T00:00:00Z") }),
      today,
    );
    const far = calculatePriority(
      makeWorkItem({ deadline: new Date("2026-02-01T00:00:00Z") }),
      today,
    );
    expect(soon.score).toBeGreaterThan(far.score);
  });

  it("scores higher grade weight higher, all else equal", () => {
    const heavy = calculatePriority(makeWorkItem({ gradeWeight: 80 }), today);
    const light = calculatePriority(makeWorkItem({ gradeWeight: 5 }), today);
    expect(heavy.score).toBeGreaterThan(light.score);
  });

  it("scores less-prepared items higher than nearly-finished ones", () => {
    const unprepared = calculatePriority(makeWorkItem({ completionPercent: 0 }), today);
    const almostDone = calculatePriority(makeWorkItem({ completionPercent: 95 }), today);
    expect(unprepared.score).toBeGreaterThan(almostDone.score);
  });

  it("scores higher difficulty higher, all else equal", () => {
    const hard = calculatePriority(makeWorkItem({ difficultyWeight: 4 }), today);
    const easy = calculatePriority(makeWorkItem({ difficultyWeight: 1 }), today);
    expect(hard.score).toBeGreaterThan(easy.score);
  });
});
