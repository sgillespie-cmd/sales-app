"use client";

type ScoreFactor = {
  label: string;
  score: number | null;
  weight: number;
};

type ScoreBreakdownProps = {
  factors: ScoreFactor[];
};

export function ScoreBreakdown({ factors }: ScoreBreakdownProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Factor Breakdown</h3>
      <div className="space-y-3">
        {factors.map((factor) => {
          const pct = factor.score ? (factor.score / 10) * 100 : 0;
          return (
            <div key={factor.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{factor.label}</span>
                <span className="text-slate-500">
                  {factor.score ?? "—"} / 10 (w={factor.weight})
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
