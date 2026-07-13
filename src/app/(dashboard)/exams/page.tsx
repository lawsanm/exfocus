import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/db/prisma";
import { listExams } from "@/infrastructure/repositories/exam-repository";
import { ExamFormDialog } from "@/features/exams/components/exam-form-dialog";
import { ExamCard } from "@/features/exams/components/exam-card";

export const metadata: Metadata = {
  title: "Exams",
};

export default async function ExamsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [exams, subjects] = await Promise.all([
    listExams(session.user.id),
    prisma.subject.findMany({
      where: { userId: session.user.id, archivedAt: null },
      select: { id: true, name: true, colorHex: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Exams</h1>
          <p className="text-muted-foreground text-sm">
            Exams carry the most weight in the planner&apos;s priority calculation.
          </p>
        </div>
        <ExamFormDialog subjects={subjects} />
      </div>

      {exams.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <GraduationCap className="text-muted-foreground size-8" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">No exams yet.</p>
          <ExamFormDialog subjects={subjects} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
}
