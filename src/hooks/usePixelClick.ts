"use client";

import { useCallback, useRef } from "react";

const CLICK_DURATION = 0.12;

// Type declaration for webkit prefixed AudioContext (Safari support)
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export const usePixelClick = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!audioCtxRef.current) {
      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContextConstructor();
    }

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(320, now);
    oscillator.frequency.exponentialRampToValueAtTime(160, now + CLICK_DURATION);

    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.0001, now + CLICK_DURATION);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + CLICK_DURATION);
  }, []);

  return play;
};

