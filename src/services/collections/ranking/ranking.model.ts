//  Avg points per match - Avg points per turn - Total points - Total finished matches - Win/Loss ratio
export type Ranking = {
  playerId: string;
  totalPoints: number;
  avgPointsPerMatch: number;
  avgPointsPerTurn: number;
  finishedMatches: number;
  wins: number;
  losses: number;
  winRatio: number;
};
