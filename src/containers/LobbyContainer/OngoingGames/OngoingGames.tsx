import { useGetPlayerName } from "@/services/collections/userConfig/userConfig.hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetPlayerGames } from "@/services/collections/game/game.hooks";
import { useTranslation } from "react-i18next";
import { Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const OngoingGames = () => {
  // Data
  const [playerGames, gameIds] = useGetPlayerGames();

  // Hooks
  const { t } = useTranslation();
  const getPlayerName = useGetPlayerName();
  const navigate = useNavigate();

  // Render
  return (
    playerGames.length > 0 && (
      <div className="flex flex-col gap-4 mt-4">
        <h2 className="text-lg font-bold">{t("lobby.yourGames")}</h2>
        <div className="flex flex-col gap-2 rounded-lg border border-input">
          <Table className="text-xs">
            <TableHeader className="bg-muted text-xs">
              <TableRow>
                <TableHead>{t("lobby.createdAt")}</TableHead>
                <TableHead>{t("lobby.players")}</TableHead>
                <TableHead>{t("lobby.scores")}</TableHead>
                <TableHead className="whitespace-wrap">
                  {t("lobby.tilesLeft")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playerGames
                .sort(
                  (a, b) =>
                    (b.createdAt as Timestamp).seconds -
                    (a.createdAt as Timestamp).seconds
                )
                .map((game, i) => {
                  const playerIds = game.playerIds.filter(Boolean);

                  return (
                    <TableRow
                      key={i}
                      className="cursor-pointer"
                      onClick={() => navigate(`/game/${gameIds[i]}`)}
                    >
                      <TableCell>
                        {new Date(
                          (game.createdAt as Timestamp).seconds * 1000
                        ).toLocaleString()}
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
                      <TableCell>{game.tilePouch.length}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  );
};
