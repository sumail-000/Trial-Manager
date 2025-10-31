"use client";

import { useMemo } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { AlertCircle, CreditCard } from "lucide-react";

import { PixelButton, PixelCard } from "@/components/ui";
import { cn } from "@/lib/utils";

import { useTrialFilters } from "../hooks/useTrialFilters";
import { useTrialOrdering, useTrialSummary, useTrials } from "../hooks/useTrials";
import type { TrialRecord } from "../types";

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

const LoadingSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="pixel-card pixel-border animate-pulse bg-background-muted/40 p-6"
      >
        <div className="h-5 w-32 bg-foreground-soft/20" />
        <div className="mt-4 h-8 w-48 bg-foreground-soft/10" />
        <div className="mt-6 h-3 w-full bg-foreground-soft/10" />
      </div>
    ))}
  </div>
);

const TrialBadge = ({ trial }: { trial: TrialRecord }) => (
  <span
    className={cn(
      "border-2 border-outline-soft/50 px-3 py-1 text-[0.55rem] font-bold uppercase tracking-[0.35em]",
      STATUS_STYLES[trial.status],
    )}
  >
    {trial.status}
  </span>
);

const TrialCard = ({ trial }: { trial: TrialRecord }) => {
  const expiresIn = formatDistanceToNowStrict(new Date(trial.expiresAt), {
    addSuffix: true,
  });

  const now = new Date();
  const progressPercent = Math.max(
    0,
    Math.min(
      100,
      ((new Date(trial.expiresAt).getTime() - now.getTime()) /
        (new Date(trial.expiresAt).getTime() -
          new Date(trial.startedAt).getTime())) *
        100,
    ),
  );

  return (
    <PixelCard className="relative flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">
            {CATEGORY_ICONS[trial.category] || CATEGORY_ICONS.other}
          </span>
          <div>
            <h3 className="font-mono text-lg font-bold uppercase tracking-tight text-foreground">
              {trial.serviceName}
            </h3>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              {trial.email}
            </p>
          </div>
        </div>
        <TrialBadge trial={trial} />
      </div>

      <div className="pixel-divider" />

      <div className="font-mono text-xs">
        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
          Card
        </p>
        <div className="mt-1 flex items-center gap-2">
          <CreditCard className="h-3 w-3" />
          <span className="font-bold">•••• {trial.cardLast4}</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[0.55rem] uppercase tracking-[0.4em] text-foreground-soft">
          <span>Expires</span>
          <span className={STATUS_STYLES[trial.status]}>{expiresIn}</span>
        </div>
        <div className="mt-2 h-3 border-2 border-outline-soft bg-background-muted/80">
          <div
            className={cn(
              "h-full",
              trial.status === "expiring" && "bg-accent-warning",
              trial.status === "active" && "bg-accent-positive",
              trial.status === "expired" && "bg-accent-danger",
              trial.status === "cancelled" && "bg-foreground-soft",
            )}
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      {trial.notes && (
        <p className="border-l-2 border-accent-secondary pl-3 font-mono text-xs italic text-foreground-soft">
          {trial.notes}
        </p>
      )}

      <PixelButton
        size="sm"
        variant="primary"
        href={`/trials/${trial.id}`}
        className="w-full"
      >
        View Details
      </PixelButton>
    </PixelCard>
  );
};

export const DashboardView = () => {
  const { data: trials, isLoading, error } = useTrials();
  const { query, status, category } = useTrialFilters();
  const summary = useTrialSummary(trials);
  const orderedTrials = useTrialOrdering(trials);

  const filteredTrials = useMemo(() => {
    if (!orderedTrials) {
      return [];
    }

    return orderedTrials.filter((trial) => {
      const matchesQuery =
        !query ||
        trial.serviceName.toLowerCase().includes(query.toLowerCase()) ||
        trial.email.toLowerCase().includes(query.toLowerCase()) ||
        trial.category.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = status === "all" || trial.status === status;
      const matchesCategory = !category || trial.category === category;

      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [orderedTrials, query, status, category]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <PixelCard className="max-w-md p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-accent-danger" />
          <h2 className="mb-2 font-mono text-xl font-bold uppercase text-accent-danger">
            Error Loading Trials
          </h2>
          <p className="font-mono text-sm text-foreground-soft">
            {error instanceof Error ? error.message : "An unexpected error occurred"}
          </p>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Summary Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <PixelCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
                Active Trials
              </p>
              <p className="mt-2 font-mono text-4xl font-black text-foreground">
                {summary.active}
              </p>
            </div>
            <div className="h-16 w-16 bg-accent-positive/20 flex items-center justify-center">
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
              <span className="text-3xl">⚠</span>
            </div>
          </div>
        </PixelCard>

        <PixelCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
                Expired
              </p>
              <p className="mt-2 font-mono text-4xl font-black text-accent-danger">
                {summary.expired}
              </p>
            </div>
            <div className="h-16 w-16 bg-accent-danger/20 flex items-center justify-center">
              <span className="text-3xl">✕</span>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* Trials Grid */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-mono text-2xl font-black uppercase tracking-tight text-foreground">
            Your Trials ({filteredTrials.length})
          </h2>
          <PixelButton size="sm" variant="secondary" href="/admin">
            Add Trial
          </PixelButton>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredTrials.length === 0 ? (
          <PixelCard className="p-12 text-center">
            <p className="font-mono text-lg text-foreground-soft">
              {query || status !== "all" || category
                ? "No trials match your filters"
                : "No trials yet. Add one to get started!"}
            </p>
          </PixelCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTrials.map((trial) => (
              <TrialCard key={trial.id} trial={trial} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
