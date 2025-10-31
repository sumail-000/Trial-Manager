"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { differenceInHours } from "date-fns";

import { fetchTrialById, fetchTrials } from "../api";
import type { TrialRecord, TrialStatus } from "../types";

export const TRIALS_QUERY_KEY = ["trials"] as const;

export const useTrials = () =>
  useQuery({
    queryKey: TRIALS_QUERY_KEY,
    queryFn: fetchTrials,
    staleTime: 60 * 1000,
    select: (records) =>
      [...records].sort(
        (a, b) =>
          new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
      ),
  });

export const useTrial = (trialId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...TRIALS_QUERY_KEY, trialId],
    queryFn: async () => {
      // Try to reuse cached list data to avoid waiting on fetch.
      const cachedList = queryClient.getQueryData<TrialRecord[]>(TRIALS_QUERY_KEY);
      if (cachedList) {
        const cached = cachedList.find((trial) => trial.id === trialId);
        if (cached) {
          return cached;
        }
      }

      const record = await fetchTrialById(trialId);
      if (!record) {
        throw new Error("Trial not found");
      }
      return record;
    },
    staleTime: 30 * 1000,
  });
};

const statusOrder: TrialStatus[] = ["expiring", "expired", "active", "cancelled"];

export const useTrialSummary = (records: TrialRecord[] | undefined) =>
  useMemo(() => {
    if (!records || records.length === 0) {
      return {
        active: 0,
        expiringSoon: 0,
        expired: 0,
        totalCost: 0,
        soonestExpiry: null as string | null,
      };
    }

    const soonest = [...records].sort(
      (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
    )[0];

    const activeCostTotal = records
      .filter((t) => t.status === "active" || t.status === "expiring")
      .reduce((sum, trial) => sum + trial.cost, 0);

    return {
      active: records.filter((trial) => trial.status === "active").length,
      expiringSoon: records.filter((trial) => trial.status === "expiring").length,
      expired: records.filter((trial) => trial.status === "expired").length,
      totalCost: activeCostTotal,
      soonestExpiry: soonest?.expiresAt ?? null,
    };
  }, [records]);

export const useTrialOrdering = (records: TrialRecord[] | undefined) =>
  useMemo(() => {
    if (!records) {
      return [] as TrialRecord[];
    }

    return [...records].sort((a, b) => {
      const statusRank =
        statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      if (statusRank !== 0) {
        return statusRank;
      }

      const hoursDiff =
        differenceInHours(new Date(a.expiresAt), new Date()) -
        differenceInHours(new Date(b.expiresAt), new Date());

      if (hoursDiff !== 0) {
        return hoursDiff;
      }

      return b.cost - a.cost;
    });
  }, [records]);

