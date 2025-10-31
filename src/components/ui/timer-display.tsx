"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

const STATUS_TEXT: Record<TimerStatus, string> = {
  safe: "On Track",
  warning: "Expiring Soon",
  danger: "Critical",
};

const STATUS_ACCENTS: Record<TimerStatus, string> = {
  safe: "text-accent-positive",
  warning: "text-accent-warning",
  danger: "text-accent-danger",
};

type TimerStatus = "safe" | "warning" | "danger";

interface TimerDisplayProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "transition" | "children"> {
  milliseconds: number;
  label?: string;
  status?: TimerStatus;
  progress?: number; // 0 - 1
  children?: ReactNode;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const formatDuration = (ms: number) => {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((segment) => segment.toString().padStart(2, "0"))
    .join(":");
};

export const TimerDisplay = ({
  className,
  label = "Time Remaining",
  status = "safe",
  milliseconds,
  progress = 1,
  ...props
}: TimerDisplayProps) => {
  const formatted = useMemo(() => formatDuration(milliseconds), [milliseconds]);
  const accent = STATUS_ACCENTS[status];
  const normalizedProgress = clamp(progress);

  return (
    <motion.div
      className={cn(
        "pixel-card pixel-border scanline-overlay flex w-full flex-col gap-4 px-8 py-7 text-center",
        className,
      )}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      {...props}
    >
      <div className="flex items-center justify-between text-[0.58rem] uppercase tracking-[0.42em] text-foreground-soft">
        <span>{label}</span>
        <span className={accent}>{STATUS_TEXT[status]}</span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={formatted}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className={cn(
            "font-mono text-4xl tracking-[0.32em] drop-shadow-glow sm:text-5xl",
            accent,
          )}
        >
          {formatted}
        </motion.span>
      </AnimatePresence>
      <div className="pixel-divider" />
      <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-outline-soft bg-background-muted/60">
        <motion.span
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            status === "safe" && "bg-accent-positive",
            status === "warning" && "bg-accent-warning",
            status === "danger" && "bg-accent-danger",
            "shadow-pixel-glow",
          )}
          animate={{ width: `${normalizedProgress * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="pixel-noise" />
    </motion.div>
  );
};

