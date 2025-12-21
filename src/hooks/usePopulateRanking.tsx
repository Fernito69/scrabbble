import { db } from "@/config/firebase";
import { useGetLastNGames } from "@/services/collections/game/game.hooks";
import { computeRankingPayload } from "@/services/collections/game/game.utils";
import { RANKING_COLLECTION } from "@/services/collections/ranking/ranking.defaults";
import { Ranking } from "@/services/collections/ranking/ranking.model";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect } from "react";

// ****************************************************************************************************
// Tool to populate rankings. Just run this hook once every time you want to update rankings
// ****************************************************************************************************

export const usePopulateRanking = () => {
  const { playerGames } = useGetLastNGames(100);

  useEffect(() => {
    if (!playerGames || playerGames.length === 0) return;
    console.log("Updating rankings");

    const promises: Promise<void>[] = [];

    for (const playerId of Array.from(
      new Set(playerGames.flatMap((g) => g.playerIds.filter(Boolean)))
    )) {
      const ref = doc(db, RANKING_COLLECTION, playerId!);
      const { avgMatchPointsRatio } = computeRankingPayload(
        playerGames,
        playerId!
      );
      const payload: Partial<Ranking> = {
        avgMatchPointsRatio,
      } satisfies Partial<Ranking>;

      console.log("Updating ranking", playerId, payload);
      promises.push(updateDoc(ref, payload));
    }

    Promise.all(promises).then(() => console.log("Rankings updated"));
  }, [playerGames]);
};
