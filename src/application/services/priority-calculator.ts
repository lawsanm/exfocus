import type {
  PriorityBreakdown,
  PriorityLevel,
  PriorityResult,
  WorkItem,
} from "@/domain/entities/scheduling";

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return (to.getTime() - from.getTime()) / msPerDay;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function levelFromScore(score: number, daysRemaining: number): PriorityLevel {
  if (daysRemaining <= 1) return "CRITICAL";
  if (score >= 70) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

/**
 * Weighted priority score (0-100) from five normalized factors. Weights are
 * tuned so urgency dominates (a close deadline should nearly always win)
 * while still letting grade weight and unfinished work pull weaker items up.
 */
export function calculatePriority(workItem: WorkItem, today: Date): PriorityResult {
  const daysRemaining = daysBetween(today, workItem.deadline);

  const urgency = clamp(1 - daysRemaining / 21, 0, 1);
  const difficulty = clamp(workItem.difficultyWeight / 4, 0, 1);
  const weight = clamp(workItem.gradeWeight / 100, 0, 1);
  const credits = clamp(workItem.creditHours / 6, 0, 1);
  const preparationGap = clamp(1 - workItem.completionPercent / 100, 0, 1);

  const breakdown: PriorityBreakdown = { urgency, difficulty, weight, credits, preparationGap };

  const rawScore =
    urgency * 0.35 + difficulty * 0.15 + weight * 0.2 + credits * 0.1 + preparationGap * 0.2;

  const score = Math.round(clamp(rawScore, 0, 1) * 100);

  return { score, level: levelFromScore(score, daysRemaining), breakdown };
}
