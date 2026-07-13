"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBJECT_COLOR_SWATCHES } from "@/lib/constants";

export function ColorSwatchPicker({
  name,
  defaultValue = SUBJECT_COLOR_SWATCHES[0],
}: {
  name: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState<string>(defaultValue);

  return (
    <div className="flex flex-wrap gap-2">
      <input type="hidden" name={name} value={value} />
      {SUBJECT_COLOR_SWATCHES.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Select color ${color}`}
          aria-pressed={value === color}
          onClick={() => setValue(color)}
          className={cn(
            "ring-offset-background flex size-7 items-center justify-center rounded-full ring-offset-2 transition-transform hover:scale-110",
            value === color && "ring-foreground ring-2",
          )}
          style={{ backgroundColor: color }}
        >
          {value === color && <Check className="size-3.5 text-white" aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}
