import { UserAvatar } from "@/components/UserAvatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { useTranslation } from "react-i18next";

interface ScoreRow {
  turn: number;
  playerScores: number[];
}

export const ScoreBoard = () => {
  const { t } = useTranslation();
  const { state } = useGameContext();
  const { user } = useAuth();

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
            <TableHead>{t("scoreBoard.turn")}</TableHead>
            {presentPlayerIds.map((id, i) => (
              <TableHead key={i}>
                <UserAvatar
                  userId={id!}
                  diameter={24}
                  glow={state.currentPlayerId === id && user?.uid === id}
                  shadingIndex={i}
                />
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
            <TableCell>{t("scoreBoard.total")}</TableCell>
            {presentPlayerIds.map((id, i) => (
              <TableCell key={i}>{state.score.total[id] ?? 0}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
