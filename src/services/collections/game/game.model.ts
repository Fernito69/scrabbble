import {
  Board,
  LetterLiteral,
  PlayerHand,
  PlayerMove,
  ScoreState,
  Vote,
} from "@/model/core.model";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";

export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}
interface DbGameBase {
  gameName: string;
  createdByUserId: string;
  template: LanguageTemplate;
  tilePouch: LetterLiteral[];
  playerIds: [string | null, string | null, string | null, string | null];
  playerHands: Record<string, PlayerHand>;
  currentPlayerId: string | null;
  currentTurn: number;
  score: ScoreState;
  gameStarted: boolean;
  gameOver: boolean;
  currentProposedMove: PlayerMove | null;
  currentVote: Vote | null;
  createdAt: Date | Timestamp;
  lastModifiedAt: Date | Timestamp;
}

export interface DbGame extends DbGameBase {
  board: Board;
}

export interface DbGamePayload extends DbGameBase {
  // Stringify the board because of firestore limitations
  board: string;
}
