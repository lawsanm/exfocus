"use client";

import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";
import { importDataAction } from "@/features/settings/actions";
import type { FormActionState } from "@/lib/form-action-state";

const initialState: FormActionState = {};

export function DataManagementCard() {
  const { state, formAction } = useDialogFormAction(importDataAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup &amp; restore</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-muted-foreground mb-2 text-sm">
            Download all your subjects, assignments, exams, quizzes, and projects as JSON.
          </p>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<a href="/api/export" download />}
          >
            <Download className="size-4" />
            Export data
          </Button>
        </div>
        <Separator />
        <form action={formAction} className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Import a previously exported file. Imported items are added alongside your existing
            data, not merged or overwritten.
          </p>
          {state.error && <p className="text-destructive text-sm">{state.error}</p>}
          {state.success && <p className="text-success text-sm">Import complete.</p>}
          <div className="flex items-center gap-2">
            <Label htmlFor="import-file" className="sr-only">
              Import file
            </Label>
            <Input id="import-file" name="file" type="file" accept="application/json" required />
            <SubmitButton className="w-auto shrink-0">
              <Upload className="size-4" />
              Import
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
