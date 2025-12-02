import { DEFAULT_GAME_STATE } from "@/model/core.defaults";
import { GameState, Vote, VoteType } from "@/model/core.model";
import {
  useGetGameSnapshot,
  useUpdateGame,
} from "@/services/collections/game/game.hooks";
import { DbGamePayload } from "@/services/collections/game/game.model";
import { LanguageTemplate } from "@/services/collections/letterValueMap/languageTemplate.model";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

interface GameInterface {
  state: GameState | undefined;
  template: LanguageTemplate | undefined;
  initted: boolean;
  gameId: string;
  numPlayers: number;
  isGameOrganizer: boolean;
}

const DefaultGame: GameInterface = {
  state: DEFAULT_GAME_STATE,
  template: undefined,
  initted: false,
  gameId: "",
  numPlayers: 0,
  isGameOrganizer: false,
};

const GameContext = createContext<GameInterface>(DefaultGame);

export const useGameContext = () => {
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
  const { state, template, createdByUserId } = useGetGameSnapshot(gameId);

  // Mutations
  const updateGame = useUpdateGame(gameId);

  // State
  const [initted, setInitted] = useState<boolean>(false);

  // Consts
  const numPlayers: number = useMemo(
    () => state?.playerIds.filter(Boolean).length ?? 0,
    [state?.playerIds]
  );
  const isGameOrganizer = useMemo(
    () => user?.uid === createdByUserId,
    [user?.uid, createdByUserId]
  );

  // Effects
  // INIT
  useEffect(() => {
    if (initted || !user || !template || !state) return;

    // TODO: if more than 4 or it already started, redirect to lobby with toast

    // TODO: On start, check if players already exist in DB doc. If not, add them.
    let added = state.playerIds.some((v) => v === user.uid);

    let payload = {
      playerIds: state.playerIds.map((v) => {
        if (v === null && !added) {
          added = true;
          return user.uid;
        }
        return v;
      }),
    } as Partial<DbGamePayload>;

    updateGame(payload);

    setInitted(true);

    return () => setInitted(false);
  }, [state, template, user]);

  // Initial vote
  useEffect(() => {
    if (!state || !isGameOrganizer) return;
    if (numPlayers > 1 && !state.currentVote && !state.gameStarted) {
      const currentVote = {
        type: VoteType.START_VOTE,
        description: "Waiting until all players are ready to start the game",
        voteFinished: false,
        votes: state.playerIds
          .filter(Boolean)
          .map((id) => ({ playerId: id!, voted: false })),
      } satisfies Vote;

      updateGame({ currentVote });
    }
  }, [state]);

  // Provider
  const value = {
    state,
    template,
    initted,
    gameId,
    numPlayers,
    isGameOrganizer,
  } satisfies GameInterface;

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
