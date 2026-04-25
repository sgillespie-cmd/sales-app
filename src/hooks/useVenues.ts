"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApiResponse, VenueListItem } from "@/lib/types/api";

type UseVenuesState = {
  data: VenueListItem[];
  isLoading: boolean;
  error: string | null;
};

export function useVenues(query = "") {
  const [state, setState] = useState<UseVenuesState>({
    data: [],
    isLoading: true,
    error: null,
  });

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    return `/api/venues?${params.toString()}`;
  }, [query]);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const payload = (await response.json()) as ApiResponse<VenueListItem[]>;
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? "Failed to load venues");
      }
      setState({ data: payload.data, isLoading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setState({ data: [], isLoading: false, error: message });
    }
  }, [endpoint]);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  return { ...state, reload: load };
}
