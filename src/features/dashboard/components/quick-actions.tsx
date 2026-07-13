import Link from "next/link";
import { BookOpen, Calendar, GraduationCap, ListTodo, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTIONS = [
  { href: "/subjects", label: "Add subject", icon: BookOpen },
  { href: "/assignments", label: "Add assignment", icon: ListTodo },
  { href: "/exams", label: "Add exam", icon: GraduationCap },
  { href: "/focus", label: "Start focus session", icon: Timer },
  { href: "/calendar", label: "View calendar", icon: Calendar },
] as const;

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((action) => (
        <Button key={action.href} variant="outline" size="sm" render={<Link href={action.href} />}>
          <action.icon className="size-4" aria-hidden="true" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
