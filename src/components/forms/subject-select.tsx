"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SubjectOption {
  id: string;
  name: string;
  colorHex: string;
}

export function SubjectSelect({
  name,
  subjects,
  defaultValue,
  placeholder = "Select a subject",
  allowNone = false,
  onValueChange,
}: {
  name: string;
  subjects: SubjectOption[];
  defaultValue?: string;
  placeholder?: string;
  allowNone?: boolean;
  onValueChange?: (value: string | null) => void;
}) {
  return (
    <Select
      name={name}
      defaultValue={defaultValue ?? (allowNone ? "none" : undefined)}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowNone && <SelectItem value="none">No subject</SelectItem>}
        {subjects.map((subject) => (
          <SelectItem key={subject.id} value={subject.id}>
            <span
              className="mr-1.5 inline-block size-2 rounded-full"
              style={{ backgroundColor: subject.colorHex }}
            />
            {subject.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
