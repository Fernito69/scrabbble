import {
  Board,
  LetterLiteral,
  PlayerMove,
  ScoreState,
  Vote,
} from "@/model/core.model";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";

interface DbGameBase {
  createdByUserId: string;
  template: LanguageTemplate;
  tilePouch: LetterLiteral[];
  playerIds: [string | null, string | null, string | null, string | null];
  currentPlayerId: string | null;
  currentTurn: number;
  score: ScoreState;
  gameStarted: boolean;
  gameOver: boolean;
  currentProposedMove: PlayerMove | null;
  currentVote: Vote | null;
}

export interface DbGame extends DbGameBase {
  createdAt: Date;
  board: Board;
}

export interface DbGamePayload extends DbGameBase {
  createdAt: Date | { _seconds: number; _nanoseconds: number };
  // Stringify the board because of firestore limitations
  board: string;
}
