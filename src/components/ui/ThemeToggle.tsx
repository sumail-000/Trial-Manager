"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-14 w-14 cursor-pointer focus:outline-none"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {/* 3D Container with perspective */}
      <div
        className="relative h-full w-full transition-transform duration-700 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: theme === "dark"
            ? "rotateY(0deg)"
            : "rotateY(180deg)",
        }}
      >
        {/* Dark Mode Face (Sun Icon) */}
        <div
          className="absolute inset-0 flex items-center justify-center backface-hidden"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div className="relative">
            {/* Pixel border with glow effect */}
            <div
              className={`
                absolute inset-0 rounded-none border-2 border-accent-primary
                transition-all duration-300
                ${isHovered ? "scale-110 shadow-[0_0_20px_rgba(111,220,255,0.6)]" : "shadow-[0_0_10px_rgba(111,220,255,0.3)]"}
              `}
            />
            
            {/* Sun icon for dark mode */}
            <div className="relative flex items-center justify-center p-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className={`
                  transition-all duration-300
                  ${isHovered ? "scale-110 rotate-45" : "rotate-0"}
                `}
              >
                {/* Sun center */}
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  fill="currentColor"
                  className="text-accent-warning"
                />
                {/* Sun rays - pixel style */}
                <rect x="11" y="1" width="2" height="4" fill="currentColor" className="text-accent-warning" />
                <rect x="11" y="19" width="2" height="4" fill="currentColor" className="text-accent-warning" />
                <rect x="1" y="11" width="4" height="2" fill="currentColor" className="text-accent-warning" />
                <rect x="19" y="11" width="4" height="2" fill="currentColor" className="text-accent-warning" />
                <rect x="4" y="4" width="3" height="3" fill="currentColor" className="text-accent-warning" />
                <rect x="17" y="4" width="3" height="3" fill="currentColor" className="text-accent-warning" />
                <rect x="4" y="17" width="3" height="3" fill="currentColor" className="text-accent-warning" />
                <rect x="17" y="17" width="3" height="3" fill="currentColor" className="text-accent-warning" />
              </svg>
            </div>
          </div>
        </div>

        {/* Light Mode Face (Moon Icon) */}
        <div
          className="absolute inset-0 flex items-center justify-center backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="relative">
            {/* Pixel border with glow effect */}
            <div
              className={`
                absolute inset-0 rounded-none border-2 border-accent-primary
                transition-all duration-300
                ${isHovered ? "scale-110 shadow-[0_0_20px_rgba(47,157,247,0.6)]" : "shadow-[0_0_10px_rgba(47,157,247,0.3)]"}
              `}
            />
            
            {/* Moon icon for light mode */}
            <div className="relative flex items-center justify-center p-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className={`
                  transition-all duration-300
                  ${isHovered ? "scale-110 -rotate-12" : "rotate-0"}
                `}
              >
                {/* Crescent moon - pixel style */}
                <path
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  fill="currentColor"
                  className="text-accent-primary"
                />
                {/* Star accents */}
                <rect x="4" y="6" width="2" height="2" fill="currentColor" className="text-accent-secondary" />
                <rect x="6" y="4" width="2" height="2" fill="currentColor" className="text-accent-secondary" />
                <rect x="18" y="16" width="2" height="2" fill="currentColor" className="text-accent-secondary" />
                <rect x="16" y="18" width="2" height="2" fill="currentColor" className="text-accent-secondary" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <div
        className={`
          pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2
          whitespace-nowrap rounded-none border border-outline-soft
          bg-surface px-2 py-1 text-[0.65rem] font-mono uppercase tracking-wider
          text-foreground-muted transition-opacity duration-200
          ${isHovered ? "opacity-100" : "opacity-0"}
        `}
      >
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </div>
    </button>
  );
}

