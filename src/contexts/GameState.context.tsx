import { db } from "@/config/firebase";
import { DEFAULT_GAME_STATE } from "@/model/core.defaults";
import { GameState } from "@/model/core.model";
import { updateGame } from "@/services/collections/game/game";
import { useGetGameSnapshot } from "@/services/collections/game/game.hooks";
import { DbGame, DbGamePayload } from "@/services/collections/game/game.model";
import { LanguageTemplate } from "@/services/collections/letterValueMap/languageTemplate.model";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

interface GameInterface {
  state: GameState | undefined;
  template: LanguageTemplate | undefined;
  initted: boolean;
  gameId: string;
}

const DefaultGame: GameInterface = {
  state: DEFAULT_GAME_STATE,
  template: undefined,
  initted: false,
  gameId: "",
};

const GameContext = createContext<GameInterface>(DefaultGame);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
};

interface GameStateProviderProps extends PropsWithChildren {
  gameId: string;
}
export const GameStateProvider = ({
  children,
  gameId,
}: GameStateProviderProps) => {
  // Data
  const { user } = useAuth();
  const game: DbGame | undefined = useGetGameSnapshot(gameId);

  // State
  const [initted, setInitted] = useState<boolean>(false);

  // TODO: create GameState en DB and fetch it with the gameId

  useEffect(() => {
    if (initted || !user || !game?.template || !game?.state) return;

    // TODO: if more than 4 or it already started, redirect to lobby with toast

    // TODO: On start, check if players already exist in DB doc. If not, add them.
    let added = game.state.playerIds.some((v) => v === user.uid);
    console.log("ADDED", added);
    let payload = {
      state: JSON.stringify({
        ...game.state,
        playerIds: game.state.playerIds.map((v) => {
          if (v === null && !added) {
            added = true;
            return user.uid;
          }
          return v;
        }),
      }),
    } satisfies Partial<DbGamePayload>;
console.log("payuload", {
  ...game.state,
  playerIds: game.state.playerIds.map((v) => {
    if (v === null && !added) {
      added = true;
      return user.uid;
    }
    return v;
  }),
})
    updateGame(db, gameId, payload);

    setInitted(true);

    return () => setInitted(false);
  }, [game, user]);

  // FETCH GAME STATE
  const value = {
    state: game?.state,
    template: game?.template,
    initted,
    gameId,
  } satisfies GameInterface;

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
