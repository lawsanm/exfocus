"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAmbientNoise, type NoiseColor } from "@/features/focus/hooks/use-ambient-noise";

const OPTIONS: { value: NoiseColor; label: string }[] = [
  { value: "white", label: "White noise" },
  { value: "brown", label: "Brown noise" },
];

export function AmbientSoundToggle() {
  const { isPlaying, volume, play, stop, setVolume } = useAmbientNoise();

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        {isPlaying ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        Ambient sound
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3">
        <p className="text-sm font-medium">Ambient sound</p>
        <div className="flex gap-2">
          {OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant="secondary"
              size="sm"
              onClick={() => play(option.value)}
            >
              {option.label}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={stop} disabled={!isPlaying}>
            Off
          </Button>
        </div>
        <div className="space-y-1.5">
          <span className="text-muted-foreground text-xs">Volume</span>
          <Slider
            value={[volume * 100]}
            onValueChange={(next) => {
              const first = Array.isArray(next) ? next[0] : next;
              setVolume(first / 100);
            }}
            max={100}
            step={5}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
