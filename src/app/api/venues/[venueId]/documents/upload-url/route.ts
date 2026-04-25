import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createUploadUrlSchema = z.object({
  accountId: z.string().uuid(),
  fileName: z.string().min(1).max(255),
  fileType: z.string().min(1).max(120),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const parsed = createUploadUrlSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid upload url request payload.",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  const fileSafeName = parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${parsed.data.accountId}/${Date.now()}-${fileSafeName}`;

  return NextResponse.json({
    data: {
      signedUrl: `https://example-storage.local/upload/${storagePath}`,
      storagePath,
      expiresIn: 60 * 5,
    },
    error: null,
  });
}
