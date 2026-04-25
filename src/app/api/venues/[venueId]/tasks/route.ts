import { NextRequest, NextResponse } from "next/server";

import { createTaskSchema } from "@/lib/validation/schemas";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ venueId: string }> }
) {
  const { venueId } = await context.params;
  return NextResponse.json({
    data: [],
    error: null,
    meta: { note: `Stubbed tasks list for venue ${venueId}` },
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ venueId: string }> }
) {
  const { venueId } = await context.params;
  const body = await request.json();
  const parsed = createTaskSchema.safeParse({
    ...body,
    venueId,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  return NextResponse.json({
    data: parsed.data,
    error: null,
    meta: { note: "Stubbed create task endpoint; wire DB insert next." },
  });
}
