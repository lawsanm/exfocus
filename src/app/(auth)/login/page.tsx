import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/features/auth/components/login-form";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  const googleEnabled = Boolean(env.AUTH_GOOGLE_ID);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to get back to your study plan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {googleEnabled && (
          <>
            <GoogleAuthButton />
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-muted-foreground text-xs">OR</span>
              <Separator className="flex-1" />
            </div>
          </>
        )}
        <LoginForm />
      </CardContent>
    </Card>
  );
}
