import { endOfMonth, startOfMonth, startOfWeek } from "date-fns";
import { prisma } from "@/infrastructure/db/prisma";
import type { PriorityLevel, RelatedItemType, StudySessionStatus } from "@/generated/prisma/client";

export interface TodayStudySessionDto {
  id: string;
  topicLabel: string;
  subjectName: string;
  subjectColor: string;
  durationMinutes: number;
  priorityLevel: PriorityLevel;
  status: StudySessionStatus;
  relatedType: RelatedItemType;
}

export interface UpcomingDeadlineDto {
  id: string;
  type: "ASSIGNMENT" | "EXAM" | "PROJECT" | "QUIZ";
  title: string;
  subjectName: string;
  subjectColor: string;
  date: Date;
  daysRemaining: number;
}

export interface DashboardData {
  user: {
    name: string | null;
    xp: number;
    coins: number;
    currentStreak: number;
    longestStreak: number;
    weeklyGoalHours: number;
    dailyGoalHours: number;
  };
  todaySessions: TodayStudySessionDto[];
  upcomingDeadlines: UpcomingDeadlineDto[];
  weeklyFocusMinutes: number;
  monthlyFocusMinutes: number;
  todayFocusMinutes: number;
  todayFocusSessionCount: number;
  subjectCount: number;
  activeTaskCount: number;
}

function todayRangeUtc(now: Date) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((to.getTime() - from.getTime()) / msPerDay);
}

const DEADLINE_WINDOW_DAYS = 14;
const DEADLINE_LIMIT = 8;

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const now = new Date();
  const { start: todayStart, end: todayEnd } = todayRangeUtc(now);
  const windowEnd = new Date(todayStart);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + DEADLINE_WINDOW_DAYS);

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    user,
    todaySessions,
    assignments,
    exams,
    projects,
    quizzes,
    weeklyFocus,
    monthlyFocus,
    todayFocus,
    subjectCount,
    activeTaskCount,
  ] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        name: true,
        xp: true,
        coins: true,
        currentStreak: true,
        longestStreak: true,
        weeklyGoalHours: true,
        dailyGoalHours: true,
      },
    }),
    prisma.studySession.findMany({
      where: { userId, scheduledDate: { gte: todayStart, lt: todayEnd } },
      include: { subject: { select: { name: true, colorHex: true } } },
      orderBy: [{ priorityScore: "desc" }],
    }),
    prisma.assignment.findMany({
      where: {
        userId,
        status: { not: "COMPLETED" },
        deadline: { gte: todayStart, lte: windowEnd },
      },
      include: { subject: { select: { name: true, colorHex: true } } },
      orderBy: { deadline: "asc" },
    }),
    prisma.exam.findMany({
      where: { userId, date: { gte: todayStart, lte: windowEnd } },
      include: { subject: { select: { name: true, colorHex: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.project.findMany({
      where: {
        userId,
        progressPercent: { lt: 100 },
        deadline: { gte: todayStart, lte: windowEnd },
      },
      include: { subject: { select: { name: true, colorHex: true } } },
      orderBy: { deadline: "asc" },
    }),
    prisma.quiz.findMany({
      where: { userId, quizDate: { gte: todayStart, lte: windowEnd } },
      include: { subject: { select: { name: true, colorHex: true } } },
      orderBy: { quizDate: "asc" },
    }),
    prisma.focusSession.aggregate({
      where: { userId, startedAt: { gte: weekStart }, completed: true },
      _sum: { actualMinutes: true },
    }),
    prisma.focusSession.aggregate({
      where: { userId, startedAt: { gte: monthStart, lte: monthEnd }, completed: true },
      _sum: { actualMinutes: true },
    }),
    prisma.focusSession.aggregate({
      where: { userId, startedAt: { gte: todayStart, lt: todayEnd }, completed: true },
      _sum: { actualMinutes: true },
      _count: true,
    }),
    prisma.subject.count({ where: { userId, archivedAt: null } }),
    prisma.assignment.count({ where: { userId, status: { not: "COMPLETED" } } }),
  ]);

  const deadlines: UpcomingDeadlineDto[] = [
    ...assignments.map((a) => ({
      id: a.id,
      type: "ASSIGNMENT" as const,
      title: a.title,
      subjectName: a.subject.name,
      subjectColor: a.subject.colorHex,
      date: a.deadline,
      daysRemaining: daysBetween(todayStart, a.deadline),
    })),
    ...exams.map((e) => ({
      id: e.id,
      type: "EXAM" as const,
      title: `${e.subject.name} Exam`,
      subjectName: e.subject.name,
      subjectColor: e.subject.colorHex,
      date: e.date,
      daysRemaining: daysBetween(todayStart, e.date),
    })),
    ...projects.map((p) => ({
      id: p.id,
      type: "PROJECT" as const,
      title: p.title,
      subjectName: p.subject?.name ?? "General",
      subjectColor: p.subject?.colorHex ?? "#64748B",
      date: p.deadline,
      daysRemaining: daysBetween(todayStart, p.deadline),
    })),
    ...quizzes.map((q) => ({
      id: q.id,
      type: "QUIZ" as const,
      title: `${q.subject.name} Quiz`,
      subjectName: q.subject.name,
      subjectColor: q.subject.colorHex,
      date: q.quizDate,
      daysRemaining: daysBetween(todayStart, q.quizDate),
    })),
  ]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, DEADLINE_LIMIT);

  return {
    user,
    todaySessions: todaySessions.map((s) => ({
      id: s.id,
      topicLabel: s.topicLabel,
      subjectName: s.subject?.name ?? "General",
      subjectColor: s.subject?.colorHex ?? "#64748B",
      durationMinutes: s.durationMinutes,
      priorityLevel: s.priorityLevel,
      status: s.status,
      relatedType: s.relatedType,
    })),
    upcomingDeadlines: deadlines,
    weeklyFocusMinutes: weeklyFocus._sum.actualMinutes ?? 0,
    monthlyFocusMinutes: monthlyFocus._sum.actualMinutes ?? 0,
    todayFocusMinutes: todayFocus._sum.actualMinutes ?? 0,
    todayFocusSessionCount: todayFocus._count,
    subjectCount,
    activeTaskCount,
  };
}
