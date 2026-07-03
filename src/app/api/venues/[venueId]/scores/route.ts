import { NextRequest, NextResponse } from "next/server";

import { badRequest, mapUnknownError } from "@/lib/api/errors";
import { requireAccountClient } from "@/lib/api/auth";
import { upsertVenueScoresSchema } from "@/lib/validation/schemas";

interface Params {
  params: Promise<{ venueId: string }>;
}

export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const { venueId } = await params;
    const body = await request.json();
    const parsed = upsertVenueScoresSchema.safeParse({
      ...body,
      venueId,
    });
    if (!parsed.success) {
      return badRequest("Invalid score payload.", parsed.error.flatten());
    }

    const auth = await requireAccountClient(request);
    if ("error" in auth) {
      return auth.error;
    }
    const { supabase, accountId } = auth;

    const rows = parsed.data.scores.map((score) => ({
      account_id: accountId,
      venue_id: venueId,
      factor_id: score.factorId,
      score: score.score,
      rationale: score.rationale ?? null,
    }));

    const { error } = await supabase
      .from("venue_scores")
      .upsert(rows, { onConflict: "venue_id,factor_id" });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data: { ok: true, venueId, updated: parsed.data.scores.length },
      error: null,
    });
  } catch (error) {
    return mapUnknownError(error, "Failed to update venue scores.");
  }
}
