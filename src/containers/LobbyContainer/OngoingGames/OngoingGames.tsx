import { BoardDiorama } from "@/components/BoardDiorama/BoardDiorama";
import { OverlayWithLoader } from "@/components/OverlayWithLoader/OverlayWithLoader";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlayerBadge } from "@/containers/PlayfieldContainer/PlayerBadge/PlayerBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useGetLastNPlayerGames } from "@/services/collections/game/game.hooks";
import { useGetPlayerName } from "@/services/collections/userConfig/userConfig.hooks";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const OngoingGames = () => {
  // Data
  const { playerGames, error } = useGetLastNPlayerGames();
  const { user } = useAuth();

  // Hooks
  const { t } = useTranslation();
  const getPlayerName = useGetPlayerName();
  const navigate = useNavigate();

  // Render
  return (
    <div className="flex flex-col gap-4 mt-6">
      <Separator />
      <h2 className="text-lg font-bold">{t("lobby.yourGames")}</h2>
      <div className="flex flex-col gap-2 rounded-lg border border-input relative min-h-[200px]">
        {!playerGames && !error && (
          <OverlayWithLoader>
            <i>{t("lobby.loadingGames")}</i>
          </OverlayWithLoader>
        )}
        <Table className="text-xs">
          <TableHeader className="bg-muted text-xs">
            <TableRow>
              <TableHead />
              <TableHead>{t("lobby.createdAt")}</TableHead>
              <TableHead>{t("lobby.players")}</TableHead>
              <TableHead>{t("lobby.scores")}</TableHead>
              <TableHead>{t("lobby.currentMove")}</TableHead>
              <TableHead>{t("lobby.currentTurn")}</TableHead>
              <TableHead className="whitespace-wrap">
                {t("lobby.tilesLeft")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playerGames
              ?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((game, i) => {
                const playerIds = game.playerIds.filter(Boolean);

                return (
                  <TableRow
                    key={i}
                    className="cursor-pointer"
                    onClick={() => navigate(`/game/${game.id}`)}
                  >
                    <TableCell>
                      <BoardDiorama game={game} />
                    </TableCell>
                    <TableCell>
                      {new Date(game.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-row gap-2 whitespace-nowrap tracking-tight">
                        {playerIds.map((id) => getPlayerName(id)).join(", ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {playerIds
                        .map((id) => game.score.total[id!] ?? 0)
                        .join(", ")}
                    </TableCell>
                    <TableCell>
                      <span>
                        {game.currentPlayerId != null ? (
                          <PlayerBadge
                            playerId={game.currentPlayerId}
                            colorIndex={
                              game.currentPlayerId === user!.uid ? 0 : 1
                            }
                          />
                        ) : (
                          "-"
                        )}
                      </span>
                    </TableCell>
                    <TableCell>{game.currentTurn || "-"}</TableCell>
                    <TableCell>{game.tilePouch.length}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
