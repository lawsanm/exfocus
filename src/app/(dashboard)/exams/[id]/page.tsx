import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/db/prisma";
import { getExamDetail, getExamHoursStudied } from "@/infrastructure/repositories/exam-repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { ExamFormDialog } from "@/features/exams/components/exam-form-dialog";
import { ExamTopicsManager } from "@/features/exams/components/exam-topics-manager";
import { ReadinessScoreCard } from "@/features/exams/components/readiness-score-card";
import { computePreparationPercent } from "@/lib/preparation";
import { computeExamReadiness } from "@/application/services/readiness-score";

export const metadata: Metadata = {
  title: "Exam",
};

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const [exam, subjects] = await Promise.all([
    getExamDetail(session.user.id, id),
    prisma.subject.findMany({
      where: { userId: session.user.id, archivedAt: null },
      select: { id: true, name: true, colorHex: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!exam) notFound();

  const preparation = computePreparationPercent(exam.preparationPercent, exam.topics);
  const hoursStudied = await getExamHoursStudied(exam.id);
  const readiness = computeExamReadiness(preparation, hoursStudied, exam.estimatedHours);
  const date = new Date(exam.date);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/exams"
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All exams
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{exam.subject.name} Exam</h1>
          <div className="mt-1 flex items-center gap-2">
            <DifficultyBadge difficulty={exam.difficulty} />
            <span className="text-muted-foreground text-sm">
              {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>
        <ExamFormDialog subjects={subjects} exam={exam} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ReadinessScoreCard readiness={readiness} />
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-xs">Preparation</p>
              <p className="text-2xl font-semibold tabular-nums">{preparation}%</p>
              <Progress value={preparation} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-xs">Grade weight</p>
              <p className="text-2xl font-semibold tabular-nums">{exam.weight}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-xs">Estimated hours</p>
              <p className="text-2xl font-semibold tabular-nums">{exam.estimatedHours}h</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-xs">Hours studied</p>
              <p className="text-2xl font-semibold tabular-nums">
                {Math.round(hoursStudied * 10) / 10}h
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <ExamTopicsManager examId={exam.id} topics={exam.topics} />
        </CardContent>
      </Card>
    </div>
  );
}
