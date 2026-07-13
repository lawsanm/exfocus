"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";
import { updateProfileAction } from "@/features/profile/actions";
import type { FormActionState } from "@/lib/form-action-state";
import type { User } from "@/generated/prisma/client";

const initialState: FormActionState = {};

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email;
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProfileForm({
  user,
}: {
  user: Pick<
    User,
    | "name"
    | "email"
    | "image"
    | "university"
    | "degree"
    | "semester"
    | "currentGpa"
    | "targetGpa"
    | "weeklyGoalHours"
    | "dailyGoalHours"
  >;
}) {
  const { state, formAction } = useDialogFormAction(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.error && (
        <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          {user.image && <AvatarImage src={user.image} alt="" />}
          <AvatarFallback className="text-lg">{initials(user.name, user.email)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="image">Avatar URL</Label>
          <Input id="image" name="image" placeholder="https://…" defaultValue={user.image ?? ""} />
          {state.fieldErrors?.image && (
            <p className="text-destructive text-sm">{state.fieldErrors.image[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={user.name ?? ""} required />
        {state.fieldErrors?.name && (
          <p className="text-destructive text-sm">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="university">University</Label>
          <Input id="university" name="university" defaultValue={user.university ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="degree">Degree</Label>
          <Input id="degree" name="degree" defaultValue={user.degree ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="semester">Semester</Label>
          <Input id="semester" name="semester" defaultValue={user.semester ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currentGpa">Current GPA</Label>
          <Input
            id="currentGpa"
            name="currentGpa"
            type="number"
            step="0.01"
            min="0"
            max="4"
            defaultValue={user.currentGpa ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="targetGpa">Target GPA</Label>
          <Input
            id="targetGpa"
            name="targetGpa"
            type="number"
            step="0.01"
            min="0"
            max="4"
            defaultValue={user.targetGpa ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="weeklyGoalHours">Weekly study goal (hours)</Label>
          <Input
            id="weeklyGoalHours"
            name="weeklyGoalHours"
            type="number"
            step="0.5"
            min="0"
            defaultValue={user.weeklyGoalHours}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dailyGoalHours">Daily study goal (hours)</Label>
          <Input
            id="dailyGoalHours"
            name="dailyGoalHours"
            type="number"
            step="0.5"
            min="0"
            defaultValue={user.dailyGoalHours}
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton className="w-auto">Save profile</SubmitButton>
      </div>
    </form>
  );
}
