"use client";

import { formatDistanceToNowStrict, format } from "date-fns";
import { AlertCircle, Calendar, CreditCard, DollarSign, ExternalLink, Mail, Tag } from "lucide-react";

import { PixelButton, PixelCard, TimerDisplay } from "@/components/ui";
import { useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";

import { useTrial } from "../hooks/useTrials";

const STATUS_STYLES: Record<string, string> = {
  active: "text-accent-positive",
  expiring: "text-accent-warning",
  expired: "text-accent-danger",
  cancelled: "text-foreground-soft",
};

const CATEGORY_ICONS: Record<string, string> = {
  streaming: "🎬",
  cloud: "☁️",
  productivity: "📊",
  security: "🔒",
  entertainment: "🎮",
  other: "📦",
};

export const TrialDetailView = ({ trialId }: { trialId: string }) => {
  const { data: trial, isLoading, error } = useTrial(trialId);
  const countdown = useCountdown(trial?.expiresAt ? new Date(trial.expiresAt) : new Date());

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <PixelCard className="pixel-border animate-pulse p-12">
          <div className="h-8 w-48 bg-foreground-soft/20" />
          <div className="mt-6 h-4 w-64 bg-foreground-soft/10" />
        </PixelCard>
      </div>
    );
  }

  if (error || !trial) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <PixelCard className="max-w-md p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-accent-danger" />
          <h2 className="mb-2 font-mono text-xl font-bold uppercase text-accent-danger">
            Trial Not Found
          </h2>
          <p className="mb-6 font-mono text-sm text-foreground-soft">
            The trial you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <PixelButton href="/dashboard" variant="primary">
            Back to Dashboard
          </PixelButton>
        </PixelCard>
      </div>
    );
  }

  const expiresIn = formatDistanceToNowStrict(new Date(trial.expiresAt), {
    addSuffix: true,
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-5xl">
            {CATEGORY_ICONS[trial.category] || CATEGORY_ICONS.other}
          </span>
          <div>
            <h1 className="font-mono text-3xl font-black uppercase tracking-tight text-foreground">
              {trial.serviceName}
            </h1>
            <p className="mt-1 font-mono text-sm uppercase tracking-[0.3em] text-foreground-soft">
              {trial.category}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "border-4 border-outline px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.35em]",
            STATUS_STYLES[trial.status],
          )}
        >
          {trial.status}
        </span>
      </div>

      {/* Countdown Timer */}
      {trial.status !== "expired" && trial.status !== "cancelled" && (
        <TimerDisplay
          label="Time Until Charge"
          milliseconds={countdown.remainingMs}
          status={
            countdown.remainingMs < 1000 * 60 * 60 * 24
              ? "danger"
              : countdown.remainingMs < 1000 * 60 * 60 * 24 * trial.notifyDaysBefore
                ? "warning"
                : "safe"
          }
          progress={
            Math.max(
              0,
              countdown.remainingMs /
                (new Date(trial.expiresAt).getTime() - new Date(trial.startedAt).getTime()),
            )
          }
        />
      )}

      {/* Main Info Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PixelCard className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-mono text-lg font-bold uppercase text-foreground">
            <Mail className="h-5 w-5" />
            Account Info
          </h2>
          <div className="space-y-4 font-mono">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Email
              </p>
              <p className="mt-1 text-sm font-bold">{trial.email}</p>
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Card
              </p>
              <div className="mt-1 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <p className="text-sm font-bold">•••• {trial.cardLast4}</p>
              </div>
            </div>
          </div>
        </PixelCard>

        <PixelCard className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-mono text-lg font-bold uppercase text-foreground">
            <DollarSign className="h-5 w-5" />
            Billing
          </h2>
          <div className="space-y-4 font-mono">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Subscription Cost
              </p>
              <p className="mt-1 text-3xl font-black text-accent-primary">
                ${trial.cost.toFixed(2)}/mo
              </p>
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Notify {trial.notifyDaysBefore} days before expiry
              </p>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* Timeline */}
      <PixelCard className="p-6">
        <h2 className="mb-4 flex items-center gap-2 font-mono text-lg font-bold uppercase text-foreground">
          <Calendar className="h-5 w-5" />
          Timeline
        </h2>
        <div className="space-y-4 font-mono">
          <div className="flex items-center justify-between border-l-4 border-accent-positive pl-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Started
              </p>
              <p className="mt-1 text-sm font-bold">
                {format(new Date(trial.startedAt), "MMM dd, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
          <div
            className={cn(
              "flex items-center justify-between border-l-4 pl-4",
              trial.status === "expired" ? "border-accent-danger" : "border-accent-warning",
            )}
          >
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Expires
              </p>
              <p className="mt-1 text-sm font-bold">
                {format(new Date(trial.expiresAt), "MMM dd, yyyy 'at' h:mm a")}
              </p>
              <p className={cn("mt-1 text-xs", STATUS_STYLES[trial.status])}>{expiresIn}</p>
            </div>
          </div>
        </div>
      </PixelCard>

      {/* Notes */}
      {trial.notes && (
        <PixelCard className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-mono text-lg font-bold uppercase text-foreground">
            <Tag className="h-5 w-5" />
            Notes
          </h2>
          <p className="font-mono text-sm leading-relaxed text-foreground-soft">{trial.notes}</p>
        </PixelCard>
      )}

      {/* Alerts */}
      {trial.alerts && trial.alerts.length > 0 && (
        <PixelCard className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-mono text-lg font-bold uppercase text-foreground">
            <AlertCircle className="h-5 w-5" />
            Alerts
          </h2>
          <div className="space-y-3">
            {trial.alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "border-l-4 p-4",
                  alert.severity === "critical" && "border-accent-danger bg-accent-danger/5",
                  alert.severity === "warning" && "border-accent-warning bg-accent-warning/5",
                  alert.severity === "info" && "border-accent-primary bg-accent-primary/5",
                )}
              >
                <h3 className="font-mono text-sm font-bold uppercase">{alert.title}</h3>
                <p className="mt-1 font-mono text-xs text-foreground-soft">{alert.message}</p>
                <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
                  {formatDistanceToNowStrict(new Date(alert.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        </PixelCard>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <PixelButton variant="secondary" href="/dashboard" className="flex-1">
          Back to Dashboard
        </PixelButton>
        {trial.cancelUrl && (
          <PixelButton
            variant="primary"
            href={trial.cancelUrl}
            target="_blank"
            rel="noopener noreferrer"
            rightIcon={<ExternalLink className="h-4 w-4" />}
            className="flex-1"
          >
            Cancel Subscription
          </PixelButton>
        )}
        <PixelButton variant="ghost" href={`/admin?edit=${trial.id}`}>
          Edit
        </PixelButton>
      </div>
    </div>
  );
};
