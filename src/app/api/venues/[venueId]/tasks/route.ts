import { NextRequest, NextResponse } from "next/server";

import { createTaskSchema } from "@/lib/validation/schemas";
import { handleApiError, validationError } from "@/lib/api/errors";
import {
  requireAccountAccessFromRequest,
  requireVenueAccess,
} from "@/lib/api/auth";

interface TaskRow {
  id: string;
  title: string;
  status: "open" | "in_progress" | "done";
  due_at: string | null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ venueId: string }> },
) {
  try {
    const { venueId } = await context.params;
    const auth = await requireAccountAccessFromRequest(request);
    await requireVenueAccess(auth.supabase, auth.accountId, venueId);

    const { data, error } = await auth.supabase
      .from("tasks")
      .select("id, title, status, due_at")
      .eq("account_id", auth.accountId)
      .eq("venue_id", venueId)
      .order("created_at", { ascending: true });
    if (error) {
      throw error;
    }

    const mapped = ((data ?? []) as TaskRow[]).map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      dueAt: task.due_at,
    }));

    return NextResponse.json({ data: mapped, error: null });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ venueId: string }> },
) {
  try {
    const { venueId } = await context.params;
    const auth = await requireAccountAccessFromRequest(request);
    await requireVenueAccess(auth.supabase, auth.accountId, venueId);

    const body = await request.json();
    const parsed = createTaskSchema.safeParse({
      ...body,
      accountId: auth.accountId,
      venueId,
    });
    if (!parsed.success) {
      return validationError("Invalid payload", parsed.error.flatten());
    }

    const payload = parsed.data;
    const { data, error } = await auth.supabase
      .from("tasks")
      .insert({
        account_id: payload.accountId,
        venue_id: payload.venueId,
        title: payload.title,
        status: payload.status ?? "open",
        due_at: payload.dueAt ?? null,
        assignee: payload.assignee ?? null,
      })
      .select("id, title, status, due_at")
      .single();
    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        data: {
          id: data.id,
          title: data.title,
          status: data.status,
          dueAt: data.due_at,
        },
        error: null,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
