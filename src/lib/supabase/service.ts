import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

let serviceRoleClient: SupabaseClient<Database> | undefined;

export const getSupabaseServiceRoleClient = (): SupabaseClient<Database> => {
  if (!serviceRoleClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-key";

    serviceRoleClient = createClient<Database>(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return serviceRoleClient;
};

