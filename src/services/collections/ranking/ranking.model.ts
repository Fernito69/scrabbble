//  Avg points per match - Avg points per turn - Total points - Total finished matches - Win/Loss ratio
export type Ranking = {
  playerId: string;
  totalPoints: number;
  // Match points ratio: avg (player's points per match / total points per match)
  avgMatchPointsRatio: number;
  avgPointsPerTurn: number;
  finishedMatches: number;
  wins: number;
  losses: number;
  winRatio: number;
  WIDX?: number;
};
