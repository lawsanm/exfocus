"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Counts up from 0 to `value` on mount. Renders the final value instantly
 * when the user prefers reduced motion. */
export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(0);
  const text = useTransform(
    motionValue,
    (latest) => `${prefix}${latest.toFixed(decimals)}${suffix}`,
  );

  useEffect(() => {
    if (reduce) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration, ease: EASE });
    return () => controls.stop();
  }, [value, duration, reduce, motionValue]);

  return <motion.span className={className}>{text}</motion.span>;
}
