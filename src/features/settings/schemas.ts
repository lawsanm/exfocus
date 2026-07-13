import { z } from "zod";

export const studyPreferencesSchema = z.object({
  defaultFocusMode: z.enum(["POMODORO_25_5", "DEEP_FOCUS_50_10", "SESSION_90", "CUSTOM"]),
  academicYear: z.string().trim().max(20).optional().or(z.literal("")),
});

export type StudyPreferencesInput = z.infer<typeof studyPreferencesSchema>;
