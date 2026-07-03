import { NextRequest, NextResponse } from "next/server";

import { badRequest, internalError } from "@/lib/api/errors";
import { hasSupabaseEnv } from "@/lib/db/supabaseClient";
import { createServerSupabaseClient } from "@/lib/db/supabaseClient";
import { resolveAuthContext } from "@/lib/api/auth";

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({
      data: {
        accountId: "00000000-0000-0000-0000-000000000001",
        mode: "demo",
      },
      error: null,
    });
  }

  const body = await request.json().catch(() => null);
  const accountName =
    typeof body?.accountName === "string" ? body.accountName.trim() : "";
  if (!accountName) {
    return badRequest("Account name is required.");
  }

  const auth = await resolveAuthContext(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  const supabase = createServerSupabaseClient(
    request.headers.get("authorization")?.replace("Bearer ", ""),
  );

  const { data, error } = await supabase.rpc("create_wedding_account", {
    account_name: accountName,
  });

  if (error) {
    return internalError("Failed to bootstrap account.", error.message);
  }

  return NextResponse.json(
    {
      data: { accountId: data as string, mode: "supabase" },
      error: null,
    },
    { status: 201 },
  );
}
