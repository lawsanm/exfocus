"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DifficultySelect } from "@/components/forms/difficulty-select";
import { SubjectSelect, type SubjectOption } from "@/components/forms/subject-select";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";
import { createQuizAction, updateQuizAction } from "@/features/quizzes/actions";
import type { FormActionState } from "@/lib/form-action-state";
import type { QuizListItem } from "@/infrastructure/repositories/quiz-repository";

const initialState: FormActionState = {};

function toDateInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function QuizFormDialog({
  subjects,
  quiz,
}: {
  subjects: SubjectOption[];
  quiz?: QuizListItem;
}) {
  const isEdit = Boolean(quiz);
  const action = isEdit ? updateQuizAction.bind(null, quiz!.id) : createQuizAction;
  const { state, formAction, open, setOpen } = useDialogFormAction(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={isEdit ? <Button variant="outline" size="sm" /> : <Button size="sm" />}
      >
        {!isEdit && <Plus className="size-4" aria-hidden="true" />}
        {isEdit ? "Edit" : "Add quiz"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit quiz" : "Add a quiz"}</DialogTitle>
          <DialogDescription>Short, frequent checks — low weight, quick to prep.</DialogDescription>
        </DialogHeader>
        {subjects.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Add a subject first — quizzes belong to a subject.
          </p>
        ) : (
          <form action={formAction} className="space-y-4" noValidate>
            {state.error && (
              <p
                role="alert"
                className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
              >
                {state.error}
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="subjectId">Subject</Label>
              <SubjectSelect
                name="subjectId"
                subjects={subjects}
                defaultValue={quiz?.subjectId ?? subjects[0]?.id}
              />
              {state.fieldErrors?.subjectId && (
                <p className="text-destructive text-sm">{state.fieldErrors.subjectId[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="quizDate">Date</Label>
                <Input
                  id="quizDate"
                  name="quizDate"
                  type="date"
                  defaultValue={quiz ? toDateInput(new Date(quiz.quizDate)) : undefined}
                  required
                />
                {state.fieldErrors?.quizDate && (
                  <p className="text-destructive text-sm">{state.fieldErrors.quizDate[0]}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="difficulty">Difficulty</Label>
                <DifficultySelect name="difficulty" defaultValue={quiz?.difficulty ?? "MEDIUM"} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="weight">Grade weight (%)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={quiz?.weight ?? 5}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="estimatedHours">Est. hours</Label>
                <Input
                  id="estimatedHours"
                  name="estimatedHours"
                  type="number"
                  step="0.25"
                  min="0"
                  defaultValue={quiz?.estimatedHours ?? 1}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="preparationPercent">Preparation (%)</Label>
              <Input
                id="preparationPercent"
                name="preparationPercent"
                type="number"
                min="0"
                max="100"
                defaultValue={quiz?.preparationPercent ?? 0}
                required
              />
            </div>

            <DialogFooter>
              <SubmitButton>{isEdit ? "Save changes" : "Create quiz"}</SubmitButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
