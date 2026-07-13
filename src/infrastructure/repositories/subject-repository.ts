import { prisma } from "@/infrastructure/db/prisma";

export function listSubjects(userId: string) {
  return prisma.subject.findMany({
    where: { userId, archivedAt: null },
    include: {
      topics: { orderBy: { order: "asc" } },
      _count: { select: { assignments: true, exams: true, quizzes: true, projects: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export function getSubjectDetail(userId: string, subjectId: string) {
  return prisma.subject.findFirst({
    where: { id: subjectId, userId },
    include: {
      topics: { orderBy: { order: "asc" } },
    },
  });
}

export type SubjectListItem = Awaited<ReturnType<typeof listSubjects>>[number];
export type SubjectDetail = NonNullable<Awaited<ReturnType<typeof getSubjectDetail>>>;
