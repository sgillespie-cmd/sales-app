import type { SupabaseClient } from "@supabase/supabase-js";

export async function listScoreFactors(supabase: SupabaseClient, accountId: string) {
  return supabase
    .from("score_factors")
    .select("id, key, label, description, active")
    .eq("account_id", accountId)
    .order("label", { ascending: true });
}

export async function listFactorWeights(supabase: SupabaseClient, accountId: string) {
  return supabase
    .from("factor_weights")
    .select("id, factor_id, weight")
    .eq("account_id", accountId);
}

