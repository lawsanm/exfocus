export type ReadinessLevel = "LOW" | "MODERATE" | "GOOD" | "EXCELLENT";

export interface ReadinessResult {
  score: number; // 0..100
  level: ReadinessLevel;
  recommendation: string;
}

function levelFromScore(score: number): ReadinessLevel {
  if (score >= 80) return "EXCELLENT";
  if (score >= 60) return "GOOD";
  if (score >= 35) return "MODERATE";
  return "LOW";
}

function recommendationFor(level: ReadinessLevel): string {
  switch (level) {
    case "EXCELLENT":
      return "You're well prepared. A light review of weaker topics closer to the exam should be enough.";
    case "GOOD":
      return "Good progress — keep reinforcing the topics you haven't marked complete yet.";
    case "MODERATE":
      return "You're partway there. Prioritize finishing the remaining topics and add more focused study sessions.";
    case "LOW":
      return "Preparation is behind where it should be. Increase daily study time and focus on completing topics first.";
  }
}

/**
 * Blends preparation (topic completion) with actual tracked study time
 * against the exam's own estimated-hours target. Both signals are equally
 * weighted since either one alone can be misleading (topics checked off
 * without real study time, or hours logged without covering the syllabus).
 */
export function computeExamReadiness(
  preparationPercent: number,
  hoursStudied: number,
  estimatedHours: number,
): ReadinessResult {
  const hoursStudiedRatio = estimatedHours > 0 ? Math.min(1, hoursStudied / estimatedHours) : 0;
  const score = Math.round(preparationPercent * 0.5 + hoursStudiedRatio * 100 * 0.5);
  const level = levelFromScore(score);

  return { score, level, recommendation: recommendationFor(level) };
}
