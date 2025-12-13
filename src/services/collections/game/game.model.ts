import {
  Board,
  LetterLiteral,
  PlayerHand,
  PlayerMove,
  ScoreState,
  Vote,
} from "@/model/core.model";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";
import { Timestamp } from "firebase/firestore";

interface DbGameBase {
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
}

export interface DbGame extends DbGameBase {
  createdAt: Date | Timestamp;
  board: Board;
}

export interface DbGamePayload extends DbGameBase {
  createdAt: Date | Timestamp;
  // Stringify the board because of firestore limitations
  board: string;
}
