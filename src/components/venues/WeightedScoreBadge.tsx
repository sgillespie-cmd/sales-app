"use client";

type WeightedScoreBadgeProps = {
  score: number | null;
  completenessPct?: number;
};

function scoreTone(score: number | null): string {
  if (score === null) {
    return "bg-slate-100 text-slate-700 border-slate-200";
  }
  if (score >= 8) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (score >= 6) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  return "bg-rose-100 text-rose-700 border-rose-200";
}

export function WeightedScoreBadge({ score, completenessPct }: WeightedScoreBadgeProps) {
  return (
    <span
      className={`inline-flex min-w-20 items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold ${scoreTone(score)}`}
    >
      {score === null ? "N/A" : `${score.toFixed(1)} / 10`}
      {completenessPct !== undefined ? ` (${Math.round(completenessPct)}%)` : ""}
    </span>
  );
}
