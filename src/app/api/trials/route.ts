import { NextResponse } from "next/server";

import {
  getTrials,
  upsertTrial,
} from "@/features/trials/server/repository";

export async function GET() {
  const trials = await getTrials();
  return NextResponse.json({ data: trials });
}

export async function POST(request: Request) {
  const payload = await request.json();

  try {
    const result = await upsertTrial(payload);
    return NextResponse.json({ data: result.trial, warning: result.warning });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Validation or database error" },
      { status: 400 },
    );
  }
}

