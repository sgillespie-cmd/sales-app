import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    data: {
      message:
        "Bootstrap endpoint placeholder. Wire this to Supabase RPC create_wedding_account.",
    },
    error: null,
  });
}
