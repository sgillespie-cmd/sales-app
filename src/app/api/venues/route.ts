import { NextRequest, NextResponse } from "next/server";

import type { ApiResponse, VenueListItem } from "@/lib/types/api";
import { createVenueSchema, listVenuesQuerySchema } from "@/lib/validation/schemas";
import { parseUuidOrNull, requireAuthenticatedAccount } from "@/lib/api/auth";
import { errorResponse, ensureErrorMessage } from "@/lib/api/errors";
import { hasSupabaseEnv } from "@/lib/db/supabaseClient";
import { listVenues } from "@/lib/db/queries/venues";

export async function GET(request: NextRequest) {
  const accountIdFromQuery = parseUuidOrNull(request.nextUrl.searchParams.get("accountId"));
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = listVenuesQuerySchema.safeParse(params);
  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Invalid list venues query parameters.",
      400,
      parsed.error.flatten(),
    );
  }

  if (!hasSupabaseEnv()) {
    const venues = await listVenues(parsed.data);
    return NextResponse.json<ApiResponse<VenueListItem[]>>({
      data: venues,
      error: null,
    });
  }

  try {
    const { supabase, accountId } = await requireAuthenticatedAccount(request, accountIdFromQuery);
    const query = parsed.data;

    let dbQuery = supabase
      .from("venues")
      .select(
        `
          id,
          account_id,
          name,
          city,
          state_region,
          address,
          website_url,
          capacity_min,
          capacity_max,
          price_estimate_min,
          price_estimate_max,
          status,
          notes,
          created_at,
          updated_at
        `,
      )
      .eq("account_id", accountId);

    if (query.search) {
      dbQuery = dbQuery.ilike("name", `%${query.search}%`);
    }
    if (query.city) {
      dbQuery = dbQuery.eq("city", query.city);
    }
    if (query.status) {
      dbQuery = dbQuery.eq("status", query.status);
    }

    switch (query.sort) {
      case "name_asc":
        dbQuery = dbQuery.order("name", { ascending: true });
        break;
      case "price_asc":
        dbQuery = dbQuery.order("price_estimate_min", { ascending: true, nullsFirst: false });
        break;
      case "price_desc":
        dbQuery = dbQuery.order("price_estimate_max", { ascending: false, nullsFirst: false });
        break;
      case "updated_desc":
      case "score_desc":
      default:
        dbQuery = dbQuery.order("updated_at", { ascending: false });
        break;
    }

    const offset = (query.page - 1) * query.pageSize;
    dbQuery = dbQuery.range(offset, offset + query.pageSize - 1);

    const { data: venues, error: venuesError } = await dbQuery;
    if (venuesError) {
      return errorResponse("VENUES_LIST_FAILED", venuesError.message, 500);
    }

    const { data: summaries, error: summaryError } = await supabase
      .from("venue_score_summary")
      .select("venue_id, weighted_score, completeness_pct, scored_factor_count, active_factor_count")
      .eq("account_id", accountId);

    if (summaryError) {
      return errorResponse("VENUE_SUMMARY_FAILED", summaryError.message, 500);
    }

    const summaryByVenueId = new Map(
      (summaries ?? []).map((summary) => [summary.venue_id as string, summary]),
    );

    const mapped = (venues ?? [])
      .map((venue) => {
        const summary = summaryByVenueId.get(venue.id as string);
        const item: VenueListItem = {
          id: venue.id as string,
          accountId: venue.account_id as string,
          name: venue.name as string,
          city: (venue.city as string | null) ?? null,
          stateRegion: (venue.state_region as string | null) ?? null,
          address: (venue.address as string | null) ?? null,
          websiteUrl: (venue.website_url as string | null) ?? null,
          capacityMin: (venue.capacity_min as number | null) ?? null,
          capacityMax: (venue.capacity_max as number | null) ?? null,
          priceEstimateMin: (venue.price_estimate_min as number | null) ?? null,
          priceEstimateMax: (venue.price_estimate_max as number | null) ?? null,
          status: venue.status as VenueListItem["status"],
          notes: (venue.notes as string | null) ?? null,
          createdAt: venue.created_at as string,
          updatedAt: venue.updated_at as string,
          weightedScore: (summary?.weighted_score as number | null | undefined) ?? null,
          completenessPct: Number((summary?.completeness_pct as number | undefined) ?? 0),
          scoredFactorCount: Number((summary?.scored_factor_count as number | undefined) ?? 0),
          activeFactorCount: Number((summary?.active_factor_count as number | undefined) ?? 0),
        };
        return item;
      })
      .filter((item) => (query.minScore !== undefined ? (item.weightedScore ?? 0) >= query.minScore : true));

    if (query.sort === "score_desc") {
      mapped.sort((a, b) => (b.weightedScore ?? 0) - (a.weightedScore ?? 0));
    }

    return NextResponse.json<ApiResponse<VenueListItem[]>>({
      data: mapped,
      error: null,
    });
  } catch (error) {
    return errorResponse("VENUES_LIST_FAILED", ensureErrorMessage(error), 500);
  }
}

export async function POST(request: NextRequest) {
  const accountIdFromQuery = parseUuidOrNull(request.nextUrl.searchParams.get("accountId"));
  const body = await request.json().catch(() => null);
  const parsed = createVenueSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Invalid create venue payload.",
      400,
      parsed.error.flatten(),
    );
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json<ApiResponse<{ id: string } & typeof parsed.data>>(
      {
        data: {
          ...parsed.data,
          id: `demo-${Date.now()}`,
        },
        error: null,
      },
      { status: 201 },
    );
  }

  try {
    const { supabase, accountId } = await requireAuthenticatedAccount(
      request,
      accountIdFromQuery ?? parsed.data.accountId,
    );
    const payload = parsed.data;
    if (payload.accountId !== accountId) {
      return errorResponse("ACCOUNT_MISMATCH", "Payload accountId does not match authenticated account.", 403);
    }

    const { data, error } = await supabase
      .from("venues")
      .insert({
        account_id: payload.accountId,
        name: payload.name,
        city: payload.city ?? null,
        state_region: payload.stateRegion ?? null,
        address: payload.address ?? null,
        website_url: payload.websiteUrl ?? null,
        capacity_min: payload.capacityMin ?? null,
        capacity_max: payload.capacityMax ?? null,
        price_estimate_min: payload.priceEstimateMin ?? null,
        price_estimate_max: payload.priceEstimateMax ?? null,
        status: payload.status ?? "researching",
        notes: payload.notes ?? null,
      })
      .select("id")
      .single();

    if (error) {
      return errorResponse("VENUE_CREATE_FAILED", error.message, 500);
    }

    return NextResponse.json<ApiResponse<{ id: string } & typeof parsed.data>>(
      {
        data: {
          ...payload,
          id: data.id as string,
        },
        error: null,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse("VENUE_CREATE_FAILED", ensureErrorMessage(error), 500);
  }
}
