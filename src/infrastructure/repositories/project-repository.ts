import { prisma } from "@/infrastructure/db/prisma";

export function listProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    include: { subject: { select: { id: true, name: true, colorHex: true } } },
    orderBy: { deadline: "asc" },
  });
}

export type ProjectListItem = Awaited<ReturnType<typeof listProjects>>[number];
