"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIFFICULTY_OPTIONS } from "@/lib/constants";

export function DifficultySelect({
  name,
  defaultValue = "MEDIUM",
}: {
  name: string;
  defaultValue?: string;
}) {
  return (
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select difficulty" />
      </SelectTrigger>
      <SelectContent>
        {DIFFICULTY_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
