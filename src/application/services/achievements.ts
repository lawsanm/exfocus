import { startOfWeek } from "date-fns";
import { prisma } from "@/infrastructure/db/prisma";
import { computeExamReadiness } from "@/application/services/readiness-score";
import { computePreparationPercent } from "@/lib/preparation";

export interface UnlockedAchievement {
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
}

interface UserStats {
  longestStreak: number;
  totalHoursStudied: number;
  assignmentsCompleted: number;
  focusSessionsCompleted: number;
  bestReadinessScore: number;
  perfectWeeksStreak: number;
}

async function computePerfectWeeksStreak(userId: string, weeklyGoalHours: number): Promise<number> {
  if (weeklyGoalHours <= 0) return 0;

  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const since = new Date(currentWeekStart);
  since.setDate(since.getDate() - 12 * 7); // look back 12 complete weeks

  const sessions = await prisma.focusSession.findMany({
    where: { userId, completed: true, startedAt: { gte: since, lt: currentWeekStart } },
    select: { startedAt: true, actualMinutes: true },
  });

  const minutesByWeek = new Map<string, number>();
  for (const session of sessions) {
    const weekStart = startOfWeek(session.startedAt, { weekStartsOn: 1 }).toISOString();
    minutesByWeek.set(weekStart, (minutesByWeek.get(weekStart) ?? 0) + session.actualMinutes);
  }

  const goalMinutes = weeklyGoalHours * 60;
  let streak = 0;
  for (let i = 1; i <= 12; i++) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const minutes = minutesByWeek.get(weekStart.toISOString()) ?? 0;
    if (minutes < goalMinutes) break;
    streak += 1;
  }
  return streak;
}

async function gatherUserStats(userId: string): Promise<UserStats> {
  const [user, totalFocus, assignmentsCompleted, focusSessionsCompleted, exams] = await Promise.all(
    [
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { longestStreak: true, weeklyGoalHours: true },
      }),
      prisma.focusSession.aggregate({
        where: { userId, completed: true },
        _sum: { actualMinutes: true },
      }),
      prisma.assignment.count({ where: { userId, status: "COMPLETED" } }),
      prisma.focusSession.count({ where: { userId, completed: true } }),
      prisma.exam.findMany({
        where: { userId },
        include: { topics: true },
      }),
    ],
  );

  const examReadiness = await Promise.all(
    exams.map(async (exam) => {
      const preparation = computePreparationPercent(exam.preparationPercent, exam.topics);
      const hoursStudiedResult = await prisma.focusSession.aggregate({
        where: { examId: exam.id, completed: true },
        _sum: { actualMinutes: true },
      });
      const hoursStudied = (hoursStudiedResult._sum.actualMinutes ?? 0) / 60;
      return computeExamReadiness(preparation, hoursStudied, exam.estimatedHours).score;
    }),
  );

  const perfectWeeksStreak = await computePerfectWeeksStreak(userId, user.weeklyGoalHours);

  return {
    longestStreak: user.longestStreak,
    totalHoursStudied: (totalFocus._sum.actualMinutes ?? 0) / 60,
    assignmentsCompleted,
    focusSessionsCompleted,
    bestReadinessScore: examReadiness.length > 0 ? Math.max(...examReadiness) : 0,
    perfectWeeksStreak,
  };
}

function meetsCriteria(criteriaType: string, criteriaValue: number, stats: UserStats): boolean {
  switch (criteriaType) {
    case "STREAK_DAYS":
      return stats.longestStreak >= criteriaValue;
    case "TOTAL_HOURS":
      return stats.totalHoursStudied >= criteriaValue;
    case "ASSIGNMENTS_COMPLETED":
      return stats.assignmentsCompleted >= criteriaValue;
    case "FOCUS_SESSIONS_COMPLETED":
      return stats.focusSessionsCompleted >= criteriaValue;
    case "READINESS_SCORE":
      return stats.bestReadinessScore >= criteriaValue;
    case "PERFECT_WEEKS":
      return stats.perfectWeeksStreak >= criteriaValue;
    default:
      return false;
  }
}

/**
 * Evaluates every achievement the user hasn't already unlocked against
 * their current stats, unlocking and awarding XP/coins for any that now
 * qualify. Call this after events that could plausibly complete one:
 * finishing a focus session, completing an assignment, hitting a high
 * exam readiness score.
 */
export async function checkAndUnlockAchievements(userId: string): Promise<UnlockedAchievement[]> {
  const [stats, achievements, unlockedRows] = await Promise.all([
    gatherUserStats(userId),
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);

  const alreadyUnlocked = new Set(unlockedRows.map((row) => row.achievementId));
  const newlyUnlocked = achievements.filter(
    (a) => !alreadyUnlocked.has(a.id) && meetsCriteria(a.criteriaType, a.criteriaValue, stats),
  );

  if (newlyUnlocked.length === 0) return [];

  const totalXp = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);
  const totalCoins = newlyUnlocked.reduce((sum, a) => sum + a.coinReward, 0);

  await prisma.$transaction([
    ...newlyUnlocked.map((a) =>
      prisma.userAchievement.create({ data: { userId, achievementId: a.id } }),
    ),
    prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: totalXp }, coins: { increment: totalCoins } },
    }),
  ]);

  return newlyUnlocked.map((a) => ({
    key: a.key,
    name: a.name,
    description: a.description,
    icon: a.icon,
    xpReward: a.xpReward,
    coinReward: a.coinReward,
  }));
}
