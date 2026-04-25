import { NextRequest, NextResponse } from "next/server";
import { createInteractionSchema } from "@/lib/validation/schemas";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  const { venueId } = await params;

  return NextResponse.json({
    data: {
      venueId,
      interactions: [],
    },
    error: null,
  });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const venueIdFromPath = request.nextUrl.pathname.split("/")[3];
  const parsed = createInteractionSchema.safeParse({
    ...payload,
    venueId: payload?.venueId ?? venueIdFromPath,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INVALID_INTERACTION_PAYLOAD",
          message: "Invalid interaction payload",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      data: {
        message: "Interaction payload validated. Persist with Supabase next.",
        interaction: parsed.data,
      },
      error: null,
    },
    { status: 201 }
  );
}
