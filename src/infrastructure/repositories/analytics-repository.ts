import { prisma } from "@/infrastructure/db/prisma";

export interface DailyMinutes {
  date: string; // yyyy-mm-dd
  minutes: number;
}

export interface SubjectDistributionItem {
  subjectName: string;
  subjectColor: string;
  minutes: number;
}

export interface CompletedTaskCounts {
  assignments: number;
  exams: number;
  quizzes: number;
  projects: number;
}

export interface WeeklyProductivity {
  weekStart: string;
  minutes: number;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getDailyFocusMinutes(userId: string, days = 90): Promise<DailyMinutes[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const sessions = await prisma.focusSession.findMany({
    where: { userId, completed: true, startedAt: { gte: since } },
    select: { startedAt: true, actualMinutes: true },
  });

  const byDay = new Map<string, number>();
  for (const session of sessions) {
    const key = toDateKey(session.startedAt);
    byDay.set(key, (byDay.get(key) ?? 0) + session.actualMinutes);
  }

  const result: DailyMinutes[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = toDateKey(date);
    result.push({ date: key, minutes: byDay.get(key) ?? 0 });
  }
  return result;
}

export async function getSubjectDistribution(userId: string): Promise<SubjectDistributionItem[]> {
  const grouped = await prisma.focusSession.groupBy({
    by: ["subjectId"],
    where: { userId, completed: true, subjectId: { not: null } },
    _sum: { actualMinutes: true },
  });

  if (grouped.length === 0) return [];

  const subjectIds = grouped.map((g) => g.subjectId).filter((id): id is string => id !== null);
  const subjects = await prisma.subject.findMany({
    where: { id: { in: subjectIds } },
    select: { id: true, name: true, colorHex: true },
  });
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  return grouped
    .map((g) => {
      const subject = g.subjectId ? subjectMap.get(g.subjectId) : undefined;
      return {
        subjectName: subject?.name ?? "General",
        subjectColor: subject?.colorHex ?? "#64748B",
        minutes: g._sum.actualMinutes ?? 0,
      };
    })
    .sort((a, b) => b.minutes - a.minutes);
}

export async function getCompletedTaskCounts(userId: string): Promise<CompletedTaskCounts> {
  const now = new Date();
  const [assignments, exams, quizzes, projects] = await Promise.all([
    prisma.assignment.count({ where: { userId, status: "COMPLETED" } }),
    prisma.exam.count({ where: { userId, date: { lt: now } } }),
    prisma.quiz.count({ where: { userId, quizDate: { lt: now } } }),
    prisma.project.count({ where: { userId, progressPercent: 100 } }),
  ]);
  return { assignments, exams, quizzes, projects };
}

export async function getWeeklyProductivity(
  userId: string,
  weeks = 8,
): Promise<WeeklyProductivity[]> {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const sessions = await prisma.focusSession.findMany({
    where: { userId, completed: true, startedAt: { gte: since } },
    select: { startedAt: true, actualMinutes: true },
  });

  function startOfIsoWeek(date: Date): Date {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = d.getUTCDay();
    const diff = (day + 6) % 7; // days since Monday
    d.setUTCDate(d.getUTCDate() - diff);
    return d;
  }

  const byWeek = new Map<string, number>();
  for (const session of sessions) {
    const key = toDateKey(startOfIsoWeek(session.startedAt));
    byWeek.set(key, (byWeek.get(key) ?? 0) + session.actualMinutes);
  }

  const result: WeeklyProductivity[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    const key = toDateKey(startOfIsoWeek(date));
    result.push({ weekStart: key, minutes: byWeek.get(key) ?? 0 });
  }
  return result;
}
