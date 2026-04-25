"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { venueStatusEnum } from "@/lib/validation/schemas";
import type { VenueStatus } from "@/lib/types/api";

const venueStatuses = venueStatusEnum.options;

interface VenueFormProps {
  accountId: string;
}

export function VenueForm({ accountId }: VenueFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    const payload = {
      accountId,
      name: String(formData.get("name") ?? ""),
      city: String(formData.get("city") ?? "") || null,
      stateRegion: String(formData.get("stateRegion") ?? "") || null,
      websiteUrl: String(formData.get("websiteUrl") ?? "") || null,
      status: (String(formData.get("status") ?? "researching") as VenueStatus) ?? "researching",
      notes: String(formData.get("notes") ?? "") || null,
    };

    const response = await fetch("/api/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
      setError(data?.error?.message ?? "Unable to create venue.");
      setIsSubmitting(false);
      return;
    }

    const result = (await response.json()) as { data: { id: string } };
    router.push(`/venues/${result.data.id}`);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Add a venue</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            name="name"
            placeholder="The Greenhouse Estate"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" name="status" defaultValue="researching">
            {venueStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">City</span>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" name="city" placeholder="Asheville" />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">State/Region</span>
          <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" name="stateRegion" placeholder="NC" />
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-sm font-medium text-slate-700">Website</span>
        <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" name="websiteUrl" placeholder="https://venue.com" type="url" />
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium text-slate-700">Notes</span>
        <textarea
          className="h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          name="notes"
          placeholder="Initial impressions, questions, or package notes..."
        />
      </label>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <button
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Saving..." : "Create venue"}
      </button>
    </form>
  );
}
