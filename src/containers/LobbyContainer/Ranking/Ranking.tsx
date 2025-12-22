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
import { useGetPlayerName } from "@/services/collections/userConfig/userConfig.hooks";
import { CircleQuestionMark } from "lucide-react";
import { useTranslation } from "react-i18next";

const NUM_RANKINGS_TO_SHOW = 10;

export const Ranking = () => {
  const { rankings, error } = useGetLastNRankings(NUM_RANKINGS_TO_SHOW);
  const { t } = useTranslation();
  const getPlayerName = useGetPlayerName();

  // TODO: proper error thingie
  if (error || !rankings || rankings.length === 0 || false) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl text-center flex justify-center">
          <div className="flex flex-row items-center gap-2">
            {t("ranking.hallOfFame")}
          </div>
        </h2>
        <div className="flex flex-col gap-2 rounded-lg border border-input relative mb-4">
          <Table className="text-xs">
            <TableHeader className="bg-muted text-xs">
              <TableRow className="">
                <TableHead className="border-r break-words" rowSpan={2}>
                  {t("ranking.player")}
                </TableHead>
                <TableHead className="border-r" rowSpan={2}>
                  {t("ranking.finishedMatches")}
                </TableHead>
                {/* <TableHead className="border-r" rowSpan={2}>
                  {t("ranking.wins")}
                </TableHead> */}
                {/* <TableHead className="border-r" rowSpan={2}>
                  {t("ranking.losses")}
                </TableHead> */}
                <TableHead className="border-r" rowSpan={2}>
                  {t("ranking.winRatio")}
                </TableHead>
                <TableHead className="border-r" rowSpan={2}>
                  {t("ranking.totalPoints")}
                </TableHead>
                <TableHead className="border-r" colSpan={3}>
                  {t("ranking.avgPointsPerMatch")}
                </TableHead>
                <TableHead rowSpan={2} className="border-r">
                  {t("ranking.avgPointsPerTurn")}
                </TableHead>
                <TableHead colSpan={3} className="border-r">
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
                <TableHead className="border-r">
                  {t("ranking.players", { numPlayers: 2 })}
                </TableHead>
                <TableHead className="border-r">
                  {t("ranking.players", { numPlayers: 3 })}
                </TableHead>
                <TableHead className="border-r">
                  {t("ranking.players", { numPlayers: 4 })}
                </TableHead>
                <TableHead className="border-r">
                  {t("ranking.players", { numPlayers: 2 })}
                </TableHead>
                <TableHead className="border-r">
                  {t("ranking.players", { numPlayers: 3 })}
                </TableHead>
                <TableHead className="border-r">
                  {t("ranking.players", { numPlayers: 4 })}
                </TableHead>
              </TableRow>
            </TableHeader>
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
                        {r.avgMatchPointsRatio?.[numPlayers]?.toFixed(3) ?? "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
};
