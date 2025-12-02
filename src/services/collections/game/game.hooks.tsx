import { db } from "@/config/firebase";
import { GameState } from "@/model/core.model";
import { useEffect, useState } from "react";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";
import { getGameSnapshot, updateGame } from "./game";
import { DbGamePayload } from "./game.model";

type UseGetGameSnapshot = {
  state: GameState | undefined;
  template: LanguageTemplate | undefined;
  createdByUserId: string | undefined;
};
export const useGetGameSnapshot = (gameId: string): UseGetGameSnapshot => {
  const [state, setState] = useState<GameState | undefined>();
  const [template, setTemplate] = useState<LanguageTemplate | undefined>();
  const [createdByUserId, setCreatedByUserId] = useState<string | undefined>();

  useEffect(
    () =>
      getGameSnapshot(db, gameId, (newS, newT, newId) => {
        setState(newS);
        setTemplate(newT);
        setCreatedByUserId(newId);
      }),
    [gameId]
  );

  return { state, template, createdByUserId };
};

export const useUpdateGame = (gameId: string) => {
  return async (game: Partial<DbGamePayload>) => {
    try {
      await updateGame(db, gameId, game);
    } catch (err) {
      console.error("Failed to update user config:", err);
    }
  };
};
