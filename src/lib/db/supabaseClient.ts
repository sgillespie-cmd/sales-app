import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabaseEnv(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function missingEnvError(): Error {
  return new Error(
    "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

function createConfiguredClient(key: string, accessToken?: string): SupabaseClient {
  return createClient(supabaseUrl!, key, {
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export function createServerSupabaseClient(accessToken?: string): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw missingEnvError();
  }
  return createConfiguredClient(supabaseAnonKey, accessToken);
}

export function getSupabaseServerClient(): SupabaseClient {
  return createServerSupabaseClient();
}

export function getServiceRoleClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase service role environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}
