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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to continue." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: "Invalid trial ID" },
        { status: 400 }
      );
    }

    const trial = await getTrialById(supabase, id, user.id);
    
    if (!trial) {
      return NextResponse.json(
        { error: "Trial not found or you don't have permission to access it" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: trial, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/trials/[id]:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch trial";
    return NextResponse.json(
      { error: errorMessage, success: false },
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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to update trials." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: "Invalid trial ID" },
        { status: 400 }
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

    const result = await upsertTrial(supabase, { ...payload, id }, user.id);
    return NextResponse.json({ 
      data: result.trial, 
      warning: result.warning,
      success: true 
    }, { status: 200 });
  } catch (error) {
    console.error("Error in PUT /api/trials/[id]:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update trial";
    return NextResponse.json(
      { error: errorMessage, success: false },
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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to delete trials." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: "Invalid trial ID" },
        { status: 400 }
      );
    }

    await deleteTrial(supabase, id, user.id);
    return NextResponse.json({ 
      success: true, 
      message: "Trial deleted successfully" 
    }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/trials/[id]:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete trial";
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 },
    );
  }
}

