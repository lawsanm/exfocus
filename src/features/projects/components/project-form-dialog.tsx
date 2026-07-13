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
import { SubjectSelect, type SubjectOption } from "@/components/forms/subject-select";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";
import { createProjectAction, updateProjectAction } from "@/features/projects/actions";
import type { FormActionState } from "@/lib/form-action-state";
import type { ProjectListItem } from "@/infrastructure/repositories/project-repository";

const initialState: FormActionState = {};

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ProjectFormDialog({
  subjects,
  project,
}: {
  subjects: SubjectOption[];
  project?: ProjectListItem;
}) {
  const isEdit = Boolean(project);
  const action = isEdit ? updateProjectAction.bind(null, project!.id) : createProjectAction;
  const { state, formAction, open, setOpen } = useDialogFormAction(action, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={isEdit ? <Button variant="outline" size="sm" /> : <Button size="sm" />}
      >
        {!isEdit && <Plus className="size-4" aria-hidden="true" />}
        {isEdit ? "Edit" : "Add project"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit project" : "Add a project"}</DialogTitle>
          <DialogDescription>Multi-step work — optionally tied to a subject.</DialogDescription>
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
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={project?.title} required />
            {state.fieldErrors?.title && (
              <p className="text-destructive text-sm">{state.fieldErrors.title[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subjectId">Subject (optional)</Label>
            <SubjectSelect
              name="subjectId"
              subjects={subjects}
              defaultValue={project?.subjectId ?? undefined}
              allowNone
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                name="deadline"
                type="datetime-local"
                defaultValue={project ? toDatetimeLocal(new Date(project.deadline)) : undefined}
                required
              />
              {state.fieldErrors?.deadline && (
                <p className="text-destructive text-sm">{state.fieldErrors.deadline[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estimatedHours">Est. hours</Label>
              <Input
                id="estimatedHours"
                name="estimatedHours"
                type="number"
                step="1"
                min="0"
                defaultValue={project?.estimatedHours ?? 6}
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
              defaultValue={project?.progressPercent ?? 0}
              required
            />
          </div>

          <DialogFooter>
            <SubmitButton>{isEdit ? "Save changes" : "Create project"}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
