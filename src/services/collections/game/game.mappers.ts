import { Board, GameState } from "@/model/core.model";
import { DbGamePayload } from "./game.model";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";
import { EMPTY_BOARD } from "@/model/core.defaults";

export const mapDbGamePayloadToGameState = (dbGame: DbGamePayload) => {
  return {
    board: dbGame.board ? (JSON.parse(dbGame.board) as Board) : EMPTY_BOARD,
    playerIds: dbGame.playerIds,
    currentPlayerId: dbGame.currentPlayerId ?? undefined,
    currentTurn: dbGame.currentTurn,
    score: dbGame.score,
    gameStarted: dbGame.gameStarted,
    gameOver: dbGame.gameOver,
    currentProposedMove: dbGame.currentProposedMove ?? undefined,
    currentVote: dbGame.currentVote ?? undefined,
    tilePouch: dbGame.tilePouch,
    playerHands: dbGame.playerHands,
  } satisfies GameState;
};

export const mapGameStateToDbGamePayload = (
  gameState: GameState,
  template?: LanguageTemplate
) => {
  return {
    board: JSON.stringify(gameState.board),
    playerIds: gameState.playerIds,
    currentPlayerId: gameState.currentPlayerId,
    currentTurn: gameState.currentTurn,
    score: gameState.score,
    gameStarted: gameState.gameStarted,
    gameOver: gameState.gameOver,
    currentProposedMove: gameState.currentProposedMove,
    currentVote: gameState.currentVote,
    tilePouch: gameState.tilePouch,
    template,
    playerHands: gameState.playerHands,
  } satisfies Partial<DbGamePayload>;
};
