export type TimerPhase = "idle" | "work" | "break" | "finished";

export interface TimerState {
  phase: TimerPhase;
  remainingSeconds: number;
  isRunning: boolean;
  workMinutesPlanned: number;
  breakMinutesPlanned: number;
  workSecondsElapsed: number;
}

export type TimerAction =
  | { type: "start"; workMinutes: number; breakMinutes: number }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "tick" }
  | { type: "stop" }
  | { type: "reset" };

export const initialTimerState: TimerState = {
  phase: "idle",
  remainingSeconds: 0,
  isRunning: false,
  workMinutesPlanned: 0,
  breakMinutesPlanned: 0,
  workSecondsElapsed: 0,
};

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
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
      return initialTimerState;
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
