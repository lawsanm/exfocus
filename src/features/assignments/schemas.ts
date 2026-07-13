import { z } from "zod";

export const assignmentSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(150),
  subjectId: z.string().min(1, "Choose a subject."),
  deadline: z.coerce.date({ error: "Choose a deadline." }),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "VERY_HARD"]),
  weight: z.coerce.number().min(0).max(100),
  estimatedHours: z.coerce.number().min(0).max(500),
  progressPercent: z.coerce.number().min(0).max(100),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;
