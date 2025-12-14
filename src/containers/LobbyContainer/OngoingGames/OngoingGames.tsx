import { BoardDiorama } from "@/components/BoardDiorama/BoardDiorama";
import { ConfirmationDialog } from "@/components/Dialog/ConfirmationDialog";
import { OverlayWithLoader } from "@/components/OverlayWithLoader/OverlayWithLoader";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import {
  useDeleteGame,
  useGetLastNPlayerGames,
} from "@/services/collections/game/game.hooks";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const OngoingGames = () => {
  // Data
  const { playerGames, error } = useGetLastNPlayerGames();
  const { user } = useAuth();

  // Mutations
  const deleteGame = useDeleteGame();

  // Hooks
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Render
  return (
    <div className="flex flex-col gap-4 mt-6">
      <Separator />
      <div className="flex flex-col gap-4 mt-6 relative">
        {!playerGames && !error && (
          <OverlayWithLoader className="min-w-50 min-h-50">
            <i>{t("lobby.loadingGames")}</i>
          </OverlayWithLoader>
        )}
        {playerGames && playerGames.length > 0 ? (
          <>
            <h2 className="text-lg font-bold">{t("lobby.yourGames")}</h2>
            <div className="flex flex-col gap-2 rounded-lg border border-input relative min-h-[200px]">
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
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerGames
                    .sort(
                      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                    )
                    .map((game, i) => {
                      const playerIds = game.playerIds.filter(
                        Boolean
                      ) as string[];
                      const playerIsCreator =
                        user?.uid === game.createdByUserId;

                      return (
                        <TableRow
                          key={i}
                          className="cursor-pointer animate-out"
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
                              {playerIds.map((id, idx) => (
                                <UserAvatar
                                  key={id}
                                  userId={id}
                                  diameter={28}
                                  shadingIndex={idx}
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {playerIds
                              .map((id) => game.score.total[id] ?? 0)
                              .join(", ")}
                          </TableCell>
                          <TableCell>
                            <span>
                              {game.currentPlayerId != null ? (
                                <UserAvatar
                                  userId={game.currentPlayerId}
                                  glow={game.currentPlayerId === user!.uid}
                                  shadingIndex={game.playerIds.indexOf(
                                    game.currentPlayerId
                                  )}
                                  diameter={28}
                                />
                              ) : (
                                "-"
                              )}
                            </span>
                          </TableCell>
                          <TableCell>{game.currentTurn || "-"}</TableCell>
                          <TableCell>{game.tilePouch.length}</TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            {playerIsCreator && (
                              <ConfirmationDialog
                                triggerElement={
                                  <Button
                                    variant={"ghost"}
                                    className="text-red-600"
                                  >
                                    <Trash2 />
                                  </Button>
                                }
                                title={t("lobby.deleteGame")}
                                description={t("lobby.deleteGameConfirm")}
                                onAccept={() => deleteGame(game.id)}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="text-center text-xl font-bold tracking-tight">
            {t("lobby.noGames")}
          </div>
        )}
      </div>
    </div>
  );
};
