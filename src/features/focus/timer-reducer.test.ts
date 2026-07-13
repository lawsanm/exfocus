import { describe, expect, it } from "vitest";
import { initialTimerState, timerReducer, type TimerState } from "@/features/focus/timer-reducer";

function running(overrides: Partial<TimerState> = {}): TimerState {
  return {
    phase: "work",
    remainingSeconds: 60,
    isRunning: true,
    workMinutesPlanned: 25,
    breakMinutesPlanned: 5,
    workSecondsElapsed: 10,
    ...overrides,
  };
}

describe("timerReducer", () => {
  it("starts a work phase with the planned work duration", () => {
    const state = timerReducer(initialTimerState, {
      type: "start",
      workMinutes: 25,
      breakMinutes: 5,
    });
    expect(state.phase).toBe("work");
    expect(state.remainingSeconds).toBe(25 * 60);
    expect(state.isRunning).toBe(true);
    expect(state.workSecondsElapsed).toBe(0);
  });

  it("pause stops the clock without changing the phase", () => {
    const state = timerReducer(running(), { type: "pause" });
    expect(state.isRunning).toBe(false);
    expect(state.phase).toBe("work");
  });

  it("resume restarts the clock", () => {
    const state = timerReducer(running({ isRunning: false }), { type: "resume" });
    expect(state.isRunning).toBe(true);
  });

  it("tick decrements the remaining seconds while running", () => {
    const state = timerReducer(running({ remainingSeconds: 60 }), { type: "tick" });
    expect(state.remainingSeconds).toBe(59);
  });

  it("tick is a no-op when paused", () => {
    const paused = running({ isRunning: false });
    expect(timerReducer(paused, { type: "tick" })).toBe(paused);
  });

  it("accumulates elapsed work seconds only during the work phase", () => {
    const work = timerReducer(running({ phase: "work", workSecondsElapsed: 10 }), { type: "tick" });
    expect(work.workSecondsElapsed).toBe(11);

    const brk = timerReducer(running({ phase: "break", workSecondsElapsed: 100 }), {
      type: "tick",
    });
    expect(brk.workSecondsElapsed).toBe(100);
  });

  it("transitions from work to break when the work timer ends", () => {
    const state = timerReducer(
      running({ phase: "work", remainingSeconds: 1, breakMinutesPlanned: 5 }),
      { type: "tick" },
    );
    expect(state.phase).toBe("break");
    expect(state.remainingSeconds).toBe(5 * 60);
  });

  it("finishes directly from work when there is no break", () => {
    const state = timerReducer(
      running({
        phase: "work",
        remainingSeconds: 1,
        breakMinutesPlanned: 0,
        workMinutesPlanned: 90,
      }),
      { type: "tick" },
    );
    expect(state.phase).toBe("finished");
    expect(state.isRunning).toBe(false);
    expect(state.workSecondsElapsed).toBe(90 * 60);
  });

  it("finishes after the break ends", () => {
    const state = timerReducer(running({ phase: "break", remainingSeconds: 1 }), { type: "tick" });
    expect(state.phase).toBe("finished");
    expect(state.isRunning).toBe(false);
  });

  it("stop finishes immediately, preserving elapsed work time for partial credit", () => {
    const state = timerReducer(running({ workSecondsElapsed: 300 }), { type: "stop" });
    expect(state.phase).toBe("finished");
    expect(state.isRunning).toBe(false);
    expect(state.workSecondsElapsed).toBe(300);
  });

  it("reset returns to the initial idle state", () => {
    const state = timerReducer(running({ workSecondsElapsed: 999 }), { type: "reset" });
    expect(state).toEqual(initialTimerState);
  });
});
