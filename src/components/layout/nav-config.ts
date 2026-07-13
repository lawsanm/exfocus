import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  Settings,
  Timer,
  Trophy,
  User,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/calendar", label: "Calendar", icon: Calendar },
    ],
  },
  {
    label: "Academics",
    items: [
      { href: "/subjects", label: "Subjects", icon: BookOpen },
      { href: "/assignments", label: "Assignments", icon: ListTodo },
      { href: "/exams", label: "Exams", icon: GraduationCap },
      { href: "/quizzes", label: "Quizzes", icon: ClipboardList },
      { href: "/projects", label: "Projects", icon: FileText },
    ],
  },
  {
    label: "Study",
    items: [
      { href: "/focus", label: "Focus Mode", icon: Timer },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/gamification", label: "Achievements", icon: Trophy },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/profile", label: "Profile", icon: User },
    ],
  },
];
