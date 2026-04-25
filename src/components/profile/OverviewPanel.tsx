interface OverviewPanelProps {
  venue: {
    name: string;
    city: string | null;
    stateRegion: string | null;
    address: string | null;
    websiteUrl: string | null;
    capacityMin: number | null;
    capacityMax: number | null;
    priceEstimateMin: number | null;
    priceEstimateMax: number | null;
    notes: string | null;
  };
}

function formatRange(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Not set";
  if (min != null && max != null) return `${min} - ${max}`;
  if (min != null) return `${min}+`;
  return `Up to ${max}`;
}

export function OverviewPanel({ venue }: OverviewPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
      <dl className="mt-4 grid gap-2 sm:grid-cols-[160px_1fr]">
        <dt className="text-slate-500">Location</dt>
        <dd className="m-0">
          {[venue.city, venue.stateRegion].filter(Boolean).join(", ") || "Not set"}
        </dd>

        <dt className="text-slate-500">Address</dt>
        <dd className="m-0">{venue.address ?? "Not set"}</dd>

        <dt className="text-slate-500">Website</dt>
        <dd className="m-0">
          {venue.websiteUrl ? (
            <a href={venue.websiteUrl} target="_blank" rel="noreferrer">
              {venue.websiteUrl}
            </a>
          ) : (
            "Not set"
          )}
        </dd>

        <dt className="text-slate-500">Capacity</dt>
        <dd className="m-0">{formatRange(venue.capacityMin, venue.capacityMax)}</dd>

        <dt className="text-slate-500">Price estimate</dt>
        <dd className="m-0">
          {venue.priceEstimateMin != null || venue.priceEstimateMax != null
            ? `$${formatRange(venue.priceEstimateMin, venue.priceEstimateMax)}`
            : "Not set"}
        </dd>
      </dl>

      <h3 className="mt-5 text-sm font-semibold text-slate-900">Notes</h3>
      <p className="mt-1 text-sm text-slate-600">{venue.notes ?? "No notes yet."}</p>
    </section>
  );
}
