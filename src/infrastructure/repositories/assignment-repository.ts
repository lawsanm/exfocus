import { prisma } from "@/infrastructure/db/prisma";

export function listAssignments(userId: string) {
  return prisma.assignment.findMany({
    where: { userId },
    include: { subject: { select: { id: true, name: true, colorHex: true } } },
    orderBy: { deadline: "asc" },
  });
}

export type AssignmentListItem = Awaited<ReturnType<typeof listAssignments>>[number];
