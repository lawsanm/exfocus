"use server";

import { headers } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/infrastructure/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { authRateLimiter } from "@/lib/rate-limit";
import { loginSchema, registerSchema } from "@/features/auth/schemas";

export interface AuthActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

async function requestKey(email: string) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `${ip}:${email}`;
}

const DEFAULT_DAILY_HOURS = 2;

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  if (!authRateLimiter.consume(await requestKey(email))) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: ["An account with this email already exists."] } };
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      notificationPreference: { create: {} },
      availableHours: {
        create: Array.from({ length: 7 }, (_, dayOfWeek) => ({
          dayOfWeek,
          hours: DEFAULT_DAILY_HOURS,
        })),
      },
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { error: "Account created, but automatic sign-in failed. Please sign in manually." };
    }
    throw error;
  }

  return {};
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  if (!authRateLimiter.consume(await requestKey(email))) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  return {};
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function signInWithGoogleAction() {
  await signIn("google", { redirectTo: "/dashboard" });
}
