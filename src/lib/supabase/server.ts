import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/lib/env";

import type { Database } from "./types";

export const createSupabaseServerClient = async (): Promise<SupabaseClient<Database>> => {
  const env = getServerEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            if (process.env.NODE_ENV !== "production") {
              console.warn("Unable to set cookie during render", error);
            }
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch (error) {
            if (process.env.NODE_ENV !== "production") {
              console.warn("Unable to remove cookie during render", error);
            }
          }
        },
      },
    },
  );
};

