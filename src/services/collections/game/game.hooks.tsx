import { db } from "@/config/firebase";
import { GameState } from "@/model/core.model";
import { useEffect, useState } from "react";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";
import { getGameSnapshot } from "./game";

export const useGetGameSnapshot = (id: string) => {
  const [state, setState] = useState<GameState | undefined>();
  const [template, setTemplate] = useState<LanguageTemplate | undefined>();

  useEffect(
    () =>
      getGameSnapshot(db, id, (s, t) => {
        setState(s);
        setTemplate(t);
      }),
    [id]
  );

  return { state, template };
};
