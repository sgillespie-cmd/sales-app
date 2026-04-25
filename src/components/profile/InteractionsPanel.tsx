"use client";

import type { InteractionItem } from "@/lib/db/queries/venues";

type InteractionsPanelProps = {
  venueId: string;
  items: InteractionItem[];
};

export function InteractionsPanel({ venueId, items }: InteractionsPanelProps) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="text-lg font-semibold">Interactions</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">Venue ID: {venueId}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--muted)]">
          No interactions logged yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {items.map((interaction) => (
            <li
              key={interaction.id}
              className="rounded-md border border-[var(--border)] p-3 text-sm"
            >
              <p className="font-medium capitalize">{interaction.interactionType}</p>
              <p className="text-xs text-[var(--muted)]">
                {new Date(interaction.occurredAt).toLocaleString()}
              </p>
              <p className="mt-2">{interaction.summary}</p>
              {interaction.nextAction ? (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Next action: {interaction.nextAction}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
