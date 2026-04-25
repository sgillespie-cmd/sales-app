import { createServerSupabaseClient } from "@/lib/db/supabaseClient";

export function accountIdFromRequest(url: URL): string | null {
  return url.searchParams.get("accountId");
}

export async function getClientAndAccount(url: URL): Promise<{
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  accountId: string | null;
}> {
  const supabase = createServerSupabaseClient();
  return {
    supabase,
    accountId: accountIdFromRequest(url),
  };
}
