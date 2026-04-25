import { NextResponse } from "next/server";
import { createContactSchema } from "@/lib/validation/schemas";

interface Params {
  params: Promise<{ venueId: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const { venueId } = await params;
  const body = await req.json();
  const parsed = createContactSchema.safeParse({ ...body, venueId });
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: { code: "VALIDATION_ERROR", message: "Invalid payload", details: parsed.error.flatten() } },
      { status: 400 },
    );
  }

  return NextResponse.json({
    data: {
      message: "Contact endpoint scaffolded. Persist this via Supabase insert into contacts table.",
      payload: parsed.data,
    },
    error: null,
  });
}
