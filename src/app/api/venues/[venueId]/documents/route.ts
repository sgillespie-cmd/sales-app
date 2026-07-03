import { NextResponse, type NextRequest } from "next/server";

import { apiErrorResponse } from "@/lib/api/errors";
import { ensureAccountContext } from "@/lib/api/auth";
import { createDocumentMetadataSchema } from "@/lib/validation/schemas";

interface Params {
  params: Promise<{ venueId: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { venueId } = await params;
  const context = await ensureAccountContext(request);
  if ("response" in context) {
    return context.response;
  }

  const { supabase, accountId, hasDb } = context;
  if (!hasDb) {
    return NextResponse.json({ data: [], error: null });
  }

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("account_id", accountId)
    .eq("venue_id", venueId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    return apiErrorResponse(
      "DOCUMENTS_LIST_FAILED",
      "Failed to load documents for this venue.",
      500,
      error.message,
    );
  }

  return NextResponse.json({ data, error: null });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { venueId } = await params;
  const context = await ensureAccountContext(request);
  if ("response" in context) {
    return context.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = createDocumentMetadataSchema.safeParse({
    ...body,
    venueId,
    accountId: context.accountId,
  });
  if (!parsed.success) {
    return apiErrorResponse(
      "VALIDATION_ERROR",
      "Invalid document payload.",
      400,
      parsed.error.flatten(),
    );
  }

  if (!context.hasDb) {
    return NextResponse.json(
      {
        data: {
          id: `demo-${Date.now()}`,
          accountId: parsed.data.accountId,
          venueId: parsed.data.venueId,
          storagePath: parsed.data.storagePath,
          fileName: parsed.data.fileName,
          fileType: parsed.data.fileType,
          sizeBytes: parsed.data.sizeBytes,
          docKind: parsed.data.docKind ?? "other",
          uploadedAt: new Date().toISOString(),
        },
        error: null,
      },
      { status: 201 },
    );
  }

  const payload = parsed.data;
  const { data, error } = await context.supabase
    .from("documents")
    .insert({
      account_id: payload.accountId,
      venue_id: payload.venueId,
      storage_path: payload.storagePath,
      file_name: payload.fileName,
      file_type: payload.fileType,
      size_bytes: payload.sizeBytes,
      doc_kind: payload.docKind ?? "other",
    })
    .select("*")
    .single();

  if (error) {
    return apiErrorResponse(
      "DOCUMENT_CREATE_FAILED",
      "Could not save document metadata.",
      500,
      error.message,
    );
  }

  return NextResponse.json({ data, error: null }, { status: 201 });
}
