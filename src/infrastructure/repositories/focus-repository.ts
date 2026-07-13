import { startOfMonth, startOfWeek } from "date-fns";
import { prisma } from "@/infrastructure/db/prisma";

export interface FocusStats {
  todayMinutes: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
  longestSessionMinutes: number;
}

function startOfTodayUtc(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function getFocusStats(userId: string): Promise<FocusStats> {
  const now = new Date();
  const todayStart = startOfTodayUtc(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const [today, week, month, longest] = await Promise.all([
    prisma.focusSession.aggregate({
      where: { userId, completed: true, startedAt: { gte: todayStart } },
      _sum: { actualMinutes: true },
    }),
    prisma.focusSession.aggregate({
      where: { userId, completed: true, startedAt: { gte: weekStart } },
      _sum: { actualMinutes: true },
    }),
    prisma.focusSession.aggregate({
      where: { userId, completed: true, startedAt: { gte: monthStart } },
      _sum: { actualMinutes: true },
    }),
    prisma.focusSession.aggregate({
      where: { userId, completed: true },
      _max: { actualMinutes: true },
    }),
  ]);

  return {
    todayMinutes: today._sum.actualMinutes ?? 0,
    weeklyMinutes: week._sum.actualMinutes ?? 0,
    monthlyMinutes: month._sum.actualMinutes ?? 0,
    longestSessionMinutes: longest._max.actualMinutes ?? 0,
  };
}

export function getRecentFocusSessions(userId: string, take = 10) {
  return prisma.focusSession.findMany({
    where: { userId, completed: true },
    include: { subject: { select: { name: true, colorHex: true } } },
    orderBy: { startedAt: "desc" },
    take,
  });
}

export type RecentFocusSession = Awaited<ReturnType<typeof getRecentFocusSessions>>[number];
