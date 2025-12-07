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

  // Conts
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

  // Render
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Turn</TableHead>
            {state.playerIds.filter(Boolean).map((id, i) => (
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
                <TableCell key={j}>{score}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
