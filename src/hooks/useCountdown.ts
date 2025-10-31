"use client";

import { useEffect, useMemo, useState } from "react";
import { intervalToDuration } from "date-fns";

export const useCountdown = (target: string | Date, intervalMs = 1000) => {
  const targetDate = useMemo(() => new Date(target), [target]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  const remainingMs = Math.max(targetDate.getTime() - now.getTime(), 0);
  const duration = intervalToDuration({ start: 0, end: remainingMs });

  const formatted = `${String(duration.hours ?? 0).padStart(2, "0")}:${String(
    duration.minutes ?? 0,
  ).padStart(2, "0")}:${String(duration.seconds ?? 0).padStart(2, "0")}`;

  return {
    remainingMs,
    duration,
    formatted,
  };
};

