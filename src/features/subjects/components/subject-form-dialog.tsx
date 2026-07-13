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
import { ColorSwatchPicker } from "@/components/forms/color-swatch-picker";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";
import { createSubjectAction, updateSubjectAction } from "@/features/subjects/actions";
import type { FormActionState } from "@/lib/form-action-state";
import type { SubjectDetail } from "@/infrastructure/repositories/subject-repository";

const initialState: FormActionState = {};

export function SubjectFormDialog({ subject }: { subject?: SubjectDetail }) {
  const isEdit = Boolean(subject);
  const action = isEdit ? updateSubjectAction.bind(null, subject!.id) : createSubjectAction;
  const { state, formAction, open, setOpen } = useDialogFormAction(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={isEdit ? <Button variant="outline" size="sm" /> : <Button size="sm" />}
      >
        {!isEdit && <Plus className="size-4" aria-hidden="true" />}
        {isEdit ? "Edit subject" : "Add subject"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit subject" : "Add a subject"}</DialogTitle>
          <DialogDescription>
            Subjects tie together assignments, exams, quizzes, and study sessions.
          </DialogDescription>
        </DialogHeader>
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
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={subject?.name} required />
            {state.fieldErrors?.name && (
              <p className="text-destructive text-sm">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="difficulty">Difficulty</Label>
              <DifficultySelect name="difficulty" defaultValue={subject?.difficulty ?? "MEDIUM"} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="creditHours">Credit hours</Label>
              <Input
                id="creditHours"
                name="creditHours"
                type="number"
                step="0.5"
                min="0"
                defaultValue={subject?.creditHours ?? 3}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="targetGrade">Target grade</Label>
              <Input
                id="targetGrade"
                name="targetGrade"
                placeholder="A"
                defaultValue={subject?.targetGrade ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estimatedHours">Est. total hours</Label>
              <Input
                id="estimatedHours"
                name="estimatedHours"
                type="number"
                step="1"
                min="0"
                defaultValue={subject?.estimatedHours ?? 20}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <ColorSwatchPicker name="colorHex" defaultValue={subject?.colorHex} />
          </div>

          <DialogFooter>
            <SubmitButton>{isEdit ? "Save changes" : "Create subject"}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
