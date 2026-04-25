import { NextRequest, NextResponse } from "next/server";
import { updateWeightsSchema } from "@/lib/validation/schemas";

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const parsed = updateWeightsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: parsed.error.flatten() } },
      { status: 400 },
    );
  }

  return NextResponse.json({ data: { ok: true, ...parsed.data }, error: null });
}
