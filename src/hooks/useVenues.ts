"use client";

import { useState } from "react";
import type { ApiResponse, VenueListItem } from "@/lib/types/api";

type UseVenuesState = {
  data: VenueListItem[];
  isLoading: boolean;
  error: string | null;
};

export function useVenues(query = "") {
  void query;
  const [state, setState] = useState<UseVenuesState>({
    data: [
      {
        id: "10000000-0000-0000-0000-000000000001",
        accountId: "00000000-0000-0000-0000-000000000001",
        name: "The Greenhouse Estate",
        city: "Asheville",
        stateRegion: "NC",
        address: "12 Garden Lane, Asheville, NC",
        websiteUrl: "https://example.com/greenhouse",
        capacityMin: 80,
        capacityMax: 180,
        priceEstimateMin: 12000,
        priceEstimateMax: 22000,
        status: "contacted",
        notes: "Great natural lighting and indoor/outdoor options.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        weightedScore: 8.4,
        completenessPct: 83.3,
        scoredFactorCount: 5,
        activeFactorCount: 6,
      },
    ],
    isLoading: false,
    error: null,
  });

  const reload = async () => {
    // Starter hook returns demo state only. This callback preserves API for future integration.
    const payload: ApiResponse<VenueListItem[]> = {
      data: state.data,
      error: null,
    };
    setState((current) => ({
      ...current,
      data: payload.data,
    }));
  };

  return { ...state, reload };
}
