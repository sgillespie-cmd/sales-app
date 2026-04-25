import { NextRequest, NextResponse } from "next/server";

import type { ApiResponse, VenueListItem } from "@/lib/types/api";
import { listVenues } from "@/lib/db/queries/venues";
import { createVenueSchema, listVenuesQuerySchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = listVenuesQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      {
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid list venues query parameters.",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  const venues = await listVenues(parsed.data);
  return NextResponse.json<ApiResponse<VenueListItem[]>>({
    data: venues,
    error: null,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createVenueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      {
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid create venue payload.",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  return NextResponse.json<ApiResponse<{ id: string } & typeof parsed.data>>(
    {
      data: {
        ...parsed.data,
        id: `demo-${Date.now()}`,
      },
      error: null,
    },
    { status: 201 },
  );
}
