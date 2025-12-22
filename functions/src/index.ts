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
import { CHAT_COLLECTION } from "../../src/services/collections/game/chat/chat.defaults";
import { ChatMessageBase } from "../../src/services/collections/game/chat/chat.model";
import { GAME_COLLECTION } from "../../src/services/collections/game/game.defaults";
import { mapDbGamePayloadToGameState } from "../../src/services/collections/game/game.mappers";
import { DbGamePayload } from "../../src/services/collections/game/game.model";
import { RANKING_COLLECTION } from "../../src/services/collections/ranking/ranking.defaults";
import {
  buildMovePayload,
  computeRankingPayload,
  computeRemainingTilesScore,
  getEndOfGamePointsToSubtract,
  getInitialGamePayload,
} from "../../src/services/collections/game/game.utils";

admin.initializeApp();

export const firestore = admin.firestore() as any;

// Helpers
const isAccepted = (currentVote: Vote) =>
  currentVote.votes.every((v) => !!v.voted);
const isRejected = (currentVote: Vote) =>
  currentVote.votes.every((v) => v.voted === false);

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

// TODO: refactor
const computeRanking = async (
  firestore: admin.firestore.Firestore,
  playerId: string
) => {
  const rankingRef = firestore.collection(RANKING_COLLECTION).doc(playerId);

  // Get player's games
  const games: GameState[] = (
    await firestore
      .collection(GAME_COLLECTION)
      .where("playerIds", "array-contains", playerId)
      .where("gameOver", "==", true)
      .get()
  ).docs.map((doc) => mapDbGamePayloadToGameState(doc.data() as DbGamePayload));

  if (games.length === 0) return;

  const payload = computeRankingPayload(games, playerId);

  return rankingRef.set(payload);
};

/***************/
// This trigger is called every time a game is updated
/***************/
export const onGameUpdateTrigger = functions.firestore
  .document("games/{id}")
  .onUpdate(async (doc, context) => {
    const dbGame = doc.after.data() as DbGamePayload;
    const previousGame = doc.before.data() as DbGamePayload | undefined;
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
      tilePouch,
      playerHands,
      gameOver,
    } = state;

    if (gameOver) return functions.logger.log("GAME ALREADY OVER!!!");

    if (!previousGame?.gameStarted && gameStarted) {
      /***************/
      // Add a message if it's a new game
      /***************/
      functions.logger.log("GAME STARTED");
      try {
        // TODO: localize
        addChatMessage(firestore, gameId, {
          text: `LET'S GO!`,
        } satisfies ChatMessageBase);
      } catch (error) {
        functions.logger.error(
          "Error adding game started message",
          error,
          dbGame
        );
      }
    }

    /***************/
    // Add a message if it's a new turn
    /***************/
    const previousTurn = previousGame?.currentTurn ?? 0;

    if (currentTurn !== previousTurn) {
      functions.logger.log(
        "TURN CHANGE FROM " + previousTurn + " TO " + currentTurn
      );
      try {
        addChatMessage(firestore, gameId, {
          text: currentTurn,
        } satisfies ChatMessageBase);
      } catch (error) {
        functions.logger.error("Error adding turn message", error, dbGame);
      }
    }

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
        return updateCurrGame(payload);
      }
    }

    /***************/
    // Vote for initial hand reshuffle
    /***************/
    if (currentVote?.type === VoteType.INITIAL_RESHUFFLE && !!template) {
      // Shuffle accepted
      if (isAccepted(currentVote)) {
        const payload = {
          ...getInitialGamePayload(createdByUserId, template),
          gameName,
          currentVote: null,
        } satisfies Partial<DbGamePayload>;

        functions.logger.log("Initial shuffle accepted");
        return updateCurrGame(payload);
      }
      // Shuffle rejected
      else if (isRejected(currentVote)) {
        functions.logger.log("Initial shuffle rejected");
        return updateCurrGame({
          currentVote: null,
        } satisfies Partial<DbGamePayload>);
      }
    }

    const triggerRankingComputation = async () =>
      Promise.all(
        state.playerIds.filter(Boolean).map(async (playerId) => {
          functions.logger.log("Computing ranking for", playerId);
          return computeRanking(firestore, playerId!);
        })
      );

    /***************/
    // Vote for end of game
    /***************/
    if (currentVote?.type === VoteType.END_OF_GAME && !!template) {
      // End of game accepted
      if (isAccepted(currentVote)) {
        functions.logger.log("End of game accepted");

        // TODO: refactor to game.utils or something
        const payload = {
          gameOver: true,
          score: { ...cloneDeep(state.score) },
          currentVote: null,
        } satisfies Partial<DbGamePayload>;

        // Subtract points
        const pointsToSubtract = getEndOfGamePointsToSubtract(state, template);
        Object.keys(payload.score.total).forEach((playerId) => {
          payload.score.total[playerId] -= pointsToSubtract[playerId];
        });

        await triggerRankingComputation();
        return updateCurrGame(payload);
      }

      // End of game rejected
      else if (isRejected(currentVote)) {
        functions.logger.log("End of game rejected");
        return updateCurrGame({
          currentVote: null,
        } satisfies Partial<DbGamePayload>);
      }
    }

    /***************/
    // Vote failsafe (I've experienced some weird bugs with firebase, some kind of race condition maybe)
    const failSafeEligibleTypes: VoteType[] = [
      VoteType.INITIAL_RESHUFFLE,
      VoteType.ACCEPT_PROPOSED_MOVE,
      VoteType.START_VOTE,
      VoteType.END_OF_GAME,
    ];

    if (
      !!currentVote &&
      failSafeEligibleTypes.includes(currentVote.type) &&
      currentVote.votes.every((v) => v.voted === false)
    ) {
      functions.logger.log("Failsafe: resetting currentVote");
      try {
        updateCurrGame({
          currentVote: null,
        } satisfies Partial<DbGamePayload>);
      } catch (error) {
        functions.logger.error("Error resetting currentVote", error, dbGame);
      }
    }

    /***************/
    // GAME OVER
    /***************/

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

      functions.logger.log("GAME OVER! Scores:", score);
      await updateCurrGame(payload);

      // Trigger ranking computation after game has been updated
      await triggerRankingComputation();

      functions.logger.log("Rankings updated");
      return;
    }

    functions.logger.log("End of the function. Nothing to do");
    return;
  });
