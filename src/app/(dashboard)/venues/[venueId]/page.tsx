import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactsPanel } from "@/components/profile/ContactsPanel";
import { DocumentsPanel } from "@/components/profile/DocumentsPanel";
import { InteractionsPanel } from "@/components/profile/InteractionsPanel";
import { OverviewPanel } from "@/components/profile/OverviewPanel";
import { ScoringPanel } from "@/components/profile/ScoringPanel";
import { TasksPanel } from "@/components/profile/TasksPanel";
import { getVenueById, getVenueProfileData } from "@/lib/db/queries/venues";

interface VenuePageProps {
  params: Promise<{ venueId: string }>;
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { venueId } = await params;
  const venue = await getVenueById(venueId);
  const profile = await getVenueProfileData(venueId);

  if (!venue) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{venue.name}</h1>
          <p className="text-sm text-slate-600">
            {venue.city ?? "City TBD"} {venue.stateRegion ? `, ${venue.stateRegion}` : ""}
          </p>
        </div>
        <Link
          href="/venues"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Back to venues
        </Link>
      </div>

      <OverviewPanel venue={venue} />
      <ScoringPanel
        weightedScore={profile.weightedScore}
        completenessPct={profile.completenessPct}
        factors={profile.factors}
      />
      <ContactsPanel contacts={profile.contacts} />
      <InteractionsPanel venueId={venue.id} items={profile.interactions} />
      <DocumentsPanel venueId={venue.id} documents={profile.documents} />
      <TasksPanel tasks={profile.tasks} />
    </div>
  );
}
