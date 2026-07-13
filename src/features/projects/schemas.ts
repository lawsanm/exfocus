import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(150),
  subjectId: z
    .string()
    .optional()
    .transform((v) => (v === "none" || !v ? null : v)),
  deadline: z.coerce.date({ error: "Choose a deadline." }),
  progressPercent: z.coerce.number().min(0).max(100),
  estimatedHours: z.coerce.number().min(0).max(500),
});

export type ProjectInput = z.infer<typeof projectSchema>;
