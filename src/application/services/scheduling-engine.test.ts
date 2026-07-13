import { describe, expect, it } from "vitest";
import { generateSchedule } from "@/application/services/scheduling-engine";
import type { WorkItem } from "@/domain/entities/scheduling";

const today = new Date("2026-01-01T00:00:00Z");

function makeWorkItem(overrides: Partial<WorkItem> = {}): WorkItem {
  return {
    id: "item-1",
    type: "TOPIC",
    subjectId: "subject-1",
    subjectName: "Algorithms",
    subjectColor: "#0D9488",
    label: "Graphs",
    deadline: new Date("2026-01-20T00:00:00Z"),
    difficultyWeight: 2,
    gradeWeight: 10,
    creditHours: 3,
    remainingHours: 2,
    completionPercent: 0,
    linkedIds: {},
    ...overrides,
  };
}

const ALL_DAYS_2H = new Array(7).fill(2);

describe("generateSchedule", () => {
  it("returns no slots, risks, or recommendation for an empty work list", () => {
    const result = generateSchedule({ workItems: [], availableHoursByWeekday: ALL_DAYS_2H, today });
    expect(result.slots).toHaveLength(0);
    expect(result.risks).toHaveLength(0);
    expect(result.recommendation).toBeNull();
  });

  it("never schedules more hours on a day than that weekday's available capacity", () => {
    const workItems = [
      makeWorkItem({
        id: "a",
        subjectId: "subject-a",
        remainingHours: 6,
        deadline: new Date("2026-01-05T00:00:00Z"),
      }),
      makeWorkItem({
        id: "b",
        subjectId: "subject-b",
        remainingHours: 6,
        deadline: new Date("2026-01-05T00:00:00Z"),
      }),
    ];
    const result = generateSchedule({ workItems, availableHoursByWeekday: ALL_DAYS_2H, today });

    const minutesByDate = new Map<string, number>();
    for (const slot of result.slots) {
      const key = slot.date.toISOString();
      minutesByDate.set(key, (minutesByDate.get(key) ?? 0) + slot.durationMinutes);
    }
    for (const minutes of minutesByDate.values()) {
      expect(minutes).toBeLessThanOrEqual(2 * 60);
    }
  });

  it("caps a single subject's daily hours to prevent burnout", () => {
    const workItems = [
      makeWorkItem({
        id: "big-subject-item",
        subjectId: "subject-a",
        remainingHours: 20,
        deadline: new Date("2026-02-01T00:00:00Z"),
      }),
    ];
    // Generous daily capacity so the only limiting factor is the burnout cap.
    const result = generateSchedule({
      workItems,
      availableHoursByWeekday: new Array(7).fill(8),
      today,
    });

    const hoursByDate = new Map<string, number>();
    for (const slot of result.slots) {
      const key = slot.date.toISOString();
      hoursByDate.set(key, (hoursByDate.get(key) ?? 0) + slot.durationMinutes / 60);
    }
    for (const hours of hoursByDate.values()) {
      expect(hours).toBeLessThanOrEqual(2);
    }
  });

  it("flags a deadline risk when remaining work cannot fit before the deadline", () => {
    const workItems = [
      makeWorkItem({
        id: "overloaded",
        remainingHours: 50,
        deadline: new Date("2026-01-03T00:00:00Z"),
      }),
    ];
    const result = generateSchedule({ workItems, availableHoursByWeekday: ALL_DAYS_2H, today });

    expect(result.risks).toHaveLength(1);
    expect(result.risks[0].workItem.id).toBe("overloaded");
    expect(result.risks[0].shortfallHours).toBeGreaterThan(0);
    expect(result.risks[0].message).toContain("after the deadline");
  });

  it("does not flag a risk when everything fits comfortably", () => {
    const workItems = [
      makeWorkItem({ remainingHours: 1, deadline: new Date("2026-01-10T00:00:00Z") }),
    ];
    const result = generateSchedule({ workItems, availableHoursByWeekday: ALL_DAYS_2H, today });
    expect(result.risks).toHaveLength(0);
  });

  it("schedules the higher-priority item onto earlier days when capacity is constrained", () => {
    const urgent = makeWorkItem({
      id: "urgent",
      subjectId: "subject-urgent",
      remainingHours: 2,
      deadline: new Date("2026-01-02T00:00:00Z"),
    });
    const relaxed = makeWorkItem({
      id: "relaxed",
      subjectId: "subject-relaxed",
      remainingHours: 2,
      deadline: new Date("2026-01-20T00:00:00Z"),
    });
    const result = generateSchedule({
      workItems: [relaxed, urgent],
      availableHoursByWeekday: ALL_DAYS_2H,
      today,
    });

    const urgentFirstSlot = result.slots.find((s) => s.workItem.id === "urgent");
    const relaxedFirstSlot = result.slots.find((s) => s.workItem.id === "relaxed");
    expect(urgentFirstSlot).toBeDefined();
    expect(relaxedFirstSlot).toBeDefined();
    expect(urgentFirstSlot!.date.getTime()).toBeLessThanOrEqual(relaxedFirstSlot!.date.getTime());
  });

  it("produces a study hour recommendation based on remaining hours and nearest deadline", () => {
    const workItems = [
      makeWorkItem({ remainingHours: 10, deadline: new Date("2026-01-06T00:00:00Z") }),
    ];
    const result = generateSchedule({ workItems, availableHoursByWeekday: ALL_DAYS_2H, today });

    expect(result.recommendation).not.toBeNull();
    expect(result.recommendation!.daysUntilNearestDeadline).toBe(5);
    expect(result.recommendation!.recommendedDailyHours).toBeCloseTo(2, 5);
  });
});
