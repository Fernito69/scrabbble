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
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/UserAvatar";
import { useGetLastNRankings } from "@/services/collections/ranking/ranking.hooks";
import {
  useGetPlayerName,
  useGetUserConfig,
  useUpdateUserConfig,
} from "@/services/collections/userConfig/userConfig.hooks";
import { UserConfig } from "@/services/collections/userConfig/userConfig.model";
import { ChevronDown, ChevronUp, CircleQuestionMark } from "lucide-react";
import { useTranslation } from "react-i18next";

const NUM_RANKINGS_TO_SHOW = 10;

export const Ranking = () => {
  const { t } = useTranslation();

  // Data & Mutations
  const { rankings, error } = useGetLastNRankings(NUM_RANKINGS_TO_SHOW);
  const getPlayerName = useGetPlayerName();
  const userConfig = useGetUserConfig();
  const updateUserConfig = useUpdateUserConfig();

  // TODO: proper error thingie
  if (error || !rankings || rankings.length === 0 || false) {
    return null;
  }

  // Handlers
  const handleCollapseRanking = () => {
    updateUserConfig({
      rankingCollapsed: !(userConfig?.rankingCollapsed ?? true),
    } satisfies Partial<UserConfig>);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2 min-w-200">
        <h2 className="text-xl text-center flex justify-center">
          <div className="flex flex-row items-center gap-2"></div>
        </h2>
        <div className="flex flex-col gap-2 rounded-lg border border-input relative mb-4 min-w-200">
          <Table className="text-xs min-w-200">
            <TableHeader className="bg-muted text-xs">
              <TableRow className="border-b bg-gray-200">
                <TableHead
                  className="border-r text-center text-lg font-semibold tracking-wider items-center gap-2 cursor-pointer"
                  colSpan={12}
                >
                  <div
                    className="flex flex-row items-center gap-2 justify-between w-full px-4"
                    onClick={handleCollapseRanking}
                  >
                    🏆
                    <div className="flex flex-row items-center gap-2">
                      {t("ranking.hallOfFame")}
                      {userConfig?.rankingCollapsed ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                    🏆
                  </div>
                </TableHead>
              </TableRow>
              {!userConfig?.rankingCollapsed && (
                <>
                  <TableRow className="">
                    <TableHead
                      className="border-r whitespace-normal break-words"
                      rowSpan={2}
                    >
                      {t("ranking.player")}
                    </TableHead>
                    <TableHead
                      className="border-r whitespace-normal break-words"
                      rowSpan={2}
                    >
                      {t("ranking.finishedMatches")}
                    </TableHead>
                    {/* <TableHead className="border-r" rowSpan={2}>
                  {t("ranking.wins")}
                </TableHead> */}
                    {/* <TableHead className="border-r" rowSpan={2}>
                  {t("ranking.losses")}
                </TableHead> */}
                    <TableHead
                      className="border-r whitespace-normal break-words"
                      rowSpan={2}
                    >
                      {t("ranking.winRatio")}
                    </TableHead>
                    <TableHead
                      className="border-r whitespace-normal break-words"
                      rowSpan={2}
                    >
                      {t("ranking.totalPoints")}
                    </TableHead>
                    <TableHead
                      className="border-r whitespace-normal break-words"
                      colSpan={3}
                    >
                      {t("ranking.avgPointsPerMatch")}
                    </TableHead>
                    <TableHead
                      rowSpan={2}
                      className="border-r whitespace-normal break-words"
                    >
                      {t("ranking.avgPointsPerTurn")}
                    </TableHead>
                    <TableHead
                      colSpan={3}
                      className="border-r whitespace-normal break-words"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help flex flex-row items-center gap-1">
                            {t("ranking.avgMatchPointsRatio")}
                            <CircleQuestionMark className="w-[14px] h-[14px] text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="flex flex-col gap-2">
                            <p className="text-xs">
                              {t("ranking.mprTooltipDescription")}
                            </p>
                            <div className="flex justify-center items-center">
                              <div className="flex flex-col items-center text-xs font-mono">
                                <div className="border-b border-current pb-1">
                                  {t("ranking.mprTooltipPlayerPoints")}
                                </div>
                                <div className="pt-1">
                                  {t("ranking.mprTooltipTotalPoints")}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="border-r whitespace-normal break-words">
                      {t("ranking.players", { numPlayers: 2 })}
                    </TableHead>
                    <TableHead className="border-r whitespace-normal break-words">
                      {t("ranking.players", { numPlayers: 3 })}
                    </TableHead>
                    <TableHead className="border-r whitespace-normal break-words">
                      {t("ranking.players", { numPlayers: 4 })}
                    </TableHead>
                    <TableHead className="border-r whitespace-normal break-words">
                      {t("ranking.players", { numPlayers: 2 })}
                    </TableHead>
                    <TableHead className="border-r whitespace-normal break-words">
                      {t("ranking.players", { numPlayers: 3 })}
                    </TableHead>
                    <TableHead className="border-r whitespace-normal break-words">
                      {t("ranking.players", { numPlayers: 4 })}
                    </TableHead>
                  </TableRow>
                </>
              )}
            </TableHeader>
            {!userConfig?.rankingCollapsed && (
              <TableBody>
                {(rankings ?? []).map((r, i) => {
                  return (
                    <TableRow key={i} className="odd:bg-white even:bg-gray-50">
                      <TableCell>
                        <div className="flex flex-row items-center gap-2">
                          <UserAvatar userId={r.playerId} diameter={24} />
                          {getPlayerName(r.playerId)}
                        </div>
                      </TableCell>
                      <TableCell>{r.finishedMatches}</TableCell>
                      {/* <TableCell>{r.wins}</TableCell> */}
                      {/* <TableCell>{r.losses}</TableCell> */}
                      <TableCell>{(r.winRatio * 100).toFixed(1)}%</TableCell>
                      <TableCell>{r.totalPoints}</TableCell>
                      {([2, 3, 4] as const).map((numPlayers) => (
                        <TableCell key={numPlayers}>
                          {r.avgPointsPerMatch?.[numPlayers]?.toFixed(1) ?? "-"}
                        </TableCell>
                      ))}
                      <TableCell>{r.avgPointsPerTurn.toFixed(1)}</TableCell>
                      {([2, 3, 4] as const).map((numPlayers) => (
                        <TableCell key={numPlayers}>
                          {r.avgMatchPointsRatio?.[numPlayers]?.toFixed(3) ??
                            "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            )}
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
};
