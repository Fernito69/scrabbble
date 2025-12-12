import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGameContext } from "@/contexts/GameState.context";
import { PlayerBadge } from "../PlayerBadge/PlayerBadge";

interface ScoreRow {
  turn: number;
  playerScores: number[];
}

export const ScoreBoard = () => {
  const { state } = useGameContext();

  if (!state?.score) return null;

  // Consts
  const aggregateScores: ScoreRow[] = Array(state.currentTurn)
    .fill(0)
    .map((_, turn) => {
      return {
        turn,
        playerScores: state.playerIds
          .filter(Boolean)
          .map(
            (id) =>
              state.score.perTurn.find(
                (s) => s.playerId === id && s.turn === turn + 1
              )?.score ?? 0
          ),
      };
    });

  const presentPlayerIds = state.playerIds.filter(Boolean) as string[];

  // Render
  return (
    <div className="rounded-lg border w-1/2">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Turn</TableHead>
            {presentPlayerIds.map((id, i) => (
              <TableHead key={i}>
                <PlayerBadge playerId={id!} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {aggregateScores.map(({ turn, playerScores }, i) => (
            <TableRow key={i}>
              <TableCell>{turn + 1}</TableCell>
              {playerScores.map((score, j) => (
                <TableCell key={j}>{score === 0 ? "-" : score}</TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow className="bg-gray-100 font-semibold">
            <TableCell>TOTAL</TableCell>
            {presentPlayerIds.map((id, i) => (
              <TableCell key={i}>{state.score.total[id] ?? 0}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
