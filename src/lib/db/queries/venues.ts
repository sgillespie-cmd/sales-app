import { notFound } from "next/navigation";
import type { ListVenuesQuery, Venue, VenueListItem } from "@/lib/types/api";
import { hasSupabaseEnv } from "@/lib/db/supabaseClient";

const DEMO_ACCOUNT_ID = "00000000-0000-0000-0000-000000000001";

const demoVenues: VenueListItem[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    accountId: DEMO_ACCOUNT_ID,
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
  {
    id: "10000000-0000-0000-0000-000000000002",
    accountId: DEMO_ACCOUNT_ID,
    name: "Riverside Manor",
    city: "Greenville",
    stateRegion: "SC",
    address: "88 River Road, Greenville, SC",
    websiteUrl: "https://example.com/riverside",
    capacityMin: 120,
    capacityMax: 250,
    priceEstimateMin: 16000,
    priceEstimateMax: 30000,
    status: "toured",
    notes: "Strong food package and on-site guest lodging.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    weightedScore: 7.9,
    completenessPct: 100,
    scoredFactorCount: 6,
    activeFactorCount: 6,
  },
];

function applyVenueFilters(venues: VenueListItem[], query: ListVenuesQuery): VenueListItem[] {
  let filtered = [...venues];

  if (query.search) {
    const term = query.search.toLowerCase();
    filtered = filtered.filter(
      (venue) =>
        venue.name.toLowerCase().includes(term) ||
        venue.city?.toLowerCase().includes(term) ||
        venue.stateRegion?.toLowerCase().includes(term),
    );
  }

  if (query.city) {
    const city = query.city.toLowerCase();
    filtered = filtered.filter((venue) => venue.city?.toLowerCase() === city);
  }

  if (query.status) {
    filtered = filtered.filter((venue) => venue.status === query.status);
  }

  if (query.minScore !== undefined) {
    filtered = filtered.filter((venue) => (venue.weightedScore ?? 0) >= query.minScore!);
  }

  switch (query.sort) {
    case "score_desc":
      filtered.sort((a, b) => (b.weightedScore ?? 0) - (a.weightedScore ?? 0));
      break;
    case "price_asc":
      filtered.sort((a, b) => (a.priceEstimateMin ?? Number.MAX_SAFE_INTEGER) - (b.priceEstimateMin ?? Number.MAX_SAFE_INTEGER));
      break;
    case "price_desc":
      filtered.sort((a, b) => (b.priceEstimateMax ?? 0) - (a.priceEstimateMax ?? 0));
      break;
    case "name_asc":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "updated_desc":
    default:
      filtered.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
      break;
  }

  return filtered;
}

export async function listVenues(query: ListVenuesQuery): Promise<VenueListItem[]> {
  const filtered = applyVenueFilters(demoVenues, query);
  const offset = (query.page - 1) * query.pageSize;
  return filtered.slice(offset, offset + query.pageSize);
}

export async function getVenueById(venueId: string): Promise<Venue> {
  if (!hasSupabaseEnv()) {
    const venue = demoVenues.find((item) => item.id === venueId);
    if (!venue) {
      notFound();
    }
    return {
      id: venue.id,
      accountId: venue.accountId,
      name: venue.name,
      city: venue.city,
      stateRegion: venue.stateRegion,
      address: venue.address,
      websiteUrl: venue.websiteUrl,
      capacityMin: venue.capacityMin,
      capacityMax: venue.capacityMax,
      priceEstimateMin: venue.priceEstimateMin,
      priceEstimateMax: venue.priceEstimateMax,
      status: venue.status,
      notes: venue.notes,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
    };
  }

  // Supabase-backed read can be wired in next iteration.
  const venue = demoVenues.find((item) => item.id === venueId);
  if (!venue) {
    notFound();
  }
  return {
    id: venue.id,
    accountId: venue.accountId,
    name: venue.name,
    city: venue.city,
    stateRegion: venue.stateRegion,
    address: venue.address,
    websiteUrl: venue.websiteUrl,
    capacityMin: venue.capacityMin,
    capacityMax: venue.capacityMax,
    priceEstimateMin: venue.priceEstimateMin,
    priceEstimateMax: venue.priceEstimateMax,
    status: venue.status,
    notes: venue.notes,
    createdAt: venue.createdAt,
    updatedAt: venue.updatedAt,
  };
}

