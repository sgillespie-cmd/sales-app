import { NextRequest, NextResponse } from "next/server";

import { badRequest, internalServerError } from "@/lib/api/errors";
import { resolveAuthContext } from "@/lib/api/auth";
import { hasSupabaseEnv } from "@/lib/db/supabaseClient";
import { updateWeightsSchema } from "@/lib/validation/schemas";

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const parsed = updateWeightsSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ data: { ok: true, mode: "demo", ...parsed.data }, error: null });
  }

  const auth = await resolveAuthContext(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }
  if (auth.accountId !== parsed.data.accountId) {
    return badRequest("Payload accountId must match authenticated account.");
  }

  const supabase = auth.supabase;

  for (const weight of parsed.data.weights) {
    const { error } = await supabase
      .from("factor_weights")
      .upsert(
        {
          account_id: auth.accountId,
          factor_id: weight.factorId,
          weight: weight.weight,
        },
        { onConflict: "account_id,factor_id" },
      );
    if (error) {
      return internalServerError("Failed to update factor weights.", error.message);
    }
  }

  return NextResponse.json({
    data: {
      ok: true,
      updated: parsed.data.weights.length,
      accountId: auth.accountId,
    },
    error: null,
  });
}
