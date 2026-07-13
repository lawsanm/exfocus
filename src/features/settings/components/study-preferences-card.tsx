"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";
import { updateStudyPreferencesAction } from "@/features/settings/actions";
import { FOCUS_MODE_PRESETS } from "@/lib/constants";
import type { FormActionState } from "@/lib/form-action-state";

const initialState: FormActionState = {};

export function StudyPreferencesCard({
  defaultFocusMode,
  academicYear,
}: {
  defaultFocusMode: string;
  academicYear: string | null;
}) {
  const { formAction } = useDialogFormAction(updateStudyPreferencesAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="defaultFocusMode">Default focus session</Label>
            <Select name="defaultFocusMode" defaultValue={defaultFocusMode}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FOCUS_MODE_PRESETS).map(([key, preset]) => (
                  <SelectItem key={key} value={key}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="academicYear">Academic year</Label>
            <Input
              id="academicYear"
              name="academicYear"
              placeholder="2025-2026"
              defaultValue={academicYear ?? ""}
            />
          </div>
          <SubmitButton className="w-auto">Save preferences</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
