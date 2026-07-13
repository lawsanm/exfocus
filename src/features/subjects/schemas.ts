import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "VERY_HARD"]),
  creditHours: z.coerce.number().min(0).max(20),
  targetGrade: z.string().trim().max(10).optional().or(z.literal("")),
  estimatedHours: z.coerce.number().min(0).max(1000),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color."),
});

export type SubjectInput = z.infer<typeof subjectSchema>;

export const topicSchema = z.object({
  name: z.string().trim().min(1, "Topic name is required.").max(120),
  estimatedHours: z.coerce.number().min(0.25).max(100),
});

export type TopicInput = z.infer<typeof topicSchema>;
