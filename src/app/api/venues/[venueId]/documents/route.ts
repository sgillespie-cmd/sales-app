import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseEnv, getSupabaseServerClient } from "@/lib/db/supabaseClient";
import { createDocumentMetadataSchema } from "@/lib/validation/schemas";

export async function GET(_: NextRequest, context: { params: Promise<{ venueId: string }> }) {
  const { venueId } = await context.params;
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ data: [], error: null });
  }
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("venue_id", venueId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    return NextResponse.json({ data: null, error: { code: "documents_list_failed", message: error.message } }, { status: 500 });
  }
  return NextResponse.json({ data, error: null });
}

export async function POST(request: NextRequest, context: { params: Promise<{ venueId: string }> }) {
  const { venueId } = await context.params;
  const body = await request.json();
  const parsed = createDocumentMetadataSchema.safeParse({ ...body, venueId });
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: { code: "validation_error", message: "Invalid document payload", details: parsed.error.flatten() } },
      { status: 400 },
    );
  }

  if (!hasSupabaseEnv()) {
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
  const supabase = getSupabaseServerClient();
  const payload = parsed.data;
  const { data, error } = await supabase
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
    return NextResponse.json({ data: null, error: { code: "document_create_failed", message: error.message } }, { status: 500 });
  }
  return NextResponse.json({ data, error: null }, { status: 201 });
}
