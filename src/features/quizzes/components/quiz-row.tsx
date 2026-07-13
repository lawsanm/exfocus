"use client";

import { Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { QuizFormDialog } from "@/features/quizzes/components/quiz-form-dialog";
import { deleteQuizAction } from "@/features/quizzes/actions";
import type { SubjectOption } from "@/components/forms/subject-select";
import type { QuizListItem } from "@/infrastructure/repositories/quiz-repository";

export function QuizRow({ quiz, subjects }: { quiz: QuizListItem; subjects: SubjectOption[] }) {
  const date = new Date(quiz.quizDate);
  const isPast = date < new Date();

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: quiz.subject.colorHex }}
          />
          <span className="font-medium">{quiz.subject.name}</span>
        </div>
      </TableCell>
      <TableCell className={isPast ? "text-muted-foreground" : undefined}>
        {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </TableCell>
      <TableCell>
        <DifficultyBadge difficulty={quiz.difficulty} />
      </TableCell>
      <TableCell>{quiz.weight}%</TableCell>
      <TableCell className="w-36">
        <div className="flex items-center gap-2">
          <Progress value={quiz.preparationPercent} className="h-1.5" />
          <span className="text-muted-foreground w-9 shrink-0 text-xs">
            {quiz.preparationPercent}%
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <QuizFormDialog subjects={subjects} quiz={quiz} />
          <ConfirmActionButton
            action={deleteQuizAction.bind(null, quiz.id)}
            title="Delete this quiz?"
            description="This can't be undone."
            confirmLabel="Delete"
            triggerVariant="ghost"
            triggerLabel={<Trash2 className="text-destructive size-3.5" aria-hidden="true" />}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
