import { NextResponse, type NextRequest } from "next/server";
import { getVenueById, getVenueProfileData } from "@/lib/db/queries/venues";
import { formatUnknownError, validationErrorResponse } from "@/lib/api/errors";
import {
  requireAccountFromRequest,
  withOptionalSupabase,
} from "@/lib/api/auth";
import { updateVenueSchema } from "@/lib/validation/schemas";

interface Params {
  params: Promise<{ venueId: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { venueId } = await params;
  try {
    const accountCtx = await requireAccountFromRequest(_);
    if (!accountCtx.ok) {
      return accountCtx.response;
    }

    return withOptionalSupabase({
      onDemo: async () => {
        const venue = await getVenueById(venueId);
        const profile = await getVenueProfileData(venueId);
        return NextResponse.json({
          data: {
            venue,
            profile,
          },
          error: null,
        });
      },
      onSupabase: async (supabase) => {
        const { data: venue, error: venueError } = await supabase
          .from("venues")
          .select("*")
          .eq("account_id", accountCtx.accountId)
          .eq("id", venueId)
          .single();
        if (venueError) {
          const status = venueError.code === "PGRST116" ? 404 : 500;
          return NextResponse.json(
            {
              data: null,
              error: {
                code: "VENUE_FETCH_FAILED",
                message: venueError.message,
              },
            },
            { status },
          );
        }

        const [
          summaryResult,
          factorsResult,
          scoresResult,
          contactsResult,
          interactionsResult,
          documentsResult,
          tasksResult,
        ] = await Promise.all([
          supabase
            .from("venue_score_summary")
            .select("*")
            .eq("account_id", accountCtx.accountId)
            .eq("venue_id", venueId)
            .maybeSingle(),
          supabase
            .from("score_factors")
            .select("id, label")
            .eq("account_id", accountCtx.accountId)
            .eq("active", true)
            .order("label", { ascending: true }),
          supabase
            .from("venue_scores")
            .select("factor_id, score")
            .eq("account_id", accountCtx.accountId)
            .eq("venue_id", venueId),
          supabase
            .from("contacts")
            .select("id, name, role, email, phone")
            .eq("account_id", accountCtx.accountId)
            .eq("venue_id", venueId)
            .order("created_at", { ascending: false }),
          supabase
            .from("interactions")
            .select("id, interaction_type, occurred_at, summary, next_action")
            .eq("account_id", accountCtx.accountId)
            .eq("venue_id", venueId)
            .order("occurred_at", { ascending: false }),
          supabase
            .from("documents")
            .select("id, file_name, doc_kind, uploaded_at")
            .eq("account_id", accountCtx.accountId)
            .eq("venue_id", venueId)
            .order("uploaded_at", { ascending: false }),
          supabase
            .from("tasks")
            .select("id, title, status, due_at")
            .eq("account_id", accountCtx.accountId)
            .eq("venue_id", venueId)
            .order("created_at", { ascending: false }),
        ]);

        const possibleErrors = [
          summaryResult.error,
          factorsResult.error,
          scoresResult.error,
          contactsResult.error,
          interactionsResult.error,
          documentsResult.error,
          tasksResult.error,
        ].filter(Boolean);
        if (possibleErrors.length > 0) {
          return NextResponse.json(
            {
              data: null,
              error: {
                code: "VENUE_PROFILE_FETCH_FAILED",
                message: possibleErrors[0]?.message ?? "Failed fetching profile",
              },
            },
            { status: 500 },
          );
        }

        const venueDto = {
          id: venue.id,
          accountId: venue.account_id,
          name: venue.name,
          city: venue.city,
          stateRegion: venue.state_region,
          address: venue.address,
          websiteUrl: venue.website_url,
          capacityMin: venue.capacity_min,
          capacityMax: venue.capacity_max,
          priceEstimateMin: venue.price_estimate_min,
          priceEstimateMax: venue.price_estimate_max,
          status: venue.status,
          notes: venue.notes,
          createdAt: venue.created_at,
          updatedAt: venue.updated_at,
        };

        const scoreByFactorId = new Map(
          (scoresResult.data ?? []).map((score) => [
            score.factor_id,
            score.score,
          ]),
        );
        const factors = (factorsResult.data ?? []).map((factor) => ({
          label: factor.label,
          score: scoreByFactorId.get(factor.id) ?? null,
          weight: 1,
        }));

        const profile = {
          weightedScore: summaryResult.data?.weighted_score ?? null,
          completenessPct: summaryResult.data?.completeness_pct ?? 0,
          scoredFactorCount: summaryResult.data?.scored_factor_count ?? 0,
          activeFactorCount: summaryResult.data?.active_factor_count ?? 0,
          factors,
          contacts: (contactsResult.data ?? []).map((contact) => ({
            id: contact.id,
            name: contact.name,
            role: contact.role,
            email: contact.email,
            phone: contact.phone,
          })),
          interactions: (interactionsResult.data ?? []).map((interaction) => ({
            id: interaction.id,
            interactionType: interaction.interaction_type,
            occurredAt: interaction.occurred_at,
            summary: interaction.summary,
            nextAction: interaction.next_action,
          })),
          documents: (documentsResult.data ?? []).map((document) => ({
            id: document.id,
            fileName: document.file_name,
            docKind: document.doc_kind,
            uploadedAt: document.uploaded_at,
          })),
          tasks: (tasksResult.data ?? []).map((task) => ({
            id: task.id,
            title: task.title,
            status: task.status,
            dueAt: task.due_at,
          })),
        };

        return NextResponse.json({
          data: {
            venue: venueDto,
            profile,
          },
          error: null,
        });
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: formatUnknownError(error),
        },
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { venueId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateVenueSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse("Invalid venue payload", parsed.error.flatten());
  }

  try {
    const accountCtx = await requireAccountFromRequest(request);
    if (!accountCtx.ok) {
      return accountCtx.response;
    }

    return await withOptionalSupabase<NextResponse>({
      onDemo: async () =>
        NextResponse.json({
          data: {
            id: venueId,
            ...parsed.data,
            updatedAt: new Date().toISOString(),
          },
          error: null,
        }),
      onSupabase: async (supabase) => {
        const updatePayload: Record<string, unknown> = {};
        if (parsed.data.name !== undefined) updatePayload.name = parsed.data.name;
        if (parsed.data.city !== undefined) updatePayload.city = parsed.data.city;
        if (parsed.data.stateRegion !== undefined)
          updatePayload.state_region = parsed.data.stateRegion;
        if (parsed.data.address !== undefined)
          updatePayload.address = parsed.data.address;
        if (parsed.data.websiteUrl !== undefined)
          updatePayload.website_url = parsed.data.websiteUrl;
        if (parsed.data.capacityMin !== undefined)
          updatePayload.capacity_min = parsed.data.capacityMin;
        if (parsed.data.capacityMax !== undefined)
          updatePayload.capacity_max = parsed.data.capacityMax;
        if (parsed.data.priceEstimateMin !== undefined)
          updatePayload.price_estimate_min = parsed.data.priceEstimateMin;
        if (parsed.data.priceEstimateMax !== undefined)
          updatePayload.price_estimate_max = parsed.data.priceEstimateMax;
        if (parsed.data.status !== undefined) updatePayload.status = parsed.data.status;
        if (parsed.data.notes !== undefined) updatePayload.notes = parsed.data.notes;

        const { data, error } = await supabase
          .from("venues")
          .update(updatePayload)
          .eq("account_id", accountCtx.accountId)
          .eq("id", venueId)
          .select("*")
          .single();
        if (error) {
          const status = error.code === "PGRST116" ? 404 : 500;
          return NextResponse.json(
            {
              data: null,
              error: {
                code: "VENUE_UPDATE_FAILED",
                message: error.message,
              },
            },
            { status },
          );
        }

        return NextResponse.json({
          data: {
            id: data.id,
            accountId: data.account_id,
            name: data.name,
            city: data.city,
            stateRegion: data.state_region,
            address: data.address,
            websiteUrl: data.website_url,
            capacityMin: data.capacity_min,
            capacityMax: data.capacity_max,
            priceEstimateMin: data.price_estimate_min,
            priceEstimateMax: data.price_estimate_max,
            status: data.status,
            notes: data.notes,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          },
          error: null,
        });
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: formatUnknownError(error),
        },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { venueId } = await params;
  try {
    const accountCtx = await requireAccountFromRequest(request);
    if (!accountCtx.ok) {
      return accountCtx.response;
    }

    return await withOptionalSupabase<NextResponse>({
      onDemo: async () =>
        NextResponse.json({
          data: { deleted: true, venueId },
          error: null,
        }),
      onSupabase: async (supabase) => {
        const { error } = await supabase
          .from("venues")
          .delete()
          .eq("account_id", accountCtx.accountId)
          .eq("id", venueId);
        if (error) {
          return NextResponse.json(
            {
              data: null,
              error: {
                code: "VENUE_DELETE_FAILED",
                message: error.message,
              },
            },
            { status: 500 },
          );
        }
        return NextResponse.json({
          data: { deleted: true, venueId },
          error: null,
        });
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: formatUnknownError(error),
        },
      },
      { status: 500 },
    );
  }
}
