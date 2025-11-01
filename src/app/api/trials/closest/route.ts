import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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

/**
 * GET /api/trials/closest
 * Returns the trial closest to expiring (for landing page countdown)
 * This endpoint is public and shows trials from all users
 */
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();

    // Query the closest expiring trial using our view
    const { data, error } = await supabase
      .from("trials")
      .select("*")
      .in("status", ["active", "expiring"])
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: true })
      .limit(1)
      .single();

    if (error) {
      // If no trials found, return null
      if (error.code === "PGRST116") {
        return NextResponse.json({
          trial: null,
          message: "No active trials found",
        });
      }
      
      console.error("Error fetching closest trial:", error);
      return NextResponse.json(
        { error: "Failed to fetch closest trial" },
        { status: 500 }
      );
    }

    // Calculate seconds until expiry
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    const secondsUntilExpiry = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

    return NextResponse.json({
      trial: {
        id: data.id,
        serviceName: data.service_name,
        email: data.email,
        cardLast4: data.card_last4,
        startedAt: data.started_at,
        expiresAt: data.expires_at,
        status: data.status,
        cancelUrl: data.cancel_url,
        notifyDaysBefore: data.notify_days_before,
        category: data.category,
        cost: data.cost,
        notes: data.notes,
        alerts: data.alerts,
      },
      secondsUntilExpiry,
      expiresAt: data.expires_at,
    });
  } catch (err) {
    console.error("Error in /api/trials/closest:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

