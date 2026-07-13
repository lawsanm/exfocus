import type {
  DeadlineRisk,
  ScheduledSlot,
  SchedulingResult,
  StudyHourRecommendation,
  WorkItem,
} from "@/domain/entities/scheduling";
import { calculatePriority } from "@/application/services/priority-calculator";

const DEFAULT_HORIZON_DAYS = 21;
const BURNOUT_CAP_HOURS_PER_SUBJECT_PER_DAY = 2;
const CRITICAL_BURNOUT_ALLOWANCE_HOURS = 1;
const MIN_CHUNK_HOURS = 0.25;
const MAX_CHUNK_HOURS_TOPIC = 1;
const MAX_CHUNK_HOURS_ITEM = 1.5;

function normalizeToUtcMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

interface DayBucket {
  date: Date;
  remainingCapacity: number;
  subjectHoursUsed: Map<string, number>;
}

export interface GenerateScheduleParams {
  workItems: WorkItem[];
  /** Index 0 = Sunday .. 6 = Saturday, hours available that weekday. */
  availableHoursByWeekday: number[];
  today?: Date;
  horizonDays?: number;
}

export function generateSchedule({
  workItems,
  availableHoursByWeekday,
  today = new Date(),
  horizonDays = DEFAULT_HORIZON_DAYS,
}: GenerateScheduleParams): SchedulingResult {
  const startOfToday = normalizeToUtcMidnight(today);

  const days: DayBucket[] = Array.from({ length: horizonDays }, (_, i) => {
    const date = addDays(startOfToday, i);
    return {
      date,
      remainingCapacity: availableHoursByWeekday[date.getUTCDay()] ?? 0,
      subjectHoursUsed: new Map<string, number>(),
    };
  });

  const activeItems = workItems.filter((item) => item.remainingHours > 0.01);

  const prioritized = activeItems
    .map((item) => ({ item, priority: calculatePriority(item, startOfToday) }))
    .sort((a, b) => b.priority.score - a.priority.score);

  const slots: ScheduledSlot[] = [];
  const risks: DeadlineRisk[] = [];

  for (const { item, priority } of prioritized) {
    let remaining = item.remainingHours;
    const maxChunk = item.type === "TOPIC" ? MAX_CHUNK_HOURS_TOPIC : MAX_CHUNK_HOURS_ITEM;
    const deadlineDayIndex = Math.min(
      Math.max(daysBetween(startOfToday, item.deadline), 0),
      horizonDays - 1,
    );

    for (
      let dayIndex = 0;
      dayIndex <= deadlineDayIndex && remaining > MIN_CHUNK_HOURS;
      dayIndex++
    ) {
      const day = days[dayIndex];
      const subjectHoursUsed = day.subjectHoursUsed.get(item.subjectId) ?? 0;
      const burnoutAllowance =
        BURNOUT_CAP_HOURS_PER_SUBJECT_PER_DAY +
        (priority.level === "CRITICAL" ? CRITICAL_BURNOUT_ALLOWANCE_HOURS : 0);
      const subjectCapacityLeft = Math.max(0, burnoutAllowance - subjectHoursUsed);
      const capacity = Math.min(day.remainingCapacity, subjectCapacityLeft);

      if (capacity < MIN_CHUNK_HOURS) continue;

      const chunk = Math.min(remaining, maxChunk, capacity);
      if (chunk < MIN_CHUNK_HOURS) continue;

      slots.push({
        workItem: item,
        date: day.date,
        durationMinutes: Math.round(chunk * 60),
        priority,
      });

      day.remainingCapacity -= chunk;
      day.subjectHoursUsed.set(item.subjectId, subjectHoursUsed + chunk);
      remaining -= chunk;
    }

    if (remaining > MIN_CHUNK_HOURS) {
      const dailyCapacityEstimate = availableHoursByWeekday.reduce((sum, h) => sum + h, 0) / 7 || 1;
      const projectedOverrunDays = Math.ceil(remaining / dailyCapacityEstimate);

      risks.push({
        workItem: item,
        shortfallHours: Math.round(remaining * 100) / 100,
        projectedOverrunDays,
        message: `Current pace indicates completion ${projectedOverrunDays} day${projectedOverrunDays === 1 ? "" : "s"} after the deadline. Consider increasing daily study time or reprioritizing.`,
      });
    }
  }

  const recommendation = buildRecommendation(activeItems, availableHoursByWeekday, startOfToday);

  return { slots, risks, recommendation };
}

function buildRecommendation(
  activeItems: WorkItem[],
  availableHoursByWeekday: number[],
  today: Date,
): StudyHourRecommendation | null {
  if (activeItems.length === 0) return null;

  const totalRemainingHours = activeItems.reduce((sum, item) => sum + item.remainingHours, 0);
  const nearestDeadlineDays = Math.max(
    1,
    Math.min(...activeItems.map((item) => Math.max(daysBetween(today, item.deadline), 1))),
  );
  const currentAverageDailyHours = availableHoursByWeekday.reduce((sum, h) => sum + h, 0) / 7;

  const rawRecommended = totalRemainingHours / nearestDeadlineDays;
  const recommendedDailyHours = Math.max(0.5, Math.round(rawRecommended * 2) / 2);

  const reasoning =
    recommendedDailyHours > currentAverageDailyHours
      ? `You have ${Math.round(totalRemainingHours * 10) / 10}h of work remaining and your nearest deadline is in ${nearestDeadlineDays} day${nearestDeadlineDays === 1 ? "" : "s"}. That needs about ${recommendedDailyHours}h/day, above your current average of ${Math.round(currentAverageDailyHours * 10) / 10}h/day.`
      : `Your current average of ${Math.round(currentAverageDailyHours * 10) / 10}h/day comfortably covers the ${Math.round(totalRemainingHours * 10) / 10}h remaining before your nearest deadline in ${nearestDeadlineDays} day${nearestDeadlineDays === 1 ? "" : "s"}.`;

  return {
    recommendedDailyHours,
    currentAverageDailyHours: Math.round(currentAverageDailyHours * 10) / 10,
    totalRemainingHours: Math.round(totalRemainingHours * 10) / 10,
    daysUntilNearestDeadline: nearestDeadlineDays,
    reasoning,
  };
}
