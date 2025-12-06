import { DEFAULT_GAME_STATE, MAX_PLAYERS } from "@/model/core.defaults";
import {
  GameState,
  Move,
  PlayerHand,
  Vote,
  VoteType,
} from "@/model/core.model";
import {
  useGetGameSnapshot,
  useUpdateGame,
} from "@/services/collections/game/game.hooks";
import { DbGamePayload } from "@/services/collections/game/game.model";
import { LanguageTemplate } from "@/services/collections/letterValueMap/languageTemplate.model";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

interface GameInterface {
  state: GameState | undefined;
  template: LanguageTemplate | undefined;
  initted: boolean;
  gameId: string;
  numPlayers: number;
  isGameOrganizer: boolean;
  getPlayerNumber: (playerId: string) => number;
  localProposedMove: Move[];
  localPlayerHand: PlayerHand;
  setLocalProposedMove: (move: Move[]) => void;
  setLocalPlayerHand: (hand: PlayerHand) => void;
}

const DefaultGame: GameInterface = {
  state: DEFAULT_GAME_STATE,
  template: undefined,
  initted: false,
  gameId: "",
  numPlayers: 0,
  isGameOrganizer: false,
  getPlayerNumber: () => 1,
  localProposedMove: [],
  localPlayerHand: [null, null, null, null, null, null, null],
  setLocalProposedMove: () => {},
  setLocalPlayerHand: () => {},
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
  const initialPlayerHand = state?.playerHands?.[user!.uid];

  // Hooks
  const navigate = useNavigate();

  // Mutations
  const updateGame = useUpdateGame(gameId);

  // State
  const [initted, setInitted] = useState<boolean>(false);
  const [localPlayerHand, setLocalPlayerHand] = useState<PlayerHand>(
    initialPlayerHand ?? DefaultGame.localPlayerHand
  );
  const [localProposedMove, setLocalProposedMove] = useState<Move[]>(
    state?.currentProposedMove?.move ?? []
  );

  // Consts
  const numPlayers: number = useMemo(
    () => state?.playerIds.filter(Boolean).length ?? 0,
    [state?.playerIds]
  );
  const isGameOrganizer = useMemo(
    () => user?.uid === createdByUserId,
    [user?.uid, createdByUserId]
  );

  // Functions
  const getPlayerNumber = useCallback(
    (playerId: string) => {
      const playerIdx = state?.playerIds.indexOf(playerId)!;
      return playerIdx + 1;
    },
    [state?.playerIds]
  );

  // Effects

  // INIT
  useEffect(() => {
    if (initted || !user || !template || !state) return;

    let userIsPartOfGame = state.playerIds.includes(user.uid);

    // If more than 4 players, redirect to lobby
    if (numPlayers >= MAX_PLAYERS && !userIsPartOfGame) {
      toast("We are sorry, this game is already full!");
      navigate("/");
      return;
    }

    // If already started, redirect to lobby
    if (state.gameStarted && !userIsPartOfGame) {
      toast("This game already started, you can't join anymore.");
      navigate("/");
      return;
    }

    // Add player to game
    let payload = {
      playerIds: state.playerIds.map((v) => {
        if (v === null && !userIsPartOfGame) {
          userIsPartOfGame = true;
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

  useEffect(() => {
    setLocalPlayerHand(initialPlayerHand ?? DefaultGame.localPlayerHand);
  }, [initialPlayerHand]);

  // Provider
  const value = {
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
  } satisfies GameInterface;

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
