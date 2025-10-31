import { NextRequest, NextResponse } from "next/server";

import {
  deleteTrial,
  getTrialById,
  upsertTrial,
} from "@/features/trials/server/repository";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const trial = await getTrialById(id);
  if (!trial) {
    return NextResponse.json(
      { error: "Trial not found" },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({ data: trial });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const payload = await request.json();
  const { id } = await context.params;

  try {
    const result = await upsertTrial({ ...payload, id });
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
  const { id } = await context.params;
  try {
    await deleteTrial(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

