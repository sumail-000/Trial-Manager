import { PixelStage } from "@/components/scene/PixelStage";
import { PixelButton, PixelCard, TimerDisplay } from "@/components/ui";

const MOCK_TRIAL_DURATION = 1000 * 60 * 60 * 18 + 1000 * 32 * 60;

export default function Home() {
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
                Trial Control Center
              </span>
            </div>
            
            {/* Chunky Pixelated Title */}
            <h1 className="font-mono text-3xl font-black uppercase leading-[1.2] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              <span className="block text-accent-primary">KEEP EVERY</span>
              <span className="block text-foreground">TRIAL UNDER</span>
              <span className="block text-accent-secondary">CONTROL</span>
            </h1>
            
            {/* Description */}
            <p className="max-w-xl border-l-4 border-outline-soft pl-4 font-mono text-sm leading-relaxed text-foreground-soft">
              Monitor countdowns in real-time. Batch update renewal states. Surface proactive alerts. All inside a retro pixel workspace built to keep surprise charges at bay.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <PixelButton size="lg" href="/dashboard">
                Launch Portal
              </PixelButton>
              <PixelButton
                variant="ghost"
                size="lg"
                leftIcon={<span aria-hidden>■</span>}
                href="#features"
              >
                Features
              </PixelButton>
            </div>
          </div>
          
          {/* 3D Voxel Visualization */}
          <div className="relative">
            <div className="border-4 border-outline bg-background-muted p-2 shadow-pixel">
              <PixelStage accentColor="#6fdcff">
                <div className="font-mono text-xs uppercase tracking-wider">Live Voxel Stream</div>
              </PixelStage>
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
            {/* Timer Display */}
            <TimerDisplay
              label="Next Renewal"
              milliseconds={MOCK_TRIAL_DURATION}
              status="warning"
              progress={0.42}
            />
            
            {/* Feature Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              <PixelCard className="p-6 text-left">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-4 w-4 bg-accent-warning" />
                  <h2 className="font-mono text-sm font-bold uppercase text-foreground">
                    Live Alerts
                  </h2>
                </div>
                <p className="font-mono text-xs leading-relaxed text-foreground-soft">
                  Blinking timers, chunky badges, and CRT scanlines make urgent trials pop without overwhelming your retro dashboard.
                </p>
              </PixelCard>
              
              <PixelCard className="p-6 text-left">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-4 w-4 bg-accent-primary" />
                  <h2 className="font-mono text-sm font-bold uppercase text-foreground">
                    Admin Tools
                  </h2>
                </div>
                <ul className="mt-3 space-y-2 font-mono text-xs text-foreground-soft">
                  <li className="flex items-center gap-2">
                    <span className="text-accent-primary">■</span> Bulk extend trial cohorts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent-primary">■</span> Pixel themes per-brand
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent-primary">■</span> Supabase automations
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
                  Retro. Responsive. Reliable.
                </h2>
              </div>
              <p className="font-mono text-xs leading-relaxed text-foreground-soft">
                Chunky pixel borders. Hard-edged shadows. Blocky components. Every element designed with 8-bit aesthetics and modern functionality.
              </p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <PixelButton size="sm" variant="secondary" href="/admin">
                Admin Panel
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
