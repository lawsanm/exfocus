import Link from "next/link";
import { BookOpen, Calendar, GraduationCap, ListTodo, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTIONS = [
  { href: "/subjects", label: "Add subject", icon: BookOpen, variant: "outline" },
  { href: "/assignments", label: "Add assignment", icon: ListTodo, variant: "outline" },
  { href: "/exams", label: "Add exam", icon: GraduationCap, variant: "outline" },
  { href: "/focus", label: "Start focus session", icon: Timer, variant: "cta" },
  { href: "/calendar", label: "View calendar", icon: Calendar, variant: "outline" },
] as const;

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((action) => (
        <Button
          key={action.href}
          variant={action.variant}
          size="sm"
          nativeButton={false}
          render={<Link href={action.href} />}
        >
          <action.icon className="size-4" aria-hidden="true" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
