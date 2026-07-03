import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/api/auth";
import { apiBadRequest, apiInternalError, apiNotFound, apiUnauthorized } from "@/lib/api/errors";

const createUploadUrlSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string().min(1).max(120),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ venueId: string }> },
): Promise<NextResponse> {
  const auth = await requireSupabaseAuth(request);
  if ("error" in auth) {
    return apiUnauthorized(auth.error);
  }
  const { supabase, accountId } = auth;
  const { venueId } = await context.params;

  const venueCheck = await supabase
    .from("venues")
    .select("id")
    .eq("id", venueId)
    .eq("account_id", accountId)
    .single();
  if (venueCheck.error) {
    if (venueCheck.error.code === "PGRST116") {
      return apiNotFound("Venue not found");
    }
    return apiInternalError("Failed to verify venue access", venueCheck.error.message);
  }

  const body = await request.json().catch(() => null);
  const parsed = createUploadUrlSchema.safeParse(body);
  if (!parsed.success) {
    return apiBadRequest("Invalid upload url request payload.", parsed.error.flatten());
  }

  const fileSafeName = parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${accountId}/${venueId}/${Date.now()}-${fileSafeName}`;

  const signedUpload = await supabase.storage
    .from("venue-docs")
    .createSignedUploadUrl(storagePath);
  if (signedUpload.error) {
    return apiInternalError("Failed to create signed upload URL", signedUpload.error.message);
  }

  return NextResponse.json({
    data: {
      token: signedUpload.data.token,
      signedUrl: signedUpload.data.signedUrl,
      storagePath,
      expiresIn: 60 * 120,
      fileType: parsed.data.fileType,
    },
    error: null,
  });
}
