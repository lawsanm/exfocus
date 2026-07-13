import { generateSchedule } from "@/application/services/scheduling-engine";
import {
  gatherWorkItems,
  getAvailableHoursByWeekday,
  persistSchedule,
} from "@/infrastructure/repositories/scheduling-repository";
import type { SchedulingResult } from "@/domain/entities/scheduling";

async function runEngine(userId: string): Promise<SchedulingResult> {
  const [workItems, availableHoursByWeekday] = await Promise.all([
    gatherWorkItems(userId),
    getAvailableHoursByWeekday(userId),
  ]);

  return generateSchedule({ workItems, availableHoursByWeekday });
}

/**
 * Regenerates and persists the auto-generated portion of a user's study
 * schedule. Call this after any mutation to subjects/topics/assignments/
 * exams/quizzes/projects/available-hours so the plan stays in sync —
 * "whenever new academic information is added or updated, the schedule
 * recalculates automatically."
 */
export async function regenerateSchedule(userId: string): Promise<SchedulingResult> {
  const result = await runEngine(userId);
  await persistSchedule(userId, result.slots);
  return result;
}

/** Read-only variant for surfaces (dashboard, risk/recommendation widgets)
 * that just want fresh insights without rewriting StudySession rows. */
export async function computeSchedulingInsights(
  userId: string,
): Promise<Pick<SchedulingResult, "risks" | "recommendation">> {
  const { risks, recommendation } = await runEngine(userId);
  return { risks, recommendation };
}
