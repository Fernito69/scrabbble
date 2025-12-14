import { DEFAULT_GAME_STATE } from "@/model/core.defaults";
import { GameState, Move, PlayerHand } from "@/model/core.model";
import { LanguageTemplate } from "@/services/collections/letterValueMap/languageTemplate.model";

export interface GameInterface {
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
  setLocalPlayerHand: React.Dispatch<React.SetStateAction<PlayerHand>>;
  isMyTurn: boolean;
}

export interface UseGameStateEffects extends GameInterface {
  gameId: string;
  initted: boolean;
  setInitted: (initted: boolean) => void;
  initialPlayerHand: PlayerHand | undefined;
  hasError: boolean;
}

export const DefaultGame: GameInterface = {
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
  isMyTurn: false,
};
