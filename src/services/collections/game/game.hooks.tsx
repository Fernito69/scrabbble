import { useEffect, useState } from "react";
import { DbGame } from "./game.model";
import { getGameSnapshot } from "./game";
import { db } from "@/config/firebase";

export const useGetGameSnapshot = (id: string) => {
  const [game, setGame] = useState<DbGame | undefined>();

  useEffect(() => getGameSnapshot(db, id, (g) => setGame(g)), [id]);

  return game;
};
