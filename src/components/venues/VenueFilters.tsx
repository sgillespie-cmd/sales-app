"use client";

type Props = {
  search?: string;
  city?: string;
  status?: string;
};

export function VenueFilters({ search, city, status }: Props) {
  return (
    <form
      action="/venues"
      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4"
    >
      <input
        type="text"
        name="search"
        defaultValue={search}
        placeholder="Search venues..."
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        type="text"
        name="city"
        defaultValue={city}
        placeholder="City"
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <select
        name="status"
        defaultValue={status ?? ""}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">Any status</option>
        <option value="researching">Researching</option>
        <option value="contacted">Contacted</option>
        <option value="toured">Toured</option>
        <option value="shortlisted">Shortlisted</option>
        <option value="rejected">Rejected</option>
        <option value="selected">Selected</option>
      </select>
      <button
        type="submit"
        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
      >
        Apply filters
      </button>
    </form>
  );
}
