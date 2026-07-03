import Link from "next/link";
import { listVenues } from "@/lib/db/queries/venues";
import { listVenuesQuerySchema } from "@/lib/validation/schemas";
import { VenueFilters } from "@/components/venues/VenueFilters";
import { VenueTable } from "@/components/venues/VenueTable";
import { EmptyState } from "@/components/common/EmptyState";

interface VenuesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VenuesPage({ searchParams }: VenuesPageProps) {
  const rawParams = await searchParams;
  const params = listVenuesQuerySchema.parse(rawParams);
  const venues = await listVenues(params);

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Wedding Venues</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track, score, and compare all of your venue options in one place.
          </p>
        </div>
        <Link
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          href="/venues/new"
        >
          Add venue
        </Link>
      </div>

      <VenueFilters search={params.search} city={params.city} status={params.status} />

      {venues.length === 0 ? (
        <EmptyState
          title="No venues yet"
          description="Create your first venue to start building your shortlist."
          ctaLabel="Create venue"
          ctaHref="/venues/new"
        />
      ) : (
        <VenueTable venues={venues} />
      )}
    </main>
  );
}
