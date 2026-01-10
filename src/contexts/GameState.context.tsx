import { Move, PlayerHand } from "@/model/core.model";
import { useGetGameSnapshot } from "@/services/collections/game/game.hooks";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { useGameStateEffects } from "./GameState.effects";
import { DefaultGame, GameInterface } from "./GameState.model";

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
  const { state, template, createdByUserId, hasError } =
    useGetGameSnapshot(gameId);

  // Data-derived consts
  const initialPlayerHand: PlayerHand | undefined =
    state?.playerHands?.[user!.uid];
  const numPlayers: number = useMemo(
    () => state?.playerIds.filter(Boolean).length ?? 0,
    [state?.playerIds]
  );
  const isGameOrganizer: boolean = useMemo(
    () => user?.uid === createdByUserId,
    [user?.uid, createdByUserId]
  );
  const isMyTurn: boolean = useMemo(
    () => state?.currentPlayerId === user?.uid,
    [state?.currentPlayerId, user?.uid]
  );

  // State
  const [initted, setInitted] = useState<boolean>(false);
  const [localPlayerHand, setLocalPlayerHand] = useState<PlayerHand>(
    initialPlayerHand ?? DefaultGame.localPlayerHand
  );
  const [localProposedMove, setLocalProposedMove] = useState<Move[]>(
    state?.currentProposedMove?.move ?? []
  );

  // Functions
  const getPlayerNumber = useCallback(
    (playerId: string, getIdx: boolean = false) => {
      const playerIdx = state?.playerIds.indexOf(playerId)!;
      return playerIdx + (getIdx ? 0 : 1);
    },
    [state?.playerIds]
  );

  // Provider
  const providerProps = {
    state,
    template,
    initted,
    gameId,
    numPlayers,
    isGameOrganizer,
    getPlayerNumber,
    localProposedMove,
    localPlayerHand,
    setLocalProposedMove,
    setLocalPlayerHand,
    isMyTurn,
  } satisfies GameInterface;

  // Initialize game effects
  useGameStateEffects({
    ...providerProps,
    gameId,
    initted,
    initialPlayerHand,
    isMyTurn,
    setInitted,
    hasError,
  });

  return (
    <GameContext.Provider value={providerProps}>
      {children}
    </GameContext.Provider>
  );
};
