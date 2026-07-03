export interface ScoreInput {
  score: number | null;
  weight: number;
}

export interface WeightedScoreResult {
  weightedScore: number | null;
  completenessPct: number;
  scoredFactorCount: number;
  activeFactorCount: number;
}

export function calculateWeightedScore(items: ScoreInput[]): WeightedScoreResult {
  const activeFactorCount = items.length;
  const scoredItems = items.filter((item) => item.score !== null);
  const scoredFactorCount = scoredItems.length;

  const weightedNumerator = scoredItems.reduce((acc, item) => acc + (item.score ?? 0) * item.weight, 0);
  const weightedDenominator = scoredItems.reduce((acc, item) => acc + item.weight, 0);

  const weightedScore = weightedDenominator > 0 ? Number((weightedNumerator / weightedDenominator).toFixed(2)) : null;
  const completenessPct = activeFactorCount > 0 ? Number(((scoredFactorCount / activeFactorCount) * 100).toFixed(1)) : 0;

  return {
    weightedScore,
    completenessPct,
    scoredFactorCount,
    activeFactorCount,
  };
}
