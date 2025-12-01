import { db } from "@/config/firebase";
import { GameState } from "@/model/core.model";
import { useEffect, useState } from "react";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";
import { getGameSnapshot } from "./game";

type UseGetGameSnapshot = {
  state: GameState | undefined;
  template: LanguageTemplate | undefined;
};
export const useGetGameSnapshot = (gameId: string): UseGetGameSnapshot => {
  const [state, setState] = useState<GameState | undefined>();
  const [template, setTemplate] = useState<LanguageTemplate | undefined>();

  useEffect(
    () =>
      getGameSnapshot(db, gameId, (newS, newT) => {
        setState(newS);
        setTemplate(newT);
      }),
    [gameId]
  );

  return { state, template };
};
