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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error in GET /api/trials:", authError);
      return NextResponse.json(
        { error: "Authentication failed", details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to continue." },
        { status: 401 }
      );
    }

    const trials = await getTrials(supabase, user.id);
    return NextResponse.json({ data: trials, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/trials:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch trials";
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error in POST /api/trials:", authError);
      return NextResponse.json(
        { error: "Authentication failed", details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to create trials." },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid request body. Please check your input." },
        { status: 400 }
      );
    }

    const result = await upsertTrial(supabase, payload, user.id);
    return NextResponse.json({ 
      data: result.trial, 
      warning: result.warning,
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/trials:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create trial";
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 400 },
    );
  }
}
