import { NextRequest, NextResponse } from "next/server";
import { ensureAccountAccess, ensureSupabaseAuth } from "@/lib/api/auth";
import { apiError } from "@/lib/api/errors";
import { createInteractionSchema } from "@/lib/validation/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> },
) {
  const { venueId } = await params;
  const auth = await ensureSupabaseAuth(request);
  if (!auth.ok) {
    return auth.error;
  }
  const access = await ensureAccountAccess(auth.supabase, auth.accountId);
  if ("error" in access) {
    return access.error;
  }

  const { data, error } = await auth.supabase
    .from("interactions")
    .select("*")
    .eq("account_id", auth.accountId)
    .eq("venue_id", venueId)
    .order("occurred_at", { ascending: false });

  if (error) {
    return apiError("INTERACTIONS_LIST_FAILED", error.message, 500);
  }

  return NextResponse.json({
    data: {
      venueId,
      interactions: data ?? [],
    },
    error: null,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> },
) {
  const { venueId } = await params;
  const auth = await ensureSupabaseAuth(request);
  if (!auth.ok) {
    return auth.error;
  }
  const access = await ensureAccountAccess(auth.supabase, auth.accountId);
  if ("error" in access) {
    return access.error;
  }

  const payload = await request.json().catch(() => null);
  const parsed = createInteractionSchema.safeParse({
    ...payload,
    venueId,
    accountId: auth.accountId,
  });

  if (!parsed.success) {
    return apiError(
      "INVALID_INTERACTION_PAYLOAD",
      "Invalid interaction payload",
      400,
      parsed.error.flatten(),
    );
  }

  const { data, error } = await auth.supabase
    .from("interactions")
    .insert({
      account_id: parsed.data.accountId,
      venue_id: parsed.data.venueId,
      interaction_type: parsed.data.interactionType,
      occurred_at: parsed.data.occurredAt,
      summary: parsed.data.summary,
      transcript_text: parsed.data.transcriptText ?? null,
      next_action: parsed.data.nextAction ?? null,
      created_by: auth.user.id,
    })
    .select("*")
    .single();

  if (error) {
    return apiError("INTERACTION_CREATE_FAILED", error.message, 500);
  }

  return NextResponse.json(
    {
      data,
      error: null,
    },
    { status: 201 },
  );
}
