import { prisma } from "@/infrastructure/db/prisma";

export function listQuizzes(userId: string) {
  return prisma.quiz.findMany({
    where: { userId },
    include: { subject: { select: { id: true, name: true, colorHex: true } } },
    orderBy: { quizDate: "asc" },
  });
}

export type QuizListItem = Awaited<ReturnType<typeof listQuizzes>>[number];
