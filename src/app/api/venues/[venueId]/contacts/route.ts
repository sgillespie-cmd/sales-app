import { NextResponse } from "next/server";

import { requireScopedApiAccess } from "@/lib/api/auth";
import { apiErrorResponse } from "@/lib/api/errors";
import { createContactSchema } from "@/lib/validation/schemas";

interface Params {
  params: Promise<{ venueId: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const { venueId } = await params;
  const auth = await requireScopedApiAccess(req);
  if (!auth.ok) {
    return auth.response;
  }

  const body = await req.json();
  const parsed = createContactSchema.safeParse({ ...body, venueId, accountId: auth.accountId });
  if (!parsed.success) {
    return apiErrorResponse("VALIDATION_ERROR", "Invalid payload", 400, parsed.error.flatten());
  }

  const { data, error } = await auth.supabase
    .from("contacts")
    .insert({
      account_id: parsed.data.accountId,
      venue_id: parsed.data.venueId,
      name: parsed.data.name,
      role: parsed.data.role ?? null,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      preferred_channel: parsed.data.preferredChannel ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return apiErrorResponse("CONTACT_CREATE_FAILED", error.message, 500);
  }

  return NextResponse.json({ data, error: null }, { status: 201 });
}
