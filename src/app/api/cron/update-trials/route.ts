import { NextResponse } from "next/server";

/**
 * Vercel Cron endpoint to update trial statuses
 * This is an alternative to pg_cron for Supabase projects that don't have it
 * 
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-trials",
 *     "schedule": "*/5 * * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  
  // In production, verify the cron secret
  if (process.env.NODE_ENV === "production") {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase credentials");
    }

    // Call the Supabase Edge Function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/update-trial-statuses`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Edge function failed: ${error}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Trial statuses updated successfully",
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Disable body parsing for this endpoint
export const dynamic = "force-dynamic";

