import { BoardDiorama } from "@/components/BoardDiorama/BoardDiorama";
import { ConfirmationDialog } from "@/components/Dialog/ConfirmationDialog";
import { OverlayWithLoader } from "@/components/OverlayWithLoader/OverlayWithLoader";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { VoteType } from "@/model/core.model";
import {
  useDeleteGame,
  useGetLastNPlayerGames,
} from "@/services/collections/game/game.hooks";
import {
  getDefaultGameName,
  playNotificationSound,
} from "@/services/collections/game/game.utils";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LanguageSelectDialog } from "../LanguageSelectDialog/LanguageSelectDialog";

const GAMES_PER_PAGE = 10;

export const OngoingGames = () => {
  // State
  const [numGamesToShow, setNumGamesToShow] = useState<number>(GAMES_PER_PAGE);
  const [isCreatingGame, setIsCreatingGame] = useState<boolean>(false);

  // Data
  const { playerGames, error, templates } =
    useGetLastNPlayerGames(numGamesToShow);

  const { user } = useAuth();

  // Mutations
  const deleteGame = useDeleteGame();

  // Hooks
  const { t } = useTranslation();
  const navigate = useNavigate();

  const numGamesWhereItsPlayersTurn: number = useMemo(
    () =>
      (playerGames ?? []).filter((g) =>
        g.currentVote?.type === VoteType.ACCEPT_PROPOSED_MOVE
          ? g.currentVote.votes.some(
              (v) => v.playerId === user!.uid && !v.voted
            )
          : g.currentPlayerId === user!.uid
      ).length,
    [playerGames]
  );
  const prevNumGamesWhereItsPlayersTurn = useRef<number>(
    numGamesWhereItsPlayersTurn
  );

  useEffect(() => {
    if (numGamesWhereItsPlayersTurn > prevNumGamesWhereItsPlayersTurn.current) {
      playNotificationSound(3);
    }
    prevNumGamesWhereItsPlayersTurn.current = numGamesWhereItsPlayersTurn;
  }, [numGamesWhereItsPlayersTurn]);

  // Render
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 relative min-h-[200px]">
        {!playerGames && !error && (
          <OverlayWithLoader className="min-w-200 min-h-200">
            <i>{t("lobby.loadingGames")}</i>
          </OverlayWithLoader>
        )}
        {playerGames && playerGames.length > 0 ? (
          <>
            <div className="flex flex-col gap-2 rounded-lg border border-input relative min-h-[200px]">
              <Table className="text-xs">
                <TableHeader className="bg-muted text-xs">
                  <TableRow>
                    <TableHead colSpan={2}>{t("lobby.gameName")}</TableHead>
                    <TableHead>{t("lobby.createdAt")}</TableHead>
                    <TableHead>{t("lobby.language")}</TableHead>
                    <TableHead>{t("lobby.players")}</TableHead>
                    <TableHead>{t("lobby.scores")}</TableHead>
                    <TableHead>{t("lobby.currentMove")}</TableHead>
                    <TableHead>{t("lobby.currentTurn")}</TableHead>
                    <TableHead className="whitespace-wrap">
                      {t("lobby.tilesLeft")}
                    </TableHead>
                    <TableHead className="w-1" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerGames.map((game, i) => {
                    const playerIds = game.playerIds.filter(
                      Boolean
                    ) as string[];
                    const playerIsCreator = user?.uid === game.createdByUserId;

                    const maxLength = 30;
                    const fullName =
                      game.gameName ??
                      getDefaultGameName(t("languageSelect.gameNameDefault"));
                    const nameTooLong = fullName.length > maxLength;
                    const shownName = nameTooLong
                      ? fullName.slice(0, maxLength) + "…"
                      : fullName;

                    return (
                      <TableRow
                        key={i}
                        className="cursor-pointer animate-out odd:bg-white even:bg-gray-50"
                        onClick={() => navigate(`/game/${game.id}`)}
                      >
                        {nameTooLong ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <TableCell>
                                <p className="tracking-tight text-xs">
                                  {shownName}
                                </p>
                              </TableCell>
                            </TooltipTrigger>
                            <TooltipContent>{fullName}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <TableCell>
                            <p className="tracking-tight text-xs">
                              {shownName}
                            </p>
                          </TableCell>
                        )}
                        <TableCell>
                          <BoardDiorama game={game} />
                        </TableCell>
                        <TableCell>
                          {new Date(game.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{templates[i].name}</TableCell>
                        <TableCell>
                          <div className="flex flex-row gap-2 whitespace-nowrap tracking-tight">
                            {playerIds.map((id, idx) => (
                              <UserAvatar
                                key={idx}
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
                          <div className="flex flex-row gap-2 items-center">
                            {game.currentPlayerId != null ? (
                              game.currentVote ? (
                                game.playerIds
                                  .filter(
                                    (id) =>
                                      id !== null &&
                                      id !== game.currentPlayerId &&
                                      game.currentVote?.votes.some(
                                        (v) => v.playerId === id && !v.voted
                                      )
                                  )
                                  .map((id, i) => (
                                    <UserAvatar
                                      key={i}
                                      userId={id!}
                                      bounce={id === user!.uid}
                                      shadingIndex={game.playerIds.findIndex(
                                        (uid) => uid === id
                                      )}
                                      diameter={28}
                                    />
                                  ))
                              ) : (
                                <UserAvatar
                                  userId={game.currentPlayerId}
                                  bounce={game.currentPlayerId === user!.uid}
                                  shadingIndex={game.playerIds.indexOf(
                                    game.currentPlayerId
                                  )}
                                  diameter={28}
                                />
                              )
                            ) : (
                              "-"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{game.currentTurn || "-"}</TableCell>
                        <TableCell>{game.tilePouch.length}</TableCell>
                        <TableCell
                          onClick={(e) => e.stopPropagation()}
                          className="w-1"
                        >
                          {playerIsCreator && (
                            <ConfirmationDialog
                              triggerElement={
                                <Trash2 className="text-red-600 w-4 h-4 cursor-pointer hover:text-red-700" />
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
            {numGamesToShow <= playerGames.length && (
              <div className="flex flex-row gap-2 items-center justify-center">
                <Button
                  onClick={() =>
                    setNumGamesToShow(numGamesToShow + GAMES_PER_PAGE)
                  }
                  className="w-full"
                >
                  {t("lobby.showMore")}
                </Button>
              </div>
            )}
          </>
        ) : playerGames && !error ? (
          <div className="justify-center text-xl items-center flex flex-row tracking-tight mt-4">
            {t("lobby.noGames")}
            <button
              onClick={() => setIsCreatingGame(true)}
              disabled={isCreatingGame}
              className="w-fit px-4 py-1 ml-3 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("lobby.createOne")}
            </button>
            {isCreatingGame && (
              <LanguageSelectDialog close={() => setIsCreatingGame(false)} />
            )}
          </div>
        ) : error ? (
          <div className="text-center text-xl font-bold tracking-tight mt-4">
            {t("lobby.error")}
          </div>
        ) : null}
      </div>
    </div>
  );
};
