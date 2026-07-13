import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** True only once mounted on the client, without setState-in-effect. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
