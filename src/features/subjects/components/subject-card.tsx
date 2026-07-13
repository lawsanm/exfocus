import Link from "next/link";
import { Archive, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { computePreparationPercent } from "@/lib/preparation";
import { archiveSubjectAction } from "@/features/subjects/actions";
import type { SubjectListItem } from "@/infrastructure/repositories/subject-repository";

export function SubjectCard({ subject }: { subject: SubjectListItem }) {
  const preparation = computePreparationPercent(subject.preparationPercent, subject.topics);
  const totalItems =
    subject._count.assignments +
    subject._count.exams +
    subject._count.quizzes +
    subject._count.projects;

  return (
    <Card className="hover-lift group relative h-full">
      <CardHeader className="flex-row items-start justify-between gap-2">
        <Link href={`/subjects/${subject.id}`} className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${subject.colorHex}26`, color: subject.colorHex }}
          >
            <BookOpen className="size-4" aria-hidden="true" />
          </span>
          <span className="truncate font-medium">{subject.name}</span>
        </Link>
        <DifficultyBadge difficulty={subject.difficulty} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
            <span>Preparation</span>
            <span>{preparation}%</span>
          </div>
          <Progress value={preparation} />
        </div>
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>{subject.creditHours} credit hours</span>
          <span>
            {subject.topics.length} topics · {totalItems} linked items
          </span>
        </div>
        <ConfirmActionButton
          action={archiveSubjectAction.bind(null, subject.id)}
          title="Archive this subject?"
          description="Archived subjects are hidden from your dashboard and planner but not deleted."
          confirmLabel="Archive"
          triggerLabel={
            <>
              <Archive className="size-3.5" aria-hidden="true" />
              Archive
            </>
          }
          triggerVariant="ghost"
          triggerSize="sm"
        />
      </CardContent>
    </Card>
  );
}
