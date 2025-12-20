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
import { cn } from "@/lib/utils";
import { getWinningPlayerIdAndScore } from "@/services/collections/game/game.utils";
import { useTranslation } from "react-i18next";
import { YourTurnMessage } from "../YourTurnMessage/YourTurnMessage";

interface ScoreRow {
  turn: number;
  playerScores: number[];
}

export const ScoreBoard = () => {
  const { t } = useTranslation();
  const { state, isMyTurn } = useGameContext();
  const { user } = useAuth();

  if (!state?.score || !state.gameStarted) return null;

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
  const borderCn = "border-l ";

  const [winningPlayerId] = getWinningPlayerIdAndScore(state);

  const isHighlighted = (id: string) => {
    return (
      (state.gameOver && winningPlayerId === id) ||
      (!state.gameOver && state.currentPlayerId === id)
    );
  };

  // Render
  return (
    <div className="rounded-lg border w-1/2 h-fit overflow-hidden">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className={cn(borderCn, "w-6")}>
              {t("scoreBoard.turn")}
            </TableHead>
            {presentPlayerIds.map((id, i) => {
              return (
                <TableHead
                  key={i}
                  className={isHighlighted(id) ? "bg-yellow-200" : borderCn}
                >
                  <div className="flex flex-row items-center justify-center gap-2">
                    <UserAvatar userId={id!} diameter={24} shadingIndex={i} />
                    {isMyTurn &&
                      id === user!.uid &&
                      !state.currentVote &&
                      !state.gameOver && <YourTurnMessage />}
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {aggregateScores.map(({ turn, playerScores }, i) => {
            const playerCn = i % 2 === 0 ? "bg-yellow-50" : "bg-yellow-100";
            const otherCn = i % 2 === 0 ? "bg-white" : "bg-gray-50";
            return (
              <TableRow key={i}>
                <TableCell className={cn(otherCn, borderCn)}>
                  {turn + 1}
                </TableCell>
                {playerScores.map((score, j) => (
                  <TableCell
                    className={cn(
                      j ===
                        state.playerIds.findIndex((id) =>
                          isHighlighted(id ?? "")
                        )
                        ? playerCn
                        : otherCn,
                      borderCn
                    )}
                    key={j}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      {score === 0 ? "-" : score}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
          <TableRow className="bg-gray-100 font-semibold">
            <TableCell>{t("scoreBoard.total")}</TableCell>
            {presentPlayerIds.map((id, i) => (
              <TableCell
                key={i}
                className={state.currentPlayerId === id ? "bg-yellow-200" : ""}
              >
                <div className="flex-1 flex items-center justify-center">
                  {state.score.total[id] ?? 0}
                </div>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
