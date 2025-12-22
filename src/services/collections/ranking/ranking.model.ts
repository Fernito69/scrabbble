//  Avg points per match - Avg points per turn - Total points - Total finished matches - Win/Loss ratio

export type PointsPerNumPlayer = {
  [numPlayers in 2 | 3 | 4]?: number;
};

export type Ranking = {
  playerId: string;
  totalPoints: number;
  // Match points ratio: avg (player's points per match / total points per match)
  avgMatchPointsRatio: PointsPerNumPlayer;
  avgPointsPerTurn: number;
  avgPointsPerMatch: PointsPerNumPlayer;
  finishedMatches: number;
  wins: number;
  losses: number;
  winRatio: number;
};
