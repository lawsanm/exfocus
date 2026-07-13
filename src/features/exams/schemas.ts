import { z } from "zod";

export const examSchema = z.object({
  subjectId: z.string().min(1, "Choose a subject."),
  date: z.coerce.date({ error: "Choose a date." }),
  weight: z.coerce.number().min(0).max(100),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "VERY_HARD"]),
  preparationPercent: z.coerce.number().min(0).max(100),
  estimatedHours: z.coerce.number().min(0).max(500),
});

export type ExamInput = z.infer<typeof examSchema>;

export const examTopicSchema = z.object({
  name: z.string().trim().min(1, "Topic name is required.").max(120),
});

export type ExamTopicInput = z.infer<typeof examTopicSchema>;
