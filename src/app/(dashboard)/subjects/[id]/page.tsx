import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getSubjectDetail } from "@/infrastructure/repositories/subject-repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { SubjectFormDialog } from "@/features/subjects/components/subject-form-dialog";
import { TopicsManager } from "@/features/subjects/components/topics-manager";
import { computePreparationPercent } from "@/lib/preparation";

export const metadata: Metadata = {
  title: "Subject",
};

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const subject = await getSubjectDetail(session.user.id, id);
  if (!subject) notFound();

  const preparation = computePreparationPercent(subject.preparationPercent, subject.topics);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/subjects"
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All subjects
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl text-lg font-semibold"
            style={{ backgroundColor: `${subject.colorHex}26`, color: subject.colorHex }}
          >
            {subject.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{subject.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <DifficultyBadge difficulty={subject.difficulty} />
              <span className="text-muted-foreground text-sm">
                {subject.creditHours} credit hours
              </span>
            </div>
          </div>
        </div>
        <SubjectFormDialog subject={subject} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-muted-foreground text-xs">Preparation</p>
            <p className="text-2xl font-semibold tabular-nums">{preparation}%</p>
            <Progress value={preparation} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-muted-foreground text-xs">Target grade</p>
            <p className="text-2xl font-semibold">{subject.targetGrade || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-muted-foreground text-xs">Estimated hours</p>
            <p className="text-2xl font-semibold tabular-nums">{subject.estimatedHours}h</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <TopicsManager subjectId={subject.id} topics={subject.topics} />
        </CardContent>
      </Card>
    </div>
  );
}