export interface VenueProfileData {
  weightedScore: number | null;
  completenessPct: number;
  scoredFactorCount: number;
  activeFactorCount: number;
  factors: Array<{ label: string; score: number | null; weight: number }>;
  contacts: Array<{ id: string; name: string; role: string | null; email: string | null; phone: string | null }>;
  interactions: InteractionItem[];
  documents: Array<{ id: string; fileName: string; docKind: string; uploadedAt: string }>;
  tasks: Array<{ id: string; title: string; status: "open" | "in_progress" | "done"; dueAt: string | null }>;
}

export interface InteractionItem {
  id: string;
  interactionType: "call" | "email" | "tour" | "meeting" | "note";
  occurredAt: string;
  summary: string;
  nextAction: string | null;
}

const demoProfileByVenueId: Record<string, VenueProfileData> = {
  "10000000-0000-0000-0000-000000000001": {
    weightedScore: 8.4,
    completenessPct: 83.3,
    scoredFactorCount: 5,
    activeFactorCount: 6,
    factors: [
      { label: "Location", score: 9, weight: 1 },
      { label: "Cost", score: 7, weight: 1.2 },
      { label: "Aesthetic", score: 9, weight: 1 },
      { label: "Lodging", score: 6, weight: 0.8 },
      { label: "Food", score: 8, weight: 1 },
      { label: "Flexibility", score: null, weight: 0.7 },
    ],
    contacts: [
      {
        id: "c1",
        name: "Jamie Coordinator",
        role: "Event Manager",
        email: "jamie@greenhouse.example.com",
        phone: "(555) 111-0011",
      },
    ],
    interactions: [
      {
        id: "i1",
        interactionType: "call",
        occurredAt: new Date().toISOString(),
        summary: "Discussed available spring dates and rain backup plan.",
        nextAction: "Request detailed catering package.",
      },
    ],
    documents: [
      {
        id: "d1",
        fileName: "greenhouse-brochure.pdf",
        docKind: "brochure",
        uploadedAt: new Date().toISOString(),
      },
    ],
    tasks: [
      {
        id: "t1",
        title: "Schedule in-person tour",
        status: "open",
        dueAt: null,
      },
    ],
  },
  "10000000-0000-0000-0000-000000000002": {
    weightedScore: 7.9,
    completenessPct: 100,
    scoredFactorCount: 6,
    activeFactorCount: 6,
    factors: [
      { label: "Location", score: 7, weight: 1 },
      { label: "Cost", score: 6, weight: 1.2 },
      { label: "Aesthetic", score: 8, weight: 1 },
      { label: "Lodging", score: 9, weight: 0.8 },
      { label: "Food", score: 9, weight: 1 },
      { label: "Flexibility", score: 8, weight: 0.7 },
    ],
    contacts: [
      {
        id: "c2",
        name: "Alex Sales",
        role: "Sales Lead",
        email: "alex@riverside.example.com",
        phone: "(555) 111-0022",
      },
    ],
    interactions: [],
    documents: [],
    tasks: [
      {
        id: "t2",
        title: "Review draft contract terms",
        status: "in_progress",
        dueAt: null,
      },
    ],
  },
};

export async function getVenueProfileData(venueId: string): Promise<VenueProfileData> {
  const profile = demoProfileByVenueId[venueId];
  if (!profile) {
    notFound();
  }
  return profile;
}

export function getDemoVenuesList(): VenueListItem[] {
  return [...demoVenues];
}
