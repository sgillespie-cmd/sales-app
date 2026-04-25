import { ScoreBreakdown } from "@/components/venues/ScoreBreakdown";

interface ScoringPanelProps {
  weightedScore: number | null;
  completenessPct: number;
  factors: Array<{ label: string; score: number | null; weight: number }>;
}

export function ScoringPanel({
  weightedScore,
  completenessPct,
  factors,
}: ScoringPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-slate-900">Scoring</h2>
      <p className="mt-1 text-sm text-slate-600">
        Weighted score: {weightedScore?.toFixed(2) ?? "—"} / 10 · Completeness:{" "}
        {completenessPct.toFixed(1)}%
      </p>
      <ScoreBreakdown factors={factors} />
    </section>
  );
}
