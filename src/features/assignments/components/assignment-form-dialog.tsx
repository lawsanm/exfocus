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
import { createAssignmentAction, updateAssignmentAction } from "@/features/assignments/actions";
import type { FormActionState } from "@/lib/form-action-state";
import type { AssignmentListItem } from "@/infrastructure/repositories/assignment-repository";

const initialState: FormActionState = {};

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AssignmentFormDialog({
  subjects,
  assignment,
}: {
  subjects: SubjectOption[];
  assignment?: AssignmentListItem;
}) {
  const isEdit = Boolean(assignment);
  const action = isEdit
    ? updateAssignmentAction.bind(null, assignment!.id)
    : createAssignmentAction;
  const { state, formAction, open, setOpen } = useDialogFormAction(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={isEdit ? <Button variant="outline" size="sm" /> : <Button size="sm" />}
      >
        {!isEdit && <Plus className="size-4" aria-hidden="true" />}
        {isEdit ? "Edit" : "Add assignment"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit assignment" : "Add an assignment"}</DialogTitle>
          <DialogDescription>Track deadlines and grade weight for a subject.</DialogDescription>
        </DialogHeader>
        {subjects.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Add a subject first — assignments belong to a subject.
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
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={assignment?.title} required />
              {state.fieldErrors?.title && (
                <p className="text-destructive text-sm">{state.fieldErrors.title[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subjectId">Subject</Label>
              <SubjectSelect
                name="subjectId"
                subjects={subjects}
                defaultValue={assignment?.subjectId ?? subjects[0]?.id}
              />
              {state.fieldErrors?.subjectId && (
                <p className="text-destructive text-sm">{state.fieldErrors.subjectId[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="datetime-local"
                  defaultValue={
                    assignment ? toDatetimeLocal(new Date(assignment.deadline)) : undefined
                  }
                  required
                />
                {state.fieldErrors?.deadline && (
                  <p className="text-destructive text-sm">{state.fieldErrors.deadline[0]}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="difficulty">Difficulty</Label>
                <DifficultySelect
                  name="difficulty"
                  defaultValue={assignment?.difficulty ?? "MEDIUM"}
                />
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
                  defaultValue={assignment?.weight ?? 10}
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
                  defaultValue={assignment?.estimatedHours ?? 2}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="progressPercent">Progress (%)</Label>
              <Input
                id="progressPercent"
                name="progressPercent"
                type="number"
                min="0"
                max="100"
                defaultValue={assignment?.progressPercent ?? 0}
                required
              />
            </div>

            <DialogFooter>
              <SubmitButton>{isEdit ? "Save changes" : "Create assignment"}</SubmitButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
