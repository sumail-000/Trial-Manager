"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getBrowserEnv } from "@/lib/env";

import type { Database } from "./types";

let browserClient: SupabaseClient<Database> | undefined;

export const getSupabaseBrowserClient = (): SupabaseClient<Database> => {
  if (!browserClient) {
    const env = getBrowserEnv();

    browserClient = createBrowserClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }

  return browserClient;
};

