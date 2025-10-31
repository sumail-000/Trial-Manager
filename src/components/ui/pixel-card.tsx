"use client";

import type { ReactNode } from "react";
import type { HTMLMotionProps } from "framer-motion";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface PixelCardProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "transition" | "children"> {
  glow?: boolean;
  shimmer?: boolean;
  children?: ReactNode;
}

export const PixelCard = ({
  className,
  children,
  glow,
  shimmer,
  ...props
}: PixelCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "pixel-card pixel-border relative overflow-hidden",
        glow && "shadow-pixel-glow",
        shimmer && "pixel-shimmer animate-shimmer",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 pixel-noise" />
      {children}
    </motion.div>
  );
};

