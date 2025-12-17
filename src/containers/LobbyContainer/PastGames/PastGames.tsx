import { BoardDiorama } from "@/components/BoardDiorama/BoardDiorama";
import { OverlayWithLoader } from "@/components/OverlayWithLoader/OverlayWithLoader";
import { UserAvatar } from "@/components/UserAvatar";
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
import { getDefaultGameName } from "@/services/collections/game/game.utils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const PastGames = () => {
  // Data
  const { playerGames, error } = useGetLastNPastGames();
  const { user } = useAuth();

  // Hooks
  const { t } = useTranslation();
  const navigate = useNavigate();

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
                    <TableHead colSpan={2}>{t("lobby.gameName")}</TableHead>
                    <TableHead>{t("lobby.lastModifiedAt")}</TableHead>
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

                    const [winnerId] = Object.entries(game.score.total).sort(
                      ([_, b1], [__, b2]) => b2 - b1
                    )[0];

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
          </>
        ) : playerGames && !error ? (
          <div className="text-center text-xl font-bold tracking-tight mt-4">
            {t("lobby.noPastGames")}
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
