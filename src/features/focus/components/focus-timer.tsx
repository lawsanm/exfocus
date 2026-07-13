"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Maximize2, Minimize2, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubjectSelect, type SubjectOption } from "@/components/forms/subject-select";
import { AmbientSoundToggle } from "@/features/focus/components/ambient-sound-toggle";
import { completeFocusSessionAction } from "@/features/focus/actions";
import { FOCUS_MODE_PRESETS, type FocusModeKey } from "@/lib/constants";

type Phase = "idle" | "work" | "break" | "finished";

interface TimerState {
  phase: Phase;
  remainingSeconds: number;
  isRunning: boolean;
  workMinutesPlanned: number;
  breakMinutesPlanned: number;
  workSecondsElapsed: number;
}

type TimerAction =
  | { type: "start"; workMinutes: number; breakMinutes: number }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "tick" }
  | { type: "stop" }
  | { type: "reset" };

const initialState: TimerState = {
  phase: "idle",
  remainingSeconds: 0,
  isRunning: false,
  workMinutesPlanned: 0,
  breakMinutesPlanned: 0,
  workSecondsElapsed: 0,
};

function reducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case "start":
      return {
        phase: "work",
        remainingSeconds: action.workMinutes * 60,
        isRunning: true,
        workMinutesPlanned: action.workMinutes,
        breakMinutesPlanned: action.breakMinutes,
        workSecondsElapsed: 0,
      };
    case "pause":
      return { ...state, isRunning: false };
    case "resume":
      return { ...state, isRunning: true };
    case "stop":
      return { ...state, phase: "finished", isRunning: false };
    case "reset":
      return initialState;
    case "tick": {
      if (!state.isRunning) return state;

      if (state.remainingSeconds <= 1) {
        if (state.phase === "work") {
          const workSecondsElapsed = state.workMinutesPlanned * 60;
          if (state.breakMinutesPlanned > 0) {
            return {
              ...state,
              phase: "break",
              remainingSeconds: state.breakMinutesPlanned * 60,
              workSecondsElapsed,
            };
          }
          return {
            ...state,
            phase: "finished",
            remainingSeconds: 0,
            isRunning: false,
            workSecondsElapsed,
          };
        }
        if (state.phase === "break") {
          return { ...state, phase: "finished", remainingSeconds: 0, isRunning: false };
        }
        return state;
      }

      return {
        ...state,
        remainingSeconds: state.remainingSeconds - 1,
        workSecondsElapsed:
          state.phase === "work" ? state.workSecondsElapsed + 1 : state.workSecondsElapsed,
      };
    }
  }
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function FocusTimer({
  subjects,
  initialStudySessionId,
  initialSubjectId,
}: {
  subjects: SubjectOption[];
  initialStudySessionId?: string;
  initialSubjectId?: string;
}) {
  const router = useRouter();
  const [modeKey, setModeKey] = useState<FocusModeKey>("POMODORO_25_5");
  const [customWorkMinutes, setCustomWorkMinutes] = useState(25);
  const [customBreakMinutes, setCustomBreakMinutes] = useState(5);
  const [subjectId, setSubjectId] = useState(initialSubjectId);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const containerRef = useRef<HTMLDivElement>(null);
  const startedAtRef = useRef<Date | null>(null);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!state.isRunning) return;
    const interval = setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => clearInterval(interval);
  }, [state.isRunning]);

  useEffect(() => {
    if (state.phase !== "finished" || hasSubmittedRef.current || !startedAtRef.current) return;
    hasSubmittedRef.current = true;

    const actualMinutes = Math.round(state.workSecondsElapsed / 60);
    void completeFocusSessionAction({
      mode: modeKey,
      plannedMinutes: state.workMinutesPlanned,
      actualMinutes,
      startedAt: startedAtRef.current,
      subjectId,
      studySessionId: initialStudySessionId,
    }).then(() => router.refresh());
  }, [
    state.phase,
    state.workSecondsElapsed,
    state.workMinutesPlanned,
    modeKey,
    subjectId,
    initialStudySessionId,
    router,
  ]);

  function handleStart() {
    const preset = FOCUS_MODE_PRESETS[modeKey];
    const workMinutes = modeKey === "CUSTOM" ? customWorkMinutes : preset.workMinutes;
    const breakMinutes = modeKey === "CUSTOM" ? customBreakMinutes : preset.breakMinutes;
    startedAtRef.current = new Date();
    hasSubmittedRef.current = false;
    dispatch({ type: "start", workMinutes, breakMinutes });
  }

  function handleReset() {
    dispatch({ type: "reset" });
  }

  async function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  const isIdle = state.phase === "idle" || state.phase === "finished";

  return (
    <div
      ref={containerRef}
      className="bg-background flex flex-col items-center gap-6 rounded-xl p-8 data-[fullscreen=true]:justify-center"
      data-fullscreen={isFullscreen}
    >
      {isIdle && (
        <div className="flex w-full max-w-md flex-col gap-4">
          <Tabs value={modeKey} onValueChange={(v) => setModeKey(v as FocusModeKey)}>
            <TabsList className="grid w-full grid-cols-4">
              {Object.entries(FOCUS_MODE_PRESETS).map(([key, preset]) => (
                <TabsTrigger key={key} value={key}>
                  {preset.label.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {modeKey === "CUSTOM" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Work minutes</Label>
                <Input
                  type="number"
                  min={1}
                  max={180}
                  value={customWorkMinutes}
                  onChange={(e) => setCustomWorkMinutes(Number(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Break minutes</Label>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  value={customBreakMinutes}
                  onChange={(e) => setCustomBreakMinutes(Number(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {subjects.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">Subject (optional)</Label>
              <SubjectSelect
                name="focus-subject"
                subjects={subjects}
                defaultValue={subjectId}
                allowNone
                placeholder="No subject"
                onValueChange={(value) =>
                  setSubjectId(!value || value === "none" ? undefined : value)
                }
              />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-7xl font-semibold tabular-nums">
          {isIdle
            ? formatTime(
                (modeKey === "CUSTOM"
                  ? customWorkMinutes
                  : FOCUS_MODE_PRESETS[modeKey].workMinutes) * 60,
              )
            : formatTime(state.remainingSeconds)}
        </span>
        <span className="text-muted-foreground text-sm">
          {state.phase === "work" && "Focus"}
          {state.phase === "break" && "Break"}
          {isIdle && FOCUS_MODE_PRESETS[modeKey].label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isIdle && (
          <Button onClick={handleStart} size="lg">
            <Play className="size-4" />
            Start
          </Button>
        )}
        {!isIdle && state.isRunning && (
          <Button onClick={() => dispatch({ type: "pause" })} size="lg" variant="outline">
            <Pause className="size-4" />
            Pause
          </Button>
        )}
        {!isIdle && !state.isRunning && (
          <Button onClick={() => dispatch({ type: "resume" })} size="lg">
            <Play className="size-4" />
            Resume
          </Button>
        )}
        {!isIdle && (
          <Button onClick={() => dispatch({ type: "stop" })} size="lg" variant="destructive">
            <Square className="size-4" />
            Stop
          </Button>
        )}
        {isIdle && state.phase === "finished" && (
          <Button onClick={handleReset} size="lg" variant="ghost">
            New session
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <AmbientSoundToggle />
        <Button variant="outline" size="sm" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        </Button>
      </div>

      {state.phase === "finished" && (
        <Card className="w-full max-w-md">
          <CardContent className="py-4 text-center">
            <p className="text-muted-foreground text-sm">
              Logged {Math.round(state.workSecondsElapsed / 60)} minutes of focused work. Nicely
              done.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
