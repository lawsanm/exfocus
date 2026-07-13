import { z } from "zod";

/** Shape of the JSON produced by /api/export and accepted by the Settings
 * import action. Versioned so future schema changes can branch on it. */
export const exportDataSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  subjects: z.array(
    z.object({
      name: z.string(),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD", "VERY_HARD"]),
      creditHours: z.number(),
      targetGrade: z.string().nullable(),
      preparationPercent: z.number(),
      estimatedHours: z.number(),
      colorHex: z.string(),
      topics: z.array(
        z.object({ name: z.string(), estimatedHours: z.number(), completed: z.boolean() }),
      ),
    }),
  ),
  assignments: z.array(
    z.object({
      subjectName: z.string(),
      title: z.string(),
      deadline: z.string(),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD", "VERY_HARD"]),
      weight: z.number(),
      estimatedHours: z.number(),
      progressPercent: z.number(),
    }),
  ),
  exams: z.array(
    z.object({
      subjectName: z.string(),
      date: z.string(),
      weight: z.number(),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD", "VERY_HARD"]),
      preparationPercent: z.number(),
      estimatedHours: z.number(),
    }),
  ),
  quizzes: z.array(
    z.object({
      subjectName: z.string(),
      quizDate: z.string(),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD", "VERY_HARD"]),
      weight: z.number(),
      estimatedHours: z.number(),
      preparationPercent: z.number(),
    }),
  ),
  projects: z.array(
    z.object({
      subjectName: z.string().nullable(),
      title: z.string(),
      deadline: z.string(),
      progressPercent: z.number(),
      estimatedHours: z.number(),
    }),
  ),
});

export type ExportData = z.infer<typeof exportDataSchema>;
