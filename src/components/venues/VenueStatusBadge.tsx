import type { VenueStatus } from "@/lib/types/api";

const statusLabel: Record<VenueStatus, string> = {
  researching: "Researching",
  contacted: "Contacted",
  toured: "Toured",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  selected: "Selected",
};

const statusClass: Record<VenueStatus, string> = {
  researching: "bg-slate-100 text-slate-700 border-slate-200",
  contacted: "bg-blue-100 text-blue-700 border-blue-200",
  toured: "bg-purple-100 text-purple-700 border-purple-200",
  shortlisted: "bg-amber-100 text-amber-700 border-amber-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
  selected: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

interface VenueStatusBadgeProps {
  status: VenueStatus;
}

export function VenueStatusBadge({ status }: VenueStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusClass[status]}`}
    >
      {statusLabel[status]}
    </span>
  );
}
