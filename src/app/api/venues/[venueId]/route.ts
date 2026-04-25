import { NextResponse } from "next/server";

import { updateVenueSchema } from "@/lib/validation/schemas";
import { getVenueById, getVenueProfileData } from "@/lib/db/queries/venues";

interface Params {
  params: Promise<{ venueId: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { venueId } = await params;
  const venue = await getVenueById(venueId);
  const profile = await getVenueProfileData(venueId);

  return NextResponse.json({
    data: {
      venue,
      profile,
    },
    error: null,
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const { venueId } = await params;
  const body = await request.json();
  const parsed = updateVenueSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: { code: "VALIDATION_ERROR", message: "Invalid venue payload", details: parsed.error.flatten() } },
      { status: 400 },
    );
  }

  return NextResponse.json({
    data: {
      id: venueId,
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    },
    error: null,
  });
}

export async function DELETE(_: Request, { params }: Params) {
  const { venueId } = await params;

  return NextResponse.json({
    data: { deleted: true, venueId },
    error: null,
  });
}
