"use client";

import { useEffect, useState } from "react";

/**
 * RetroBackground Component
 * 90s-style animated background with different themes for light/dark mode
 * Features: Animated grid, scanlines, floating pixels, glowing orbs
 */
export const RetroBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="retro-bg-container">
      {/* Floating pixels */}
      <div className="retro-pixel" />
      <div className="retro-pixel" />
      <div className="retro-pixel" />
      <div className="retro-pixel" />
      <div className="retro-pixel" />
      <div className="retro-pixel" />
      
      {/* Glowing orbs */}
      <div className="retro-orb" />
      <div className="retro-orb" />
      <div className="retro-orb" />
      
      {/* Noise texture overlay */}
      <div className="retro-noise" />
    </div>
  );
};

