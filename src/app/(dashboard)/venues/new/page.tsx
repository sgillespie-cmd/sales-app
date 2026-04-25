import Link from "next/link";
import { VenueForm } from "@/components/venues/VenueForm";

export default function NewVenuePage() {
  const demoAccountId = "00000000-0000-0000-0000-000000000001";
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Add Venue</h1>
        <p className="text-sm text-slate-600">
          Fill this form to track a new venue in your shortlist.
        </p>
      </header>

      <VenueForm accountId={demoAccountId} />

      <Link
        href="/venues"
        className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        Back to venues
      </Link>
    </div>
  );
}
