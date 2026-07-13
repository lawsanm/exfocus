"use client";

import { useEffect, useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";
import {
  addExamTopicAction,
  deleteExamTopicAction,
  toggleExamTopicAction,
} from "@/features/exams/actions";
import type { FormActionState } from "@/lib/form-action-state";
import type { ExamDetail } from "@/infrastructure/repositories/exam-repository";

const initialState: FormActionState = {};

export function ExamTopicsManager({
  examId,
  topics,
}: {
  examId: string;
  topics: ExamDetail["topics"];
}) {
  const { state, formAction } = useDialogFormAction(
    addExamTopicAction.bind(null, examId),
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col gap-3">
      {topics.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No topics yet. Break the syllabus into topics to get an accurate readiness score.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="hover:bg-accent/50 flex items-center gap-3 rounded-md px-2 py-1.5"
            >
              <Checkbox
                checked={topic.completed}
                onCheckedChange={() =>
                  startTransition(() => toggleExamTopicAction(examId, topic.id))
                }
                aria-label={`Mark ${topic.name} as ${topic.completed ? "incomplete" : "complete"}`}
              />
              <span
                className={`flex-1 truncate text-sm ${topic.completed ? "text-muted-foreground line-through" : ""}`}
              >
                {topic.name}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${topic.name}`}
                onClick={() => startTransition(() => deleteExamTopicAction(examId, topic.id))}
              >
                <Trash2 className="text-destructive size-3.5" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="flex items-end gap-2 border-t pt-3">
        <div className="flex-1 space-y-1">
          <Label htmlFor="exam-topic-name" className="text-xs">
            Topic name
          </Label>
          <Input id="exam-topic-name" name="name" placeholder="e.g. Normalization" required />
        </div>
        <SubmitButton className="w-auto">Add</SubmitButton>
      </form>
      {state.fieldErrors?.name && (
        <p className="text-destructive text-sm">{state.fieldErrors.name[0]}</p>
      )}
    </div>
  );
}
