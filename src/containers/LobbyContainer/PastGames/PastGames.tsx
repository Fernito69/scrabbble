import { BoardDiorama } from "@/components/BoardDiorama/BoardDiorama";
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
import { useGetLastNPastGames } from "@/services/collections/game/game.hooks";
import {
  getDefaultGameName,
  getWinningPlayerIdAndScore,
} from "@/services/collections/game/game.utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LanguageSelectDialog } from "../LanguageSelectDialog/LanguageSelectDialog";
import { Switch } from "@/components/ui";
import {
  useGetUserConfig,
  useUpdateUserConfig,
} from "@/services/collections/userConfig/userConfig.hooks";

const GAMES_PER_PAGE = 10;

export const PastGames = () => {
  // State
  const [numGamesToShow, setNumGamesToShow] = useState<number>(GAMES_PER_PAGE);
  const [isCreatingGame, setIsCreatingGame] = useState<boolean>(false);

  // Data & Mutations
  const { playerGames, error, templates } = useGetLastNPastGames();
  const userConfig = useGetUserConfig();
  const { user } = useAuth();
  const updateUserConfig = useUpdateUserConfig();

  // Hooks
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Handlers
  const handleToggleShowTilePlayerColors = () => {
    updateUserConfig({
      showTilePlayerColors: !userConfig?.showTilePlayerColors,
    });
  };

  // Render
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 relative min-h-[200px]">
        {!playerGames && !error && (
          <OverlayWithLoader className="min-w-50 min-h-50">
            <i>{t("lobby.loadingGames")}</i>
          </OverlayWithLoader>
        )}
        {playerGames && playerGames.length > 0 ? (
          <>
            <div className="flex flex-col gap-2 rounded-lg border border-input relative min-h-[200px]">
              <Table className="text-xs">
                <TableHeader className="bg-muted text-xs">
                  <TableRow>
                    <TableHead>{t("lobby.gameName")}</TableHead>
                    <TableHead>
                      <div
                        className="flex items-center h-4 justify-center"
                        title={t("playfield.showTilePlayerColors")}
                      >
                        <Switch
                          className="scale-75"
                          checked={userConfig?.showTilePlayerColors}
                          onCheckedChange={handleToggleShowTilePlayerColors}
                        />
                      </div>
                    </TableHead>
                    <TableHead>{t("lobby.lastModifiedAt")}</TableHead>
                    <TableHead>{t("lobby.language")}</TableHead>
                    <TableHead>{t("lobby.players")}</TableHead>
                    <TableHead>{t("lobby.scores")}</TableHead>
                    <TableHead>{t("lobby.winner")}</TableHead>
                    <TableHead>{t("lobby.lastTurn")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerGames.map((game, i) => {
                    const playerIds = game.playerIds.filter(
                      Boolean
                    ) as string[];

                    const maxLength = 30;
                    const fullName =
                      game.gameName ??
                      getDefaultGameName(t("languageSelect.gameNameDefault"));
                    const nameTooLong = fullName.length > maxLength;
                    const shownName = nameTooLong
                      ? fullName.slice(0, maxLength) + "…"
                      : fullName;

                    const [winnerId] = getWinningPlayerIdAndScore(game);

                    if (!winnerId) return null;

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
                          {new Date(
                            game?.lastModifiedAt ?? game.createdAt
                          ).toLocaleString()}
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
                            <UserAvatar
                              userId={winnerId}
                              bounce={winnerId === user!.uid}
                              shadingIndex={game.playerIds.indexOf(winnerId)}
                              diameter={28}
                            />
                          </div>
                        </TableCell>
                        <TableCell>{game.currentTurn || "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {/* TODO: REFACTOR THIS (OngoingGmaes and PastGames) */}
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
            {t("lobby.noPastGames")}
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
