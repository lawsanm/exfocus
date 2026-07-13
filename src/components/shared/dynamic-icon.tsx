import { HelpCircle, type LucideProps, icons } from "lucide-react";

/** Renders a lucide-react icon looked up by its exported name (as stored
 * in Achievement.icon), falling back to a generic icon if the name is
 * unrecognized. */
export function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name as keyof typeof icons] ?? HelpCircle;
  return <Icon {...props} />;
}
