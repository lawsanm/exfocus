import { prisma } from "@/infrastructure/db/prisma";

export interface CalendarEventDto {
  id: string;
  title: string;
  date: string; // yyyy-mm-dd
  color: string;
  editable: boolean;
  type: "STUDY_SESSION" | "EXAM" | "ASSIGNMENT" | "QUIZ" | "PROJECT";
  entityId: string;
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getCalendarEvents(
  userId: string,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<CalendarEventDto[]> {
  const [sessions, exams, assignments, quizzes, projects] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId, scheduledDate: { gte: rangeStart, lte: rangeEnd } },
      include: { subject: { select: { name: true, colorHex: true } } },
    }),
    prisma.exam.findMany({
      where: { userId, date: { gte: rangeStart, lte: rangeEnd } },
      include: { subject: { select: { name: true, colorHex: true } } },
    }),
    prisma.assignment.findMany({
      where: { userId, deadline: { gte: rangeStart, lte: rangeEnd } },
      include: { subject: { select: { name: true, colorHex: true } } },
    }),
    prisma.quiz.findMany({
      where: { userId, quizDate: { gte: rangeStart, lte: rangeEnd } },
      include: { subject: { select: { name: true, colorHex: true } } },
    }),
    prisma.project.findMany({
      where: { userId, deadline: { gte: rangeStart, lte: rangeEnd } },
      include: { subject: { select: { name: true, colorHex: true } } },
    }),
  ]);

  const events: CalendarEventDto[] = [
    ...sessions.map((s) => ({
      id: `session:${s.id}`,
      title: s.topicLabel,
      date: toDateOnly(s.scheduledDate),
      color: s.subject?.colorHex ?? "#64748B",
      editable: s.status !== "COMPLETED",
      type: "STUDY_SESSION" as const,
      entityId: s.id,
    })),
    ...exams.map((e) => ({
      id: `exam:${e.id}`,
      title: `${e.subject.name} Exam`,
      date: toDateOnly(e.date),
      color: "#DC2626",
      editable: false,
      type: "EXAM" as const,
      entityId: e.id,
    })),
    ...assignments.map((a) => ({
      id: `assignment:${a.id}`,
      title: `${a.title} due`,
      date: toDateOnly(a.deadline),
      color: "#EA580C",
      editable: false,
      type: "ASSIGNMENT" as const,
      entityId: a.id,
    })),
    ...quizzes.map((q) => ({
      id: `quiz:${q.id}`,
      title: `${q.subject.name} Quiz`,
      date: toDateOnly(q.quizDate),
      color: "#CA8A04",
      editable: false,
      type: "QUIZ" as const,
      entityId: q.id,
    })),
    ...projects.map((p) => ({
      id: `project:${p.id}`,
      title: `${p.title} due`,
      date: toDateOnly(p.deadline),
      color: "#7C3AED",
      editable: false,
      type: "PROJECT" as const,
      entityId: p.id,
    })),
  ];

  return events;
}
