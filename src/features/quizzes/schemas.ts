import { z } from "zod";

export const quizSchema = z.object({
  subjectId: z.string().min(1, "Choose a subject."),
  quizDate: z.coerce.date({ error: "Choose a date." }),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "VERY_HARD"]),
  weight: z.coerce.number().min(0).max(100),
  estimatedHours: z.coerce.number().min(0).max(100),
  preparationPercent: z.coerce.number().min(0).max(100),
});

export type QuizInput = z.infer<typeof quizSchema>;
