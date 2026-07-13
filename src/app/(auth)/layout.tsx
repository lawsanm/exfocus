import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/40 flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
          <GraduationCap className="size-5" aria-hidden="true" />
        </span>
        exfocus
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
