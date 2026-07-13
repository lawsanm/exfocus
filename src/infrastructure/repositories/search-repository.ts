import { prisma } from "@/infrastructure/db/prisma";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: "Subject" | "Assignment" | "Exam" | "Quiz" | "Project" | "Topic";
}

const RESULT_LIMIT_PER_TYPE = 5;

export async function search(userId: string, query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const [subjects, assignments, exams, quizzes, projects, topics] = await Promise.all([
    prisma.subject.findMany({
      where: { userId, name: { contains: trimmed, mode: "insensitive" } },
      take: RESULT_LIMIT_PER_TYPE,
    }),
    prisma.assignment.findMany({
      where: { userId, title: { contains: trimmed, mode: "insensitive" } },
      include: { subject: true },
      take: RESULT_LIMIT_PER_TYPE,
    }),
    prisma.exam.findMany({
      where: { userId, subject: { name: { contains: trimmed, mode: "insensitive" } } },
      include: { subject: true },
      take: RESULT_LIMIT_PER_TYPE,
    }),
    prisma.quiz.findMany({
      where: { userId, subject: { name: { contains: trimmed, mode: "insensitive" } } },
      include: { subject: true },
      take: RESULT_LIMIT_PER_TYPE,
    }),
    prisma.project.findMany({
      where: { userId, title: { contains: trimmed, mode: "insensitive" } },
      include: { subject: true },
      take: RESULT_LIMIT_PER_TYPE,
    }),
    prisma.subjectTopic.findMany({
      where: { name: { contains: trimmed, mode: "insensitive" }, subject: { userId } },
      include: { subject: true },
      take: RESULT_LIMIT_PER_TYPE,
    }),
  ]);

  return [
    ...subjects.map((s): SearchResult => ({
      id: s.id,
      title: s.name,
      subtitle: "Subject",
      href: `/subjects/${s.id}`,
      type: "Subject",
    })),
    ...assignments.map((a): SearchResult => ({
      id: a.id,
      title: a.title,
      subtitle: a.subject.name,
      href: "/assignments",
      type: "Assignment",
    })),
    ...exams.map((e): SearchResult => ({
      id: e.id,
      title: `${e.subject.name} Exam`,
      subtitle: e.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      href: `/exams/${e.id}`,
      type: "Exam",
    })),
    ...quizzes.map((q): SearchResult => ({
      id: q.id,
      title: `${q.subject.name} Quiz`,
      subtitle: q.quizDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      href: "/quizzes",
      type: "Quiz",
    })),
    ...projects.map((p): SearchResult => ({
      id: p.id,
      title: p.title,
      subtitle: p.subject?.name ?? "General",
      href: "/projects",
      type: "Project",
    })),
    ...topics.map((t): SearchResult => ({
      id: t.id,
      title: t.name,
      subtitle: `Topic in ${t.subject.name}`,
      href: `/subjects/${t.subjectId}`,
      type: "Topic",
    })),
  ];
}
