import { prisma } from "@/infrastructure/db/prisma";

export function listExams(userId: string) {
  return prisma.exam.findMany({
    where: { userId },
    include: {
      subject: { select: { id: true, name: true, colorHex: true } },
      topics: { orderBy: { order: "asc" } },
    },
    orderBy: { date: "asc" },
  });
}

export function getExamDetail(userId: string, examId: string) {
  return prisma.exam.findFirst({
    where: { id: examId, userId },
    include: {
      subject: { select: { id: true, name: true, colorHex: true } },
      topics: { orderBy: { order: "asc" } },
    },
  });
}

export type ExamListItem = Awaited<ReturnType<typeof listExams>>[number];
export type ExamDetail = NonNullable<Awaited<ReturnType<typeof getExamDetail>>>;

export async function getExamHoursStudied(examId: string): Promise<number> {
  const result = await prisma.focusSession.aggregate({
    where: { examId, completed: true },
    _sum: { actualMinutes: true },
  });
  return (result._sum.actualMinutes ?? 0) / 60;
}
