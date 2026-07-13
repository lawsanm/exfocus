import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),
  AUTH_SECRET: z.string().min(16),
  NEXTAUTH_URL: z.url(),
  AUTH_GOOGLE_ID: z.string().optional().default(""),
  AUTH_GOOGLE_SECRET: z.string().optional().default(""),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional().default(""),
  VAPID_PRIVATE_KEY: z.string().optional().default(""),
  CRON_SECRET: z.string().optional().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables. Check your .env file against .env.example.");
}

export const env = parsed.data;
