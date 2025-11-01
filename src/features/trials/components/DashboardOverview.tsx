"use client";

import { useMemo } from "react";
import { AlertCircle, CreditCard, Clock, DollarSign } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

import { PixelButton, PixelCard, TimerDisplay } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useCountdown } from "@/hooks/useCountdown";

import { useTrials, useTrialSummary, useTrialOrdering } from "../hooks/useTrials";
import type { TrialRecord } from "../types";

const CATEGORY_ICONS: Record<string, string> = {
  streaming: "🎬",
  cloud: "☁️",
  productivity: "📊",
  security: "🔒",
  entertainment: "🎮",
  other: "📦",
};

const STATUS_STYLES: Record<string, string> = {
  active: "text-accent-positive",
  expiring: "text-accent-warning",
  expired: "text-accent-danger",
  cancelled: "text-foreground-soft",
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="pixel-card pixel-border animate-pulse bg-background-muted/40 p-6"
        >
          <div className="h-5 w-32 bg-foreground-soft/20" />
          <div className="mt-4 h-8 w-24 bg-foreground-soft/10" />
        </div>
      ))}
    </div>
  </div>
);

const TrialQuickCard = ({ trial }: { trial: TrialRecord }) => {
  const countdown = useCountdown(new Date(trial.expiresAt));
  const icon = CATEGORY_ICONS[trial.category] || CATEGORY_ICONS.other;
  const statusColor = STATUS_STYLES[trial.status] || STATUS_STYLES.active;

  return (
    <PixelCard className="p-4 hover:shadow-pixel-lg transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{icon}</span>
            <h3 className="font-mono text-sm font-bold uppercase truncate text-foreground">
              {trial.serviceName}
            </h3>
          </div>
          <p className="font-mono text-xs text-foreground-soft mb-2">
            {trial.email}
          </p>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-foreground-soft" />
            <span className="font-mono text-xs text-foreground-soft">
              {formatDistanceToNowStrict(new Date(trial.expiresAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={cn("font-mono text-xs font-bold uppercase", statusColor)}>
            {trial.status}
          </span>
          <span className="font-mono text-sm font-bold text-foreground">
            ${trial.cost.toFixed(2)}
          </span>
        </div>
      </div>
    </PixelCard>
  );
};

export const DashboardOverview = () => {
  const { data: trials, isLoading, error } = useTrials();
  const summary = useTrialSummary(trials);
  const orderedTrials = useTrialOrdering(trials);

  // Get the most urgent trial (first in ordered list)
  const urgentTrial = orderedTrials?.[0];
  const countdown = useCountdown(
    urgentTrial?.expiresAt ? new Date(urgentTrial.expiresAt) : new Date()
  );

  // Get upcoming trials (next 3 most urgent)
  const upcomingTrials = useMemo(() => {
    return orderedTrials?.slice(0, 3) || [];
  }, [orderedTrials]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <PixelCard className="max-w-md p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-accent-danger" />
          <h2 className="mb-2 font-mono text-xl font-bold uppercase text-accent-danger">
            Error Loading Dashboard
          </h2>
          <p className="font-mono text-sm text-foreground-soft">
            {error instanceof Error ? error.message : "An unexpected error occurred"}
          </p>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-12 sm:px-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-3xl font-black uppercase tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 font-mono text-sm text-foreground-soft">
            Overview of your trial subscriptions
          </p>
        </div>
        <PixelButton href="/admin" size="sm">
          Add Trial
        </PixelButton>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <PixelCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
                    Active Trials
                  </p>
                  <p className="mt-2 font-mono text-4xl font-black text-accent-primary">
                    {summary.active}
                  </p>
                </div>
                <div className="h-16 w-16 bg-accent-primary/20 flex items-center justify-center">
                  <span className="text-3xl">✓</span>
                </div>
              </div>
            </PixelCard>

            <PixelCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
                    Expiring Soon
                  </p>
                  <p className="mt-2 font-mono text-4xl font-black text-accent-warning">
                    {summary.expiringSoon}
                  </p>
                </div>
                <div className="h-16 w-16 bg-accent-warning/20 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-accent-warning" />
                </div>
              </div>
            </PixelCard>

            <PixelCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
                    Total Trials
                  </p>
                  <p className="mt-2 font-mono text-4xl font-black text-foreground">
                    {trials?.length || 0}
                  </p>
                </div>
                <div className="h-16 w-16 bg-foreground/10 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-foreground" />
                </div>
              </div>
            </PixelCard>
          </div>

          {/* Most Urgent Trial */}
          {urgentTrial && (
            <div className="space-y-4">
              <h2 className="font-mono text-xl font-black uppercase tracking-tight text-foreground">
                Most Urgent Trial
              </h2>
              <TimerDisplay
                label={`${urgentTrial.serviceName} - Next Charge $${urgentTrial.cost.toFixed(2)}`}
                milliseconds={countdown.remainingMs}
                status={
                  countdown.remainingMs < 86400000
                    ? "danger"
                    : countdown.remainingMs < 259200000
                      ? "warning"
                      : "safe"
                }
                progress={
                  1 -
                  countdown.remainingMs /
                    (new Date(urgentTrial.expiresAt).getTime() -
                      new Date(urgentTrial.startedAt).getTime())
                }
              />
              <div className="flex justify-center">
                <PixelButton href={`/trials/${urgentTrial.id}`} variant="secondary" size="sm">
                  View Details
                </PixelButton>
              </div>
            </div>
          )}

          {/* Upcoming Trials */}
          {upcomingTrials.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-xl font-black uppercase tracking-tight text-foreground">
                  Upcoming Renewals
                </h2>
                <PixelButton href="/trials" variant="ghost" size="sm">
                  View All
                </PixelButton>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {upcomingTrials.map((trial) => (
                  <a key={trial.id} href={`/trials/${trial.id}`}>
                    <TrialQuickCard trial={trial} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!trials || trials.length === 0) && (
            <PixelCard className="p-12 text-center">
              <div className="mx-auto mb-4 h-16 w-16 bg-foreground/10 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-foreground-soft" />
              </div>
              <h3 className="mb-2 font-mono text-lg font-bold uppercase text-foreground">
                No Trials Yet
              </h3>
              <p className="mb-6 font-mono text-sm text-foreground-soft">
                Start tracking your trial subscriptions to never miss a renewal date
              </p>
              <PixelButton href="/admin">
                Add Your First Trial
              </PixelButton>
            </PixelCard>
          )}

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <PixelCard className="p-6">
              <h3 className="mb-3 font-mono text-sm font-bold uppercase text-foreground">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <PixelButton href="/admin" variant="secondary" size="sm" className="w-full">
                  Add New Trial
                </PixelButton>
                <PixelButton href="/trials" variant="ghost" size="sm" className="w-full">
                  View All Trials
                </PixelButton>
              </div>
            </PixelCard>

            <PixelCard className="p-6">
              <h3 className="mb-3 font-mono text-sm font-bold uppercase text-foreground">
                Statistics
              </h3>
              <div className="space-y-2 font-mono text-xs text-foreground-soft">
                <div className="flex justify-between">
                  <span>Total Trials:</span>
                  <span className="font-bold text-foreground">{trials?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-bold text-accent-positive">{summary.active}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expired:</span>
                  <span className="font-bold text-accent-danger">{summary.expired}</span>
                </div>
              </div>
            </PixelCard>
          </div>
        </>
      )}
    </div>
  );
};

