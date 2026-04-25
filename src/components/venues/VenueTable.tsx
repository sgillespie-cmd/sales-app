import Link from "next/link";
import type { VenueListItem } from "@/lib/types/api";
import { VenueStatusBadge } from "@/components/venues/VenueStatusBadge";
import { WeightedScoreBadge } from "@/components/venues/WeightedScoreBadge";

interface VenueTableProps {
  venues: VenueListItem[];
}

export function VenueTable({ venues }: VenueTableProps) {
  if (venues.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        No venues found. Create your first venue to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="border-b border-slate-200 px-4 py-3 font-medium">Venue</th>
            <th className="border-b border-slate-200 px-4 py-3 font-medium">Location</th>
            <th className="border-b border-slate-200 px-4 py-3 font-medium">Status</th>
            <th className="border-b border-slate-200 px-4 py-3 font-medium">Budget</th>
            <th className="border-b border-slate-200 px-4 py-3 font-medium">Score</th>
            <th className="border-b border-slate-200 px-4 py-3 font-medium">Completeness</th>
            <th className="border-b border-slate-200 px-4 py-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {venues.map((venue) => {
            const location = [venue.city, venue.stateRegion].filter(Boolean).join(", ") || "—";
            const budget =
              venue.priceEstimateMin != null && venue.priceEstimateMax != null
                ? `$${venue.priceEstimateMin.toLocaleString()} - $${venue.priceEstimateMax.toLocaleString()}`
                : "—";

            return (
              <tr key={venue.id} className="hover:bg-slate-50">
                <td className="border-b border-slate-100 px-4 py-3">
                  <Link href={`/venues/${venue.id}`} className="font-medium text-slate-900 hover:underline">
                    {venue.name}
                  </Link>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-slate-700">{location}</td>
                <td className="border-b border-slate-100 px-4 py-3">
                  <VenueStatusBadge status={venue.status} />
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-slate-700">{budget}</td>
                <td className="border-b border-slate-100 px-4 py-3">
                  <WeightedScoreBadge score={venue.weightedScore} />
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                  {venue.completenessPct.toFixed(0)}%
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                  {new Date(venue.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
