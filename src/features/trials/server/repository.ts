import "server-only";

import { differenceInDays } from "date-fns";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/service";
import type { Json, Database } from "@/lib/supabase/types";

import type { TrialMutationInput, TrialRecord, TrialStatus } from "../types";

// Supabase row type matching the new simplified schema
type SupabaseTrialRow = {
  id: string;
  service_name: string;
  email: string;
  card_last4: string;
  started_at: string;
  expires_at: string;
  status: string;
  cancel_url: string | null;
  notify_days_before: number;
  category: string;
  cost: number;
  notes: string | null;
  alerts: Json | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
};

// Validation schema for mutations
const mutationSchema = z.object({
  id: z.string().optional(),
  serviceName: z.string().min(1, "Service name is required"),
  email: z.string().email("Valid email is required"),
  cardLast4: z.string().length(4, "Card last 4 digits must be exactly 4 characters"),
  startedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  cancelUrl: z
    .string()
    .url()
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
  notifyDaysBefore: z.number().min(1).max(30).default(3),
  category: z.string().min(1),
  cost: z.number().min(0),
  notes: z.string().optional().nullable(),
});

const hasSupabaseCredentials =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

// Derive status based on expiry date
const deriveStatus = (record: TrialRecord): TrialStatus => {
  if (record.status === "cancelled") {
    return "cancelled";
  }

  const diffDays = differenceInDays(new Date(record.expiresAt), new Date());
  if (diffDays < 0) {
    return "expired";
  }
  if (diffDays <= record.notifyDaysBefore) {
    return "expiring";
  }
  return "active";
};

// Convert Supabase row to TrialRecord
const fromSupabaseRow = (row: SupabaseTrialRow): TrialRecord => ({
  id: row.id,
  serviceName: row.service_name,
  email: row.email,
  cardLast4: row.card_last4,
  startedAt: row.started_at,
  expiresAt: row.expires_at,
  status: (row.status ?? "active") as TrialStatus,
  cancelUrl: row.cancel_url ?? undefined,
  notifyDaysBefore: row.notify_days_before,
  category: row.category,
  cost: row.cost,
  notes: row.notes ?? undefined,
  alerts: (row.alerts as unknown as TrialRecord["alerts"]) ?? [],
});

// Convert TrialMutationInput to Supabase row
const toSupabaseRow = (input: TrialMutationInput, userId: string): Partial<SupabaseTrialRow> => {
  const row: Partial<SupabaseTrialRow> = {
    service_name: input.serviceName,
    email: input.email,
    card_last4: input.cardLast4,
    started_at: input.startedAt,
    expires_at: input.expiresAt,
    status: input.status ?? "active",
    cancel_url: input.cancelUrl ?? null,
    notify_days_before: input.notifyDaysBefore,
    category: input.category,
    cost: input.cost,
    notes: input.notes ?? null,
    user_id: userId,
  };

  if (input.id) {
    row.id = input.id;
  }

  return row;
};

export const getTrials = async (
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<TrialRecord[]> => {
  if (!hasSupabaseCredentials) {
    throw new Error("Supabase credentials are not configured");
  }

  const { data, error} = await supabase
    .from("trials")
    .select("*")
    .eq("user_id", userId)
    .order("expires_at", { ascending: true });

  if (error) {
    console.error("Error fetching trials:", error);
    throw new Error(`Failed to fetch trials: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const record = fromSupabaseRow(row as never);
    return {
      ...record,
      status: deriveStatus(record),
    };
  });
};

export const getTrialById = async (
  supabase: SupabaseClient<Database>,
  id: string,
  userId: string
): Promise<TrialRecord | null> => {
  if (!hasSupabaseCredentials) {
    throw new Error("Supabase credentials are not configured");
  }

  const { data, error } = await supabase
    .from("trials")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error(`Error fetching trial ${id}:`, error);
    return null;
  }

  if (!data) {
    return null;
  }

  const record = fromSupabaseRow(data as never);
  return {
    ...record,
    status: deriveStatus(record),
  };
};

export const upsertTrial = async (
  supabase: SupabaseClient<Database>,
  input: TrialMutationInput,
  userId: string
) => {
  const payload = mutationSchema.parse(input);

  if (!hasSupabaseCredentials) {
    throw new Error("Supabase credentials are not configured");
  }

  const row = toSupabaseRow(payload, userId);
  const { data, error } = await supabase
    .from("trials")
    .upsert(row as never, {
      onConflict: "id",
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error upserting trial:", error);
    throw new Error(`Failed to upsert trial: ${error.message}`);
  }

  if (!data) {
    throw new Error("Upsert succeeded but no data was returned");
  }

  const record = fromSupabaseRow(data as never);
  return {
    trial: {
      ...record,
      status: deriveStatus(record),
    },
  };
};

export const deleteTrial = async (
  supabase: SupabaseClient<Database>,
  id: string,
  userId: string
): Promise<void> => {
  if (!hasSupabaseCredentials) {
    console.warn("Supabase credentials missing — delete operation skipped.");
    return;
  }

  const { error } = await supabase
    .from("trials")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error(`Error deleting trial ${id}:`, error);
    throw new Error(`Failed to delete trial: ${error.message}`);
  }
};

export const computeTrialSummary = (trials: TrialRecord[]) => {
  const activeTr = trials.filter((t) => t.status === "active" || t.status === "expiring");
  const expiringTrials = trials.filter((t) => t.status === "expiring");
  const expiredTrials = trials.filter((t) => t.status === "expired");
  
  // Calculate total monthly cost
  const monthlyCost = activeTr.reduce((sum, t) => sum + t.cost, 0);
  
  // Find soonest expiring trial
  const soonest = activeTr.length > 0
    ? activeTr.reduce((earliest, trial) =>
        new Date(trial.expiresAt) < new Date(earliest.expiresAt) ? trial : earliest
      )
    : null;

  return {
    totalTrials: trials.length,
    activeTrials: activeTr.length,
    expiringTrials: expiringTrials.length,
    expiredTrials: expiredTrials.length,
    monthlyCost,
    soonestExpiry: soonest?.expiresAt ? new Date(soonest.expiresAt) : null,
  };
};
