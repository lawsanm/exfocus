"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction, type AuthActionState } from "@/features/auth/actions";
import { SubmitButton } from "@/features/auth/components/submit-button";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && (
        <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" type="text" autoComplete="name" required />
        {state.fieldErrors?.name && (
          <p className="text-destructive text-sm">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state.fieldErrors?.email && (
          <p className="text-destructive text-sm">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
        {state.fieldErrors?.password && (
          <p className="text-destructive text-sm">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        {state.fieldErrors?.confirmPassword && (
          <p className="text-destructive text-sm">{state.fieldErrors.confirmPassword[0]}</p>
        )}
      </div>

      <SubmitButton>Create account</SubmitButton>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
