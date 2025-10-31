"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

import { PixelButton, PixelCard, useToast } from "@/components/ui";
import { useTrialOrdering, useTrialSummary, useTrials } from "@/features/trials/hooks/useTrials";
import type { TrialMutationInput } from "@/features/trials/types";
import { cn } from "@/lib/utils";

import { useTrialMutations } from "../hooks/useTrialMutations";

const defaultFormState: TrialMutationInput = {
  serviceName: "",
  email: "",
  cardLast4: "",
  startedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancelUrl: "",
  notifyDaysBefore: 3,
  category: "other",
  cost: 0,
  notes: "",
};

const statusBadge = (status: string) =>
  cn(
    "border-2 border-outline-soft px-3 py-1 text-[0.55rem] font-bold uppercase tracking-[0.35em]",
    status === "expiring" && "text-accent-warning",
    status === "expired" && "text-accent-danger",
    status === "active" && "text-accent-positive",
    status === "cancelled" && "text-foreground-soft",
  );

export const AdminPanel = () => {
  const { data: trials = [], isLoading } = useTrials();
  const summary = useTrialSummary(trials);
  const orderedTrials = useTrialOrdering(trials);
  const mutations = useTrialMutations();
  const toast = useToast();

  const [formState, setFormState] = useState<TrialMutationInput>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    field: keyof TrialMutationInput,
    value: string | number,
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: TrialMutationInput = {
        ...formState,
        expiresAt: new Date(formState.expiresAt).toISOString(),
        startedAt: new Date(formState.startedAt).toISOString(),
        cost: Number(formState.cost) || 0,
        notifyDaysBefore: Number(formState.notifyDaysBefore) || 3,
      };

      await mutations.createTrial.mutateAsync(payload);
      setFormState(defaultFormState);
      toast.success(`Trial for ${payload.serviceName} created successfully!`);
    } catch (error: any) {
      console.error("Error creating trial:", error);
      toast.error(error?.message || "Failed to create trial. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (trialId: string, serviceName: string) => {
    try {
      await mutations.deleteTrial.mutateAsync(trialId);
      toast.success(`Trial for ${serviceName} deleted successfully`);
    } catch (error: any) {
      console.error("Error deleting trial:", error);
      toast.error(error?.message || "Failed to delete trial. Please try again.");
    }
  };

  const tableRows = useMemo(
    () =>
      orderedTrials.map((trial) => (
        <tr key={trial.id} className="border-b border-outline-soft/30">
          <td className="px-4 py-3 text-left font-mono text-sm font-bold text-foreground">
            {trial.serviceName}
          </td>
          <td className="px-4 py-3 text-left font-mono text-xs text-foreground-soft">
            {trial.email}
          </td>
          <td className="px-4 py-3 text-left font-mono text-xs text-foreground-soft">
            {trial.category}
          </td>
          <td className="px-4 py-3 text-left font-mono text-xs text-foreground-soft">
            {format(new Date(trial.expiresAt), "MMM dd, yyyy")}
          </td>
          <td className="px-4 py-3 text-right">
            <span className={statusBadge(trial.status)}>{trial.status}</span>
          </td>
          <td className="px-4 py-3 text-right">
            <button
              className="font-mono text-[0.55rem] uppercase tracking-[0.5em] text-accent-danger transition-colors hover:text-accent-danger/80 disabled:opacity-50"
              onClick={() => handleDelete(trial.id, trial.serviceName)}
              disabled={mutations.deleteTrial.isPending}
            >
              {mutations.deleteTrial.isPending ? "Deleting..." : "Delete"}
            </button>
          </td>
        </tr>
      )),
    [orderedTrials, mutations.deleteTrial.isPending],
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <PixelCard className="p-6">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
            Total Trials
          </p>
          <p className="mt-2 font-mono text-4xl font-black text-foreground">
            {trials.length}
          </p>
        </PixelCard>
        <PixelCard className="p-6">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
            Active
          </p>
          <p className="mt-2 font-mono text-4xl font-black text-accent-positive">
            {summary.active}
          </p>
        </PixelCard>
        <PixelCard className="p-6">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
            Expiring Soon
          </p>
          <p className="mt-2 font-mono text-4xl font-black text-accent-warning">
            {summary.expiringSoon}
          </p>
        </PixelCard>
      </div>

      {/* Add New Trial Form */}
      <PixelCard className="p-8">
        <h2 className="mb-6 font-mono text-2xl font-black uppercase tracking-tight text-foreground">
          Add New Trial
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Service Name *
              </label>
              <input
                type="text"
                required
                className="pixel-input w-full"
                value={formState.serviceName}
                onChange={(e) => handleChange("serviceName", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Email *
              </label>
              <input
                type="email"
                required
                className="pixel-input w-full"
                value={formState.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Card Last 4 Digits *
              </label>
              <input
                type="text"
                required
                maxLength={4}
                className="pixel-input w-full"
                value={formState.cardLast4}
                onChange={(e) => handleChange("cardLast4", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Category *
              </label>
              <select
                required
                className="pixel-input w-full"
                value={formState.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <option value="streaming">Streaming</option>
                <option value="cloud">Cloud</option>
                <option value="productivity">Productivity</option>
                <option value="security">Security</option>
                <option value="entertainment">Entertainment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Started At *
              </label>
              <input
                type="date"
                required
                className="pixel-input w-full"
                value={formState.startedAt.split("T")[0]}
                onChange={(e) => handleChange("startedAt", new Date(e.target.value).toISOString())}
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Expires At *
              </label>
              <input
                type="date"
                required
                className="pixel-input w-full"
                value={formState.expiresAt.split("T")[0]}
                onChange={(e) => handleChange("expiresAt", new Date(e.target.value).toISOString())}
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Notify Days Before
              </label>
              <input
                type="number"
                min="1"
                max="30"
                className="pixel-input w-full"
                value={formState.notifyDaysBefore}
                onChange={(e) => handleChange("notifyDaysBefore", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              Notes
            </label>
            <textarea
              rows={3}
              className="pixel-input w-full"
              value={formState.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>

          <PixelButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting || mutations.createTrial.isPending}
            isLoading={isSubmitting || mutations.createTrial.isPending}
            className="w-full"
          >
            {isSubmitting ? "Creating Trial..." : "Add Trial"}
          </PixelButton>
        </form>
      </PixelCard>

      {/* Trials Table */}
      <PixelCard className="overflow-hidden p-0">
        <div className="border-b border-outline-soft/30 bg-background-muted/50 p-6">
          <h2 className="font-mono text-2xl font-black uppercase tracking-tight text-foreground">
            All Trials ({trials.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center font-mono text-sm text-foreground-soft">
            Loading trials...
          </div>
        ) : trials.length === 0 ? (
          <div className="p-12 text-center font-mono text-sm text-foreground-soft">
            No trials yet. Add one above to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-outline-soft/50 bg-background-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
                    Expires
                  </th>
                  <th className="px-4 py-3 text-right font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>{tableRows}</tbody>
            </table>
          </div>
        )}
      </PixelCard>
    </div>
  );
};
