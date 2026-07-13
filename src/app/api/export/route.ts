import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/db/prisma";
import type { ExportData } from "@/lib/export-format";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [subjects, assignments, exams, quizzes, projects] = await Promise.all([
    prisma.subject.findMany({
      where: { userId, archivedAt: null },
      include: { topics: true },
    }),
    prisma.assignment.findMany({ where: { userId }, include: { subject: true } }),
    prisma.exam.findMany({ where: { userId }, include: { subject: true } }),
    prisma.quiz.findMany({ where: { userId }, include: { subject: true } }),
    prisma.project.findMany({ where: { userId }, include: { subject: true } }),
  ]);

  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    subjects: subjects.map((s) => ({
      name: s.name,
      difficulty: s.difficulty,
      creditHours: s.creditHours,
      targetGrade: s.targetGrade,
      preparationPercent: s.preparationPercent,
      estimatedHours: s.estimatedHours,
      colorHex: s.colorHex,
      topics: s.topics.map((t) => ({
        name: t.name,
        estimatedHours: t.estimatedHours,
        completed: t.completed,
      })),
    })),
    assignments: assignments.map((a) => ({
      subjectName: a.subject.name,
      title: a.title,
      deadline: a.deadline.toISOString(),
      difficulty: a.difficulty,
      weight: a.weight,
      estimatedHours: a.estimatedHours,
      progressPercent: a.progressPercent,
    })),
    exams: exams.map((e) => ({
      subjectName: e.subject.name,
      date: e.date.toISOString(),
      weight: e.weight,
      difficulty: e.difficulty,
      preparationPercent: e.preparationPercent,
      estimatedHours: e.estimatedHours,
    })),
    quizzes: quizzes.map((q) => ({
      subjectName: q.subject.name,
      quizDate: q.quizDate.toISOString(),
      difficulty: q.difficulty,
      weight: q.weight,
      estimatedHours: q.estimatedHours,
      preparationPercent: q.preparationPercent,
    })),
    projects: projects.map((p) => ({
      subjectName: p.subject?.name ?? null,
      title: p.title,
      deadline: p.deadline.toISOString(),
      progressPercent: p.progressPercent,
      estimatedHours: p.estimatedHours,
    })),
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="exfocus-export-${data.exportedAt.slice(0, 10)}.json"`,
    },
  });
}
