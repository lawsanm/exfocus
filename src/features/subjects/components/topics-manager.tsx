"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { addTopicAction, deleteTopicAction, toggleTopicAction } from "@/features/subjects/actions";
import type { FormActionState } from "@/lib/form-action-state";
import type { SubjectDetail } from "@/infrastructure/repositories/subject-repository";

const initialState: FormActionState = {};

export function TopicsManager({
  subjectId,
  topics,
}: {
  subjectId: string;
  topics: SubjectDetail["topics"];
}) {
  const boundAddTopic = addTopicAction.bind(null, subjectId);
  const [state, formAction] = useActionState(boundAddTopic, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col gap-3">
      {topics.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No topics yet. Break this subject into topics so the planner can track preparation.
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
                  startTransition(() => toggleTopicAction(subjectId, topic.id))
                }
                aria-label={`Mark ${topic.name} as ${topic.completed ? "incomplete" : "complete"}`}
              />
              <span
                className={`flex-1 truncate text-sm ${topic.completed ? "text-muted-foreground line-through" : ""}`}
              >
                {topic.name}
              </span>
              <span className="text-muted-foreground shrink-0 text-xs">
                {topic.estimatedHours}h
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${topic.name}`}
                onClick={() => startTransition(() => deleteTopicAction(subjectId, topic.id))}
              >
                <Trash2 className="text-destructive size-3.5" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="flex items-end gap-2 border-t pt-3">
        <div className="flex-1 space-y-1">
          <Label htmlFor="topic-name" className="text-xs">
            Topic name
          </Label>
          <Input id="topic-name" name="name" placeholder="e.g. ER Diagrams" required />
        </div>
        <div className="w-24 space-y-1">
          <Label htmlFor="topic-hours" className="text-xs">
            Hours
          </Label>
          <Input
            id="topic-hours"
            name="estimatedHours"
            type="number"
            step="0.25"
            min="0.25"
            defaultValue="1"
            required
          />
        </div>
        <SubmitButton className="w-auto">Add</SubmitButton>
      </form>
      {state.fieldErrors?.name && (
        <p className="text-destructive text-sm">{state.fieldErrors.name[0]}</p>
      )}
    </div>
  );
}
