import { z } from "zod";

export const completeFocusSessionSchema = z.object({
  mode: z.enum(["POMODORO_25_5", "DEEP_FOCUS_50_10", "SESSION_90", "CUSTOM"]),
  plannedMinutes: z.number().int().min(1).max(240),
  actualMinutes: z.number().int().min(0).max(240),
  startedAt: z.coerce.date(),
  subjectId: z.string().optional(),
  studySessionId: z.string().optional(),
});

export type CompleteFocusSessionInput = z.infer<typeof completeFocusSessionSchema>;
