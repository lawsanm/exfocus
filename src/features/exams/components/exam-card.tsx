import Link from "next/link";
import { GraduationCap, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { computePreparationPercent } from "@/lib/preparation";
import { deleteExamAction } from "@/features/exams/actions";
import type { ExamListItem } from "@/infrastructure/repositories/exam-repository";

function formatDaysRemaining(date: Date): string {
  const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "Past";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function ExamCard({ exam }: { exam: ExamListItem }) {
  const preparation = computePreparationPercent(exam.preparationPercent, exam.topics);
  const date = new Date(exam.date);

  return (
    <Card className="hover-lift h-full">
      <CardHeader className="flex-row items-start justify-between gap-2">
        <Link href={`/exams/${exam.id}`} className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${exam.subject.colorHex}26`, color: exam.subject.colorHex }}
          >
            <GraduationCap className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{exam.subject.name} Exam</p>
            <p className="text-muted-foreground text-xs">
              {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ·{" "}
              {formatDaysRemaining(date)}
            </p>
          </div>
        </Link>
        <DifficultyBadge difficulty={exam.difficulty} />
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
          <span>{exam.weight}% of grade</span>
          <span>{exam.topics.length} topics</span>
        </div>
        <ConfirmActionButton
          action={deleteExamAction.bind(null, exam.id)}
          title="Delete this exam?"
          description="This can't be undone."
          confirmLabel="Delete"
          triggerVariant="ghost"
          triggerLabel={
            <>
              <Trash2 className="size-3.5" aria-hidden="true" />
              Delete
            </>
          }
        />
      </CardContent>
    </Card>
  );
}
