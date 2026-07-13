import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RegisterForm } from "@/features/auth/components/register-form";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Create your account",
};

export default function RegisterPage() {
  const googleEnabled = Boolean(env.AUTH_GOOGLE_ID);

  return (
    <Card className="glass shadow-elevated border-transparent">
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Set up your subjects, deadlines, and study goals in a couple of minutes.
        </CardDescription>
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
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
