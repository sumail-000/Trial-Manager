'use server';

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import {
  deleteTrial,
  upsertTrial,
  getTrials,
} from "@/features/trials/server/repository";

import type { TrialMutationInput } from "@/features/trials/types";
import type { Database } from "@/lib/supabase/types";

const revalidateTrialViews = () => {
  revalidatePath("/dashboard");
  revalidatePath("/trials");
};

const getSupabaseServerClient = async () => {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component. Can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
};

export const createTrialAction = async (input: TrialMutationInput) => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: You must be logged in to create trials");
  }

  const result = await upsertTrial(supabase, input, user.id);
  revalidateTrialViews();
  return result;
};

export const updateTrialAction = async (input: TrialMutationInput) => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: You must be logged in to update trials");
  }

  const result = await upsertTrial(supabase, input, user.id);
  revalidateTrialViews();
  return result;
};

export const deleteTrialAction = async (trialId: string) => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: You must be logged in to delete trials");
  }

  await deleteTrial(supabase, trialId, user.id);
  revalidateTrialViews();
  return { ok: true };
};

export const syncTrialsAction = async () => {
  revalidateTrialViews();
  return { ok: true };
};

export const getTrialsAction = async () => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  return getTrials(supabase, user.id);
};

