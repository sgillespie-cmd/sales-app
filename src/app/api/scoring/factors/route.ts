import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    data: {
      message:
        "Stub endpoint. Implement factor reads via Supabase query in next iteration.",
    },
    error: null,
  });
}
