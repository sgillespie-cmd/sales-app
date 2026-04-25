import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServerSupabaseClient, hasSupabaseEnv } from "@/lib/db/supabaseClient";
import { badRequest, errorResponse, unauthorized } from "@/lib/api/errors";

const DEMO_ACCOUNT_ID = "00000000-0000-0000-0000-000000000001";

export type RequestContext = {
  supabase: SupabaseClient;
  user: User;
  accountId: string;
};

export type AuthResult =
  | { ok: true; supabase: SupabaseClient; user: User; accountId: string }
  | { ok: false; response: NextResponse };

type AuthState =
  | { ok: true; supabase: SupabaseClient; accountId: string; user: User }
  | { ok: false; error: NextResponse };

export function parseUuidOrNull(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value) ? value : null;
}

function asNextRequest(request: Request): NextRequest {
  if (request instanceof NextRequest) {
    return request;
  }
  return new NextRequest(request.url, { headers: request.headers });
}

async function resolveAccountIdForUser(
  supabase: SupabaseClient,
  userId: string,
  requestedAccountId?: string | null,
): Promise<string> {
  if (requestedAccountId) {
    const { data: membership, error } = await supabase
      .from("account_members")
      .select("account_id")
      .eq("account_id", requestedAccountId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      throw new Error(`Failed to validate account membership: ${error.message}`);
    }
    if (!membership) {
      throw new Error("User does not belong to requested account.");
    }
    return requestedAccountId;
  }

  const { data: membership, error } = await supabase
    .from("account_members")
    .select("account_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to resolve default account: ${error.message}`);
  }
  if (!membership) {
    throw new Error("No account membership found for user.");
  }
  return membership.account_id;
}

export async function requireAuthenticatedAccount(
  request: NextRequest,
  requestedAccountId?: string | null,
): Promise<{ supabase: SupabaseClient; user: User; accountId: string }> {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    throw new Error("Missing bearer auth token.");
  }

  const supabase = createServerSupabaseClient(token);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    throw new Error("Invalid auth token.");
  }

  const headerAccountId = parseUuidOrNull(request.headers.get("x-account-id"));
  const queryAccountId = parseUuidOrNull(request.nextUrl.searchParams.get("accountId"));
  const accountId = await resolveAccountIdForUser(
    supabase,
    userData.user.id,
    requestedAccountId ?? headerAccountId ?? queryAccountId,
  );

  return {
    supabase,
    user: userData.user,
    accountId,
  };
}

export async function buildRequestContext(request: NextRequest): Promise<RequestContext> {
  return requireAuthenticatedAccount(request);
}

export async function resolveAuthContext(
  request: NextRequest,
): Promise<
  | { supabase: SupabaseClient; user: User; accountId: string }
  | { errorResponse: NextResponse }
> {
  try {
    const context = await requireAuthenticatedAccount(request);
    return context;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed.";
    if (message.includes("Missing bearer auth token") || message.includes("Invalid auth token")) {
      return { errorResponse: unauthorized(message) };
    }
    if (message.includes("requested account")) {
      return { errorResponse: errorResponse("FORBIDDEN", message, 403) };
    }
    return { errorResponse: errorResponse("AUTH_CONTEXT_FAILED", message, 500) };
  }
}

export async function getAccountAccessContext(request: NextRequest): Promise<AuthResult> {
  const resolved = await resolveAuthContext(request);
  if ("errorResponse" in resolved) {
    return { ok: false, response: resolved.errorResponse };
  }
  return { ok: true, ...resolved };
}

function toAuthState(result: AuthResult): AuthState {
  if (result.ok) {
    return {
      ok: true,
      supabase: result.supabase,
      accountId: result.accountId,
      user: result.user,
    };
  }
  return { ok: false, error: result.response };
}

export async function requireScopedApiAccess(request: Request): Promise<AuthResult> {
  return getAccountAccessContext(asNextRequest(request));
}

export async function ensureAccountContext(request: NextRequest): Promise<
  | { supabase: SupabaseClient; accountId: string; user: User; hasDb: true }
  | { supabase: null; accountId: string; user: null; hasDb: false }
  | { response: NextResponse }
> {
  if (!hasSupabaseEnv()) {
    return {
      supabase: null,
      accountId: DEMO_ACCOUNT_ID,
      user: null,
      hasDb: false,
    };
  }

  const auth = await getAccountAccessContext(request);
  if (!auth.ok) {
    return { response: auth.response };
  }

  return {
    supabase: auth.supabase,
    accountId: auth.accountId,
    user: auth.user,
    hasDb: true,
  };
}

export async function ensureSupabaseAuth(request: NextRequest): Promise<AuthState> {
  return toAuthState(await getAccountAccessContext(request));
}

export async function ensureAccountAccess(
  _supabase: SupabaseClient,
  _accountId: string,
): Promise<{ ok: true } | { error: NextResponse }> {
  void _supabase;
  void _accountId;
  // Membership is already validated during auth context resolution.
  return { ok: true };
}

export async function requireSupabaseAuth(
  request: NextRequest,
): Promise<{ supabase: SupabaseClient; accountId: string; user: User } | { error: string }> {
  const auth = await ensureSupabaseAuth(request);
  if (!auth.ok) {
    const errorData = (await auth.error.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    return { error: errorData?.error?.message ?? "Authentication failed." };
  }
  return auth;
}

export async function requireAccountClient(
  request: NextRequest,
): Promise<{ supabase: SupabaseClient; accountId: string; user: User } | { error: NextResponse }> {
  const auth = await ensureSupabaseAuth(request);
  if (!auth.ok) {
    return { error: auth.error };
  }
  return auth;
}

export async function requireAccountAccessFromRequest(
  request: NextRequest,
): Promise<{ supabase: SupabaseClient; accountId: string; user: User }> {
  const auth = await ensureSupabaseAuth(request);
  if (!auth.ok) {
    throw new Error("Authentication required.");
  }
  return auth;
}

export async function requireVenueAccess(
  supabase: SupabaseClient,
  accountId: string,
  venueId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("venues")
    .select("id")
    .eq("account_id", accountId)
    .eq("id", venueId)
    .maybeSingle();
  if (error) {
    throw new Error(`Venue access check failed: ${error.message}`);
  }
  if (!data) {
    throw new Error("Venue not found in this account.");
  }
}

export async function requireAccountFromRequest(request: Request): Promise<AuthResult> {
  return getAccountAccessContext(asNextRequest(request));
}

export async function withOptionalSupabase<T>({
  onDemo,
  onSupabase,
}: {
  onDemo: () => Promise<T>;
  onSupabase: (supabase: SupabaseClient) => Promise<T>;
}): Promise<T> {
  if (!hasSupabaseEnv()) {
    return onDemo();
  }
  const supabase = createServerSupabaseClient();
  return onSupabase(supabase);
}

export function requireAccountIdFromBody(accountId: string | null): string | NextResponse {
  if (!accountId) {
    return badRequest("accountId is required.");
  }
  const parsed = parseUuidOrNull(accountId);
  if (!parsed) {
    return badRequest("accountId must be a valid UUID.");
  }
  return parsed;
}
