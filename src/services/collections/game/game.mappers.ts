import { Board, GameState } from "@/model/core.model";
import { DbGamePayload, Timestamp } from "./game.model";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";
import { EMPTY_BOARD } from "@/model/core.defaults";

export const timestampToDate = (date?: Timestamp | Date): Date | undefined =>
  date
    ? (((date as Timestamp).seconds
        ? new Date((date as Timestamp).seconds * 1000)
        : date) as Date)
    : undefined;

export const mapDbGamePayloadToGameState = (
  dbGame: DbGamePayload
): GameState => {
  return {
    gameName: dbGame.gameName,
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
    createdAt: timestampToDate(dbGame.createdAt)!,
    createdByUserId: dbGame.createdByUserId,
    lastModifiedAt: timestampToDate(dbGame.lastModifiedAt),
  } satisfies GameState;
};

export const mapGameStateToDbGamePayload = (
  gameState: GameState,
  template?: LanguageTemplate
): Partial<DbGamePayload> => {
  return {
    gameName: gameState.gameName,
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
    createdAt: gameState.createdAt,
    createdByUserId: gameState.createdByUserId,
    lastModifiedAt: gameState.lastModifiedAt,
  } satisfies Partial<DbGamePayload>;
};
