import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  image: z.string().trim().url("Must be a valid URL.").optional().or(z.literal("")),
  university: z.string().trim().max(150).optional().or(z.literal("")),
  degree: z.string().trim().max(150).optional().or(z.literal("")),
  semester: z.string().trim().max(50).optional().or(z.literal("")),
  currentGpa: z.coerce.number().min(0).max(4).optional(),
  targetGpa: z.coerce.number().min(0).max(4).optional(),
  weeklyGoalHours: z.coerce.number().min(0).max(168),
  dailyGoalHours: z.coerce.number().min(0).max(24),
});

export type ProfileInput = z.infer<typeof profileSchema>;
