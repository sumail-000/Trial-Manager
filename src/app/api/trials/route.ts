import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import {
  getTrials,
  upsertTrial,
} from "@/features/trials/server/repository";
import type { Database } from "@/lib/supabase/types";

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

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ data: [] });
    }

    const trials = await getTrials(supabase, user.id);
    return NextResponse.json({ data: trials });
  } catch (error) {
    console.error("Error in GET /api/trials:", error);
    return NextResponse.json(
      { error: "Failed to fetch trials" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const result = await upsertTrial(supabase, payload, user.id);
    return NextResponse.json({ data: result.trial, warning: result.warning });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Validation or database error" },
      { status: 400 },
    );
  }
}
