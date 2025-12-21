import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAvatar } from "@/components/UserAvatar";
import { useGetLastNRankings } from "@/services/collections/ranking/ranking.hooks";
import { useGetPlayerName } from "@/services/collections/userConfig/userConfig.hooks";
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
    <div className="flex flex-col gap-2">
      <h2 className="text-xl text-center flex justify-center">
        <div className="flex flex-row items-center gap-2">
          {t("ranking.hallOfFame")}
        </div>
      </h2>
      <div className="flex flex-col gap-2 rounded-lg border border-input relative mb-4">
        <Table className="text-xs">
          <TableHeader className="bg-muted text-xs">
            <TableRow>
              <TableHead>{t("ranking.player")}</TableHead>
              <TableHead>{t("ranking.finishedMatches")}</TableHead>
              <TableHead>{t("ranking.wins")}</TableHead>
              <TableHead>{t("ranking.losses")}</TableHead>
              <TableHead>{t("ranking.totalPoints")}</TableHead>
              <TableHead>{t("ranking.winRatio")}</TableHead>
              <TableHead>{t("ranking.avgPointsPerTurn")}</TableHead>
              <TableHead>{t("ranking.avgPointsPerMatch")}</TableHead>
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
                  <TableCell>{r.wins}</TableCell>
                  <TableCell>{r.losses}</TableCell>
                  <TableCell>{r.totalPoints}</TableCell>
                  <TableCell>{(r.winRatio * 100).toFixed(1)}%</TableCell>
                  <TableCell>{r.avgPointsPerTurn.toFixed(1)}</TableCell>
                  <TableCell>{r.avgPointsPerMatch.toFixed(1)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
