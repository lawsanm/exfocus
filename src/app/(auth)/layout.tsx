import Link from "next/link";
import { CalendarClock, GraduationCap, Sparkles, TimerReset, TrendingUp } from "lucide-react";
import { AuroraBackground } from "@/components/motion/aurora-background";
import { FadeInUp, Stagger, StaggerItem } from "@/components/motion/motion-primitives";

const HIGHLIGHTS = [
  {
    icon: CalendarClock,
    title: "A plan that builds itself",
    body: "Your schedule regenerates from your deadlines, difficulty, and prep — automatically.",
  },
  {
    icon: TimerReset,
    title: "Focus sessions that count",
    body: "Pomodoro, deep focus, and 90-minute blocks — earning XP, coins, and streaks.",
  },
  {
    icon: TrendingUp,
    title: "See your progress",
    body: "Readiness scores, weekly reports, heatmaps, and risk alerts before you fall behind.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />

      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* Brand / value-prop panel — desktop only */}
        <aside className="hidden flex-col justify-between p-12 lg:flex xl:p-16">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <span className="bg-gradient-brand shadow-elevated flex size-9 items-center justify-center rounded-xl text-white">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            exfocus
          </Link>

          <div className="max-w-md">
            <FadeInUp>
              <span className="border-border/60 bg-card/50 text-muted-foreground mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur">
                <Sparkles className="text-primary size-3.5" aria-hidden="true" />
                Smart Study Planner
              </span>
            </FadeInUp>
            <FadeInUp delay={0.05}>
              <h1 className="text-4xl leading-tight font-semibold tracking-tight">
                Study smarter with a plan that{" "}
                <span className="text-gradient-brand">thinks for you</span>.
              </h1>
            </FadeInUp>

            <Stagger className="mt-10 flex flex-col gap-6">
              {HIGHLIGHTS.map((item) => (
                <StaggerItem key={item.title} className="flex items-start gap-3.5">
                  <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <item.icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-muted-foreground text-sm">{item.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <p className="text-muted-foreground text-xs">
            Built for university students. Free to start.
          </p>
        </aside>

        {/* Form panel */}
        <main className="flex items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 flex items-center justify-center gap-2 text-lg font-semibold tracking-tight lg:hidden"
            >
              <span className="bg-gradient-brand flex size-8 items-center justify-center rounded-lg text-white">
                <GraduationCap className="size-5" aria-hidden="true" />
              </span>
              exfocus
            </Link>
            <FadeInUp y={20}>{children}</FadeInUp>
          </div>
        </main>
      </div>
    </div>
  );
}
