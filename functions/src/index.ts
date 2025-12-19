/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import { cloneDeep } from "lodash";
import { GameState, Vote, VoteType } from "../../src/model/core.model";
import { ChatMessageBase } from "../../src/services/collections/game/chat/chat.model";
import { mapDbGamePayloadToGameState } from "../../src/services/collections/game/game.mappers";
import { DbGamePayload } from "../../src/services/collections/game/game.model";
import { GAME_COLLECTION } from "../../src/services/collections/game/game.defaults";
import { CHAT_COLLECTION } from "../../src/services/collections/game/chat/chat.defaults";

import {
  buildMovePayload,
  computeRemainingTilesScore,
  getInitialGamePayload,
} from "../../src/services/collections/game/game.utils";

admin.initializeApp();

export const firestore = admin.firestore() as any;

// Admin SDK compatible version of updateGame
const updateGame = (
  db: admin.firestore.Firestore,
  id: string,
  game: Partial<DbGamePayload>
) => {
  const docRef = db.collection(GAME_COLLECTION).doc(id);
  return docRef.update({ ...game, lastModifiedAt: new Date() });
};
const addChatMessage = (
  db: admin.firestore.Firestore,
  gameId: string,
  message: ChatMessageBase
) => {
  const colRef = db
    .collection(GAME_COLLECTION)
    .doc(gameId)
    .collection(CHAT_COLLECTION);
  return colRef.add({ ...message, createdAt: new Date() });
};

/***************/
// This trigger is called every time a game is updated
/***************/
export const onGameUpdateTrigger = functions.firestore
  .document("games/{id}")
  .onUpdate(async (doc, context) => {
    const dbGame = doc.after.data() as DbGamePayload;
    const previousGame = doc.before.data() as DbGamePayload;
    const state: GameState = mapDbGamePayloadToGameState(dbGame);
    const gameId = context.params.id;
    const updateCurrGame = (payload: Partial<DbGamePayload>) =>
      updateGame(firestore, gameId, payload);

    const { template, createdByUserId, gameName } = dbGame;
    const {
      currentVote,
      playerIds,
      gameStarted,
      currentTurn,
      gameOver,
      tilePouch,
      playerHands,
    } = state;

    const presentPlayers = playerIds.filter(Boolean);

    /***************/
    // Initial vote
    /***************/
    if (presentPlayers.length > 1 && !currentVote && !gameStarted) {
      const currentVote = {
        type: VoteType.START_VOTE,
        voteFinished: false,
        votes: presentPlayers.map((id) => ({ playerId: id!, voted: null })),
      } satisfies Vote;

      functions.logger.log("Initial vote started");
      return updateCurrGame({ currentVote });
    }

    /***************/
    // Vote for proposed move
    /***************/
    if (currentVote?.type === VoteType.ACCEPT_PROPOSED_MOVE && !!template) {
      const payload = buildMovePayload(state, template);

      if (payload) {
        functions.logger.log("Proposed move vote finished");
        updateCurrGame(payload);

        // Add a message if it's a new turn
        if (payload?.currentTurn !== previousGame?.currentTurn) {
          addChatMessage(firestore, gameId, {
            text: `Turn ${payload.currentTurn}`,
            playerId: undefined,
          } satisfies ChatMessageBase);
        }

        return;
      }
    }

    /***************/
    // Vote for initial hand reshuffle
    /***************/
    if (currentVote?.type === VoteType.INITIAL_RESHUFFLE && !!template) {
      // Shuffle accepted
      if (currentVote.votes.every((v) => !!v.voted)) {
        const payload = {
          ...getInitialGamePayload(createdByUserId, template),
          gameName,
          currentVote: null,
        } satisfies Partial<DbGamePayload>;

        functions.logger.log("Initial shuffle accepted");
        return updateCurrGame(payload);
      }
      // Shuffle rejected
      else if (currentVote.votes.every((v) => v.voted === false)) {
        functions.logger.log("Initial shuffle rejected");
        return updateCurrGame({ currentVote: null });
      }
    }

    /***************/
    // Vote failsafe (I've experienced some weird bugs with firebase, some kind of race condition)
    const failSafeEligibleTypes = [
      VoteType.INITIAL_RESHUFFLE,
      VoteType.ACCEPT_PROPOSED_MOVE,
      VoteType.START_VOTE,
    ] as const;

    if (
      !!currentVote &&
      failSafeEligibleTypes.includes(currentVote.type) &&
      currentVote.votes.every((v) => v.voted === false)
    ) {
      functions.logger.log("Failsafe: resetting currentVote");
      return updateCurrGame({ currentVote: null });
    }

    if (gameOver) return functions.logger.log("GAME OVER");

    // Game is over if the pouch is empty and one player has no tiles
    const [winningPlayerId] =
      Object.entries(playerHands).find(
        ([_, hand]) => hand.filter(Boolean).length === 0
      ) ?? [];

    if (tilePouch.length === 0 && winningPlayerId) {
      // Winning player gets the points of the remaining tiles
      const score = cloneDeep(state.score);
      const points = computeRemainingTilesScore(state, template);

      score.total[winningPlayerId] += points;
      score.perTurn.push({
        playerId: winningPlayerId,
        turn: currentTurn + 1,
        score: points,
      });

      const payload = {
        gameOver: true,
        score,
      } satisfies Partial<DbGamePayload>;

      functions.logger.log("Game over!");
      updateCurrGame(payload);
    }

    functions.logger.log("Game updated. Nothing to do");
    return;
  });
