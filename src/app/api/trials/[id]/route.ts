import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import {
  deleteTrial,
  getTrialById,
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

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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

    const { id } = await context.params;
    const trial = await getTrialById(supabase, id, user.id);
    
    if (!trial) {
      return NextResponse.json(
        { error: "Trial not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: trial });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch trial" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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
    const { id } = await context.params;

    const result = await upsertTrial(supabase, { ...payload, id }, user.id);
    return NextResponse.json({ data: result.trial, warning: result.warning });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Validation or database error" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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

    const { id } = await context.params;
    await deleteTrial(supabase, id, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

