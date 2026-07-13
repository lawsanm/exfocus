export type WorkItemType = "TOPIC" | "ASSIGNMENT" | "EXAM" | "QUIZ" | "PROJECT";

export type PriorityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

/** A unit of unfinished work the scheduler can allocate study time to. */
export interface WorkItem {
  id: string;
  type: WorkItemType;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  label: string;
  deadline: Date;
  difficultyWeight: number; // 1 (easy) .. 4 (very hard)
  gradeWeight: number; // 0..100
  creditHours: number;
  remainingHours: number;
  completionPercent: number; // 0..100 — progress or preparation, whichever applies
  linkedIds: {
    assignmentId?: string;
    examId?: string;
    quizId?: string;
    projectId?: string;
  };
}

export interface PriorityBreakdown {
  urgency: number;
  difficulty: number;
  weight: number;
  credits: number;
  preparationGap: number;
}

export interface PriorityResult {
  score: number; // 0..100
  level: PriorityLevel;
  breakdown: PriorityBreakdown;
}

export interface ScheduledSlot {
  workItem: WorkItem;
  date: Date;
  durationMinutes: number;
  priority: PriorityResult;
}

export interface DeadlineRisk {
  workItem: WorkItem;
  shortfallHours: number;
  projectedOverrunDays: number;
  message: string;
}

export interface StudyHourRecommendation {
  recommendedDailyHours: number;
  currentAverageDailyHours: number;
  totalRemainingHours: number;
  daysUntilNearestDeadline: number;
  reasoning: string;
}

export interface SchedulingResult {
  slots: ScheduledSlot[];
  risks: DeadlineRisk[];
  recommendation: StudyHourRecommendation | null;
}
