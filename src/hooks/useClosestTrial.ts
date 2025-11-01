"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface ClosestTrialData {
  id: string;
  serviceName: string;
  email: string;
  cardLast4: string;
  startedAt: string;
  expiresAt: string;
  status: string;
  cancelUrl: string | null;
  notifyDaysBefore: number;
  category: string;
  cost: number;
  notes: string | null;
  alerts: unknown;
}

export interface ClosestTrialResponse {
  trial: ClosestTrialData | null;
  secondsUntilExpiry: number;
  expiresAt: string;
}

/**
 * Hook to fetch and subscribe to the closest expiring trial
 * Uses real-time Supabase subscriptions to stay updated
 */
export const useClosestTrial = () => {
  const [data, setData] = useState<ClosestTrialResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClosestTrial = async () => {
    try {
      const response = await fetch("/api/trials/closest");
      if (!response.ok) {
        throw new Error("Failed to fetch closest trial");
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchClosestTrial();

    // Set up real-time subscription to trials table
    const supabase = getSupabaseBrowserClient();
    
    const channel = supabase
      .channel("trials-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "trials",
        },
        (payload) => {
          console.log("Trial changed:", payload);
          // Refetch when any trial changes
          fetchClosestTrial();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Also refetch periodically to ensure status stays updated
  useEffect(() => {
    const interval = setInterval(() => {
      fetchClosestTrial();
    }, 60000); // Refetch every minute

    return () => clearInterval(interval);
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchClosestTrial,
  };
};

