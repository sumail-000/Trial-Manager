"use client";

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";

import { usePixelClick } from "@/hooks/usePixelClick";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex select-none items-center justify-center font-mono uppercase tracking-[0.15em] border-4 transition-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-primary border-accent-primary text-background shadow-pixel hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]",
        secondary:
          "bg-surface-bright border-outline-soft text-foreground shadow-pixel hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_rgba(0,0,0,0.5)] hover:border-outline active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]",
        ghost:
          "border-outline-soft bg-transparent text-accent-primary shadow-pixel-soft hover:border-outline hover:shadow-pixel active:shadow-pixel-inset",
      },
      size: {
        sm: "h-10 px-6 text-[0.65rem] min-w-[100px]",
        md: "h-12 px-8 text-[0.7rem] min-w-[120px]",
        lg: "h-16 px-10 text-[0.8rem] min-w-[160px]",
        icon: "h-12 w-12 px-0 text-[0.7rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonSpecificProps = Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | "type"
  | "disabled"
  | "form"
  | "formAction"
  | "formEncType"
  | "formMethod"
  | "formTarget"
  | "name"
  | "value"
> & {
  href?: undefined;
};

type AnchorSpecificProps = Pick<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "target" | "rel" | "download" | "hrefLang"
> & {
  href: string;
};

type PixelButtonBaseProps = VariantProps<typeof buttonVariants> & {
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
  className?: string;
  onPointerDown?: (
    event: React.PointerEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => void;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

type PixelButtonProps = PixelButtonBaseProps &
  (ButtonSpecificProps | AnchorSpecificProps);

export const PixelButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  PixelButtonProps
>(
  (
    {
      className,
      children,
      variant,
      size,
      isLoading,
      leftIcon,
      rightIcon,
      onPointerDown,
      ...rest
    },
    forwardedRef,
  ) => {
    const triggerClickTone = usePixelClick();
    const isLink = "href" in rest && typeof rest.href === "string";
    if (isLink) {
      const anchorProps = rest as AnchorSpecificProps;
      const handlePointerDown = (
        event: React.PointerEvent<HTMLAnchorElement>,
      ) => {
        triggerClickTone();
        onPointerDown?.(event as never);
      };

      return (
        <motion.a
          ref={forwardedRef as React.Ref<HTMLAnchorElement>}
          className={cn(buttonVariants({ variant, size }), className)}
          onPointerDown={handlePointerDown}
          {...anchorProps}
        >
          <span className="relative z-10 flex items-center gap-3">
            {leftIcon ? (
              <span className="text-lg">
                {leftIcon}
              </span>
            ) : null}
            <span className="font-bold tracking-wider">
              {children}
            </span>
            {rightIcon ? (
              <span className="text-lg">
                {rightIcon}
              </span>
            ) : null}
          </span>
          <AnimatePresence>
            {isLoading ? (
              <motion.span
                className="absolute inset-y-1 right-3 flex items-center"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
              >
                <span className="h-3.5 w-3.5 animate-pulse-soft rounded-full bg-accent-primary/80 shadow-pixel-glow" />
              </motion.span>
            ) : null}
          </AnimatePresence>
          <span className="pointer-events-none absolute inset-0 pixel-noise" />
        </motion.a>
      );
    }

    const buttonProps = rest as ButtonSpecificProps;
    const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
      triggerClickTone();
      onPointerDown?.(event as never);
    };

    return (
      <motion.button
        ref={forwardedRef as React.Ref<HTMLButtonElement>}
        className={cn(buttonVariants({ variant, size }), className)}
        type={buttonProps.type ?? "button"}
        onPointerDown={handlePointerDown}
        {...buttonProps}
      >
        <span className="relative z-10 flex items-center gap-3">
          {leftIcon ? (
            <span className="text-lg">
              {leftIcon}
            </span>
          ) : null}
          <span className="font-bold tracking-wider">
            {children}
          </span>
          {rightIcon ? (
            <span className="text-lg">
              {rightIcon}
            </span>
          ) : null}
        </span>
        <AnimatePresence>
          {isLoading ? (
            <motion.span
              className="absolute inset-y-1 right-3 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <span className="h-4 w-4 animate-blink bg-accent-primary" />
            </motion.span>
          ) : null}
        </AnimatePresence>
        <span className="pointer-events-none absolute inset-0 pixel-noise opacity-30" />
      </motion.button>
    );
  },
);

PixelButton.displayName = "PixelButton";

