"use client";

import { useMemo } from "react";
import Spline from '@splinetool/react-spline';
import { PixelButton, PixelCard, TimerDisplay } from "@/components/ui";
import { useCountdown } from "@/hooks/useCountdown";

export default function Home() {
  // Calculate a demo trial that expires in ~7 days from now
  const demoExpiryDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    date.setHours(date.getHours() + 3);
    date.setMinutes(date.getMinutes() + 42);
    return date;
  }, []);

  const countdown = useCountdown(demoExpiryDate);
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Pixelated grid background */}
      <div className="pointer-events-none absolute inset-0 pixel-grid opacity-20" />
      
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-6 pb-24 pt-16 sm:px-10">
        {/* Hero Section */}
        <section className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="flex flex-col gap-8">
            {/* Retro Badge */}
            <div className="inline-flex items-center gap-3 border-4 border-accent-secondary bg-background px-4 py-2 w-fit">
              <span className="h-3 w-3 animate-blink bg-accent-secondary" />
              <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent-secondary">
                Never Miss a Trial Deadline
              </span>
            </div>
            
            {/* Chunky Pixelated Title */}
            <h1 className="font-mono text-3xl font-black uppercase leading-[1.2] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              <span className="block text-accent-primary">MANAGE ALL YOUR</span>
              <span className="block text-foreground">FREE TRIALS IN</span>
              <span className="block text-accent-secondary">ONE PLACE</span>
            </h1>
            
            {/* Description */}
            <p className="max-w-xl border-l-4 border-outline-soft pl-4 font-mono text-sm leading-relaxed text-foreground-soft">
              Track all your subscription trials with real-time countdown timers. Get notified before renewals. Cancel before you're charged. Never forget a trial again with our pixel-perfect dashboard.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <PixelButton size="lg" href="/signup">
                Get Started Free
              </PixelButton>
              <PixelButton
                variant="ghost"
                size="lg"
                leftIcon={<span aria-hidden>■</span>}
                href="/features"
              >
                View Features
              </PixelButton>
            </div>
            <p className="font-mono text-[0.65rem] text-foreground-soft">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-accent-primary transition-colors hover:text-accent-secondary"
              >
                Sign In
              </a>
            </p>
          </div>
          
          {/* 3D Spline Visualization */}
          <div className="relative h-[400px] md:h-[500px]">
            <div className="border-4 border-outline bg-background-muted shadow-pixel h-full">
              <Spline scene="https://prod.spline.design/kJdBDkdP4KIcek29/scene.splinecode" />
              {/* Scanline effect */}
              <div className="pointer-events-none absolute inset-0 scanline-overlay" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="flex flex-col gap-6">
            {/* Timer Display - Live Demo */}
            <TimerDisplay
              label="Next Renewal (Live Demo)"
              milliseconds={countdown.remainingMs}
              status="warning"
              progress={0.72}
            />
            
            {/* Feature Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              <PixelCard className="p-6 text-left">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-4 w-4 bg-accent-warning" />
                  <h2 className="font-mono text-sm font-bold uppercase text-foreground">
                    Smart Reminders
                  </h2>
                </div>
                <p className="font-mono text-xs leading-relaxed text-foreground-soft">
                  Get notified 3, 7, or custom days before your trial ends. Set it once and never worry about surprise charges again.
                </p>
              </PixelCard>
              
              <PixelCard className="p-6 text-left">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-4 w-4 bg-accent-primary" />
                  <h2 className="font-mono text-sm font-bold uppercase text-foreground">
                    Trial Dashboard
                  </h2>
                </div>
                <ul className="mt-3 space-y-2 font-mono text-xs text-foreground-soft">
                  <li className="flex items-center gap-2">
                    <span className="text-accent-primary">■</span> Live countdown timers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent-primary">■</span> Organize by service
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent-primary">■</span> Track card details
                  </li>
                </ul>
              </PixelCard>
            </div>
          </div>
          
          {/* Info Card */}
          <PixelCard className="flex h-full flex-col justify-between p-6 text-left">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b-2 border-outline-soft pb-3">
                <span className="h-4 w-4 bg-accent-secondary" />
                <h2 className="font-mono text-xl font-black uppercase text-foreground">
                  Stop Wasting Money
                </h2>
              </div>
              <p className="font-mono text-xs leading-relaxed text-foreground-soft">
                Most people forget to cancel free trials and end up paying for services they don't use. Trial Manager helps you stay on top of every trial with visual countdowns and proactive alerts.
              </p>
              <ul className="mt-2 space-y-2 font-mono text-xs text-foreground-soft">
                <li className="flex items-center gap-2">
                  <span className="text-accent-positive">✓</span> Track unlimited trials
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent-positive">✓</span> Never miss a deadline
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent-positive">✓</span> Save hundreds yearly
                </li>
              </ul>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <PixelButton size="sm" variant="secondary" href="/features">
                All Features
              </PixelButton>
              <PixelButton size="sm" variant="ghost" href="/trials">
                View Trials
              </PixelButton>
            </div>
          </PixelCard>
        </section>
      </main>
      <div className="pointer-events-none absolute inset-0 bg-pixel-radial opacity-70" />
    </div>
  );
}
