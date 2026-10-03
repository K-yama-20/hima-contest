export const GAME_POINT_RATES = {
  tap: 10,
  hold: 3,
  scroll: 100_000,
  circle: 5,
  marathon: 10,
} as const;

export type GameId =
  keyof typeof GAME_POINT_RATES;

export function calculateEstimatedHimaPoint(
  gameId: GameId,
  rawScore: number
): number {
  const rate =
    GAME_POINT_RATES[gameId];

  return Math.floor(
    rawScore / rate
  );
}
