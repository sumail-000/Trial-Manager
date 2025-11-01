import { PixelButton, PixelCard } from "@/components/ui";
import Link from "next/link";

const features = [
  {
    icon: "⏰",
    title: "Real-Time Countdown Timers",
    description:
      "See exactly how much time is left on each trial with live countdown timers. Know at a glance which trials are expiring soon and which ones you have time to evaluate.",
    color: "accent-primary",
  },
  {
    icon: "🔔",
    title: "Smart Notifications",
    description:
      "Set custom notification periods (3, 7, or any number of days) before your trial ends. Get reminded in time to cancel or decide if you want to continue with the service.",
    color: "accent-warning",
  },
  {
    icon: "📊",
    title: "Visual Dashboard",
    description:
      "See all your trials at a glance with a beautiful, organized dashboard. Quickly identify active, expiring, and expired trials with color-coded status badges.",
    color: "accent-positive",
  },
  {
    icon: "💳",
    title: "Card Tracking",
    description:
      "Keep track of which credit card you used for each trial. Never lose track of where your money is going or which card to monitor for charges.",
    color: "accent-secondary",
  },
  {
    icon: "📝",
    title: "Custom Notes",
    description:
      "Add notes to each trial to remember important details like login credentials, cancellation URLs, or why you signed up in the first place.",
    color: "accent-primary",
  },
  {
    icon: "🏷️",
    title: "Service Categories",
    description:
      "Organize your trials by category: Streaming, Cloud, Productivity, Security, Entertainment, and more. Find what you're looking for instantly.",
    color: "accent-warning",
  },
  {
    icon: "📅",
    title: "Trial History",
    description:
      "Track when you started each trial and when it expires. Keep a complete history of all your subscriptions and trials in one place.",
    color: "accent-positive",
  },
  {
    icon: "🎨",
    title: "Dark & Light Themes",
    description:
      "Switch between pixel-perfect dark and light themes with smooth animations. Use the theme that's comfortable for your eyes, day or night.",
    color: "accent-secondary",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    description:
      "Your data is stored securely with Supabase authentication. Your trial information stays private and is only accessible by you.",
    color: "accent-primary",
  },
  {
    icon: "⚡",
    title: "Admin Panel",
    description:
      "Powerful admin tools to quickly add, edit, or delete trials. Bulk manage your subscriptions with an intuitive interface designed for efficiency.",
    color: "accent-warning",
  },
  {
    icon: "📱",
    title: "Responsive Design",
    description:
      "Access your trial dashboard from any device. Whether you're on desktop, tablet, or mobile, your trials are always at your fingertips.",
    color: "accent-positive",
  },
  {
    icon: "💰",
    title: "Cost Tracking",
    description:
      "Track the cost of each trial and see how much you'd be paying if you forgot to cancel. Calculate your potential savings over time.",
    color: "accent-secondary",
  },
];

export default function FeaturesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 pb-24 pt-16 sm:px-10">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground-soft transition-colors hover:text-accent-primary"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            Back to Home
          </Link>

          <div className="flex flex-col gap-4">
            <div className="inline-flex w-fit items-center gap-3 border-4 border-accent-primary bg-background px-4 py-2">
              <span className="h-3 w-3 animate-pulse bg-accent-primary" />
              <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-accent-primary">
                Everything You Need
              </span>
            </div>

            <h1 className="font-mono text-3xl font-black uppercase leading-[1.2] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              <span className="block text-accent-primary">POWERFUL FEATURES</span>
              <span className="block text-foreground">FOR TRIAL</span>
              <span className="block text-accent-secondary">MANAGEMENT</span>
            </h1>

            <p className="max-w-2xl border-l-4 border-outline-soft pl-4 font-mono text-sm leading-relaxed text-foreground-soft">
              Trial Manager is packed with features to help you track, manage,
              and never forget about your free trials. Save money by canceling
              before you're charged.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <PixelCard key={index} className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-3">
                <div className={`text-3xl`}>{feature.icon}</div>
                <h3 className="font-mono text-sm font-bold uppercase leading-tight text-foreground">
                  {feature.title}
                </h3>
              </div>
              <p className="font-mono text-xs leading-relaxed text-foreground-soft">
                {feature.description}
              </p>
            </PixelCard>
          ))}
        </div>

        {/* CTA Section */}
        <PixelCard className="mt-8 flex flex-col items-center gap-6 p-8 text-center">
          <div className="flex flex-col gap-4">
            <h2 className="font-mono text-2xl font-black uppercase tracking-tight text-foreground">
              Ready to Take Control?
            </h2>
            <p className="max-w-xl font-mono text-sm leading-relaxed text-foreground-soft">
              Start managing your trials today. No credit card required. Set up
              your first trial in under 30 seconds.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <PixelButton size="lg" href="/dashboard">
              Get Started
            </PixelButton>
            <PixelButton variant="ghost" size="lg" href="/admin">
              View Admin Panel
            </PixelButton>
          </div>
        </PixelCard>
      </main>

      <div className="pointer-events-none absolute inset-0 bg-pixel-radial opacity-70" />
    </div>
  );
}

