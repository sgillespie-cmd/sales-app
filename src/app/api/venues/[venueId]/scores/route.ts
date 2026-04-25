import { NextRequest, NextResponse } from "next/server";
import { upsertVenueScoresSchema } from "@/lib/validation/schemas";

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = upsertVenueScoresSchema.parse(await request.json());

    return NextResponse.json({
      data: { ok: true, venueId: payload.venueId, updated: payload.scores.length },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid score payload.",
          details: error,
        },
      },
      { status: 400 },
    );
  }
}
