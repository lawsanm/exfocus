import { getGreeting } from "@/lib/greeting";
import { getQuoteOfTheDay } from "@/lib/quotes";

export function WelcomeHeader({ name }: { name: string | null }) {
  const now = new Date();
  const firstName = name?.trim().split(/\s+/)[0] ?? "there";

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">
        {getGreeting(now)}, {firstName}
      </h1>
      <p className="text-muted-foreground text-sm">
        {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        {" · "}
        {getQuoteOfTheDay(now)}
      </p>
    </div>
  );
}
