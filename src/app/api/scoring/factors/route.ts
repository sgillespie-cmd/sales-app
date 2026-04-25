import { NextRequest } from "next/server";
import { getServiceRoleClient } from "@/lib/db/supabaseClient";
import { getAccountAccessContext } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/errors";
import { listScoreFactors } from "@/lib/db/queries/scoring";

export async function GET(request: NextRequest) {
  const access = await getAccountAccessContext(request);
  if (!access.ok) {
    return access.response;
  }

  const { data, error } = await listScoreFactors(access.supabase, access.accountId);
  if (error) {
    return apiError("SCORING_FACTORS_LIST_FAILED", error.message, 500);
  }
  return apiSuccess(data ?? []);
}

export async function POST(request: NextRequest) {
  const access = await getAccountAccessContext(request);
  if (!access.ok) {
    return access.response;
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return apiError("VALIDATION_ERROR", "Invalid factor payload.", 400);
  }

  const key = typeof body.key === "string" ? body.key.trim().toLowerCase() : "";
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : null;
  const active = typeof body.active === "boolean" ? body.active : true;

  if (!key || !label) {
    return apiError("VALIDATION_ERROR", "Both key and label are required.", 400);
  }

  const { data: factor, error: factorError } = await access.supabase
    .from("score_factors")
    .insert({
      account_id: access.accountId,
      key,
      label,
      description,
      active,
    })
    .select("id, key, label, description, active")
    .single();

  if (factorError) {
    return apiError("SCORING_FACTOR_CREATE_FAILED", factorError.message, 500);
  }

  // Ensure the new factor has a default weight.
  const serviceRole = getServiceRoleClient();
  const { error: weightError } = await serviceRole
    .from("factor_weights")
    .upsert(
      {
        account_id: access.accountId,
        factor_id: factor.id,
        weight: 1,
      },
      { onConflict: "account_id,factor_id" },
    );
  if (weightError) {
    return apiError("SCORING_FACTOR_WEIGHT_CREATE_FAILED", weightError.message, 500);
  }

  return apiSuccess(factor, 201);
}
