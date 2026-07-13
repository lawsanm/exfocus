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
import { createExamAction, updateExamAction } from "@/features/exams/actions";
import type { FormActionState } from "@/lib/form-action-state";
import type { ExamListItem } from "@/infrastructure/repositories/exam-repository";

const initialState: FormActionState = {};

function toDateInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function ExamFormDialog({
  subjects,
  exam,
}: {
  subjects: SubjectOption[];
  exam?: ExamListItem;
}) {
  const isEdit = Boolean(exam);
  const action = isEdit ? updateExamAction.bind(null, exam!.id) : createExamAction;
  const { state, formAction, open, setOpen } = useDialogFormAction(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={isEdit ? <Button variant="outline" size="sm" /> : <Button size="sm" />}
      >
        {!isEdit && <Plus className="size-4" aria-hidden="true" />}
        {isEdit ? "Edit" : "Add exam"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit exam" : "Add an exam"}</DialogTitle>
          <DialogDescription>Exams get the highest priority as their date nears.</DialogDescription>
        </DialogHeader>
        {subjects.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Add a subject first — exams belong to a subject.
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
                defaultValue={exam?.subjectId ?? subjects[0]?.id}
              />
              {state.fieldErrors?.subjectId && (
                <p className="text-destructive text-sm">{state.fieldErrors.subjectId[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={exam ? toDateInput(new Date(exam.date)) : undefined}
                  required
                />
                {state.fieldErrors?.date && (
                  <p className="text-destructive text-sm">{state.fieldErrors.date[0]}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="difficulty">Difficulty</Label>
                <DifficultySelect name="difficulty" defaultValue={exam?.difficulty ?? "MEDIUM"} />
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
                  defaultValue={exam?.weight ?? 20}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="estimatedHours">Est. hours</Label>
                <Input
                  id="estimatedHours"
                  name="estimatedHours"
                  type="number"
                  step="0.5"
                  min="0"
                  defaultValue={exam?.estimatedHours ?? 4}
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
                defaultValue={exam?.preparationPercent ?? 0}
                required
              />
              <p className="text-muted-foreground text-xs">
                Overridden automatically once you add topics on the exam&apos;s detail page.
              </p>
            </div>

            <DialogFooter>
              <SubmitButton>{isEdit ? "Save changes" : "Create exam"}</SubmitButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
