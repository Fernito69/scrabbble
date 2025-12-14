import { MAX_PLAYERS } from "@/model/core.defaults";
import { Vote, VoteType } from "@/model/core.model";
import {
  useReshuffleGame,
  useUpdateGame,
} from "@/services/collections/game/game.hooks";
import { DbGamePayload } from "@/services/collections/game/game.model";
import {
  buildMovePayload,
  computeRemainingTilesScore,
  drawCards,
} from "@/services/collections/game/game.utils";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { DefaultGame, UseGameStateEffects } from "./GameState.model";
import { cloneDeep } from "lodash";
import { useTranslation } from "react-i18next";

export const useGameStateEffects = ({
  gameId,
  state,
  template,
  numPlayers,
  isGameOrganizer,
  initialPlayerHand,
  initted,
  setInitted,
  setLocalPlayerHand,
  hasError,
}: UseGameStateEffects) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Mutations
  const updateGame = useUpdateGame(gameId);
  const reshuffleGame = useReshuffleGame(gameId);

  /***************/
  // Missing game failsafe
  /***************/
  useEffect(() => {
    if (hasError) {
      toast(t("lobby.missingGame"));
      navigate("/");
    }
  }, [hasError, t, navigate]);

  /**********/
  // Add new players to game
  /**********/
  useEffect(() => {
    if (initted || !user || !template || !state) return;

    let userIsPartOfGame = state.playerIds.includes(user.uid);

    if (userIsPartOfGame) return;

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
    const { hand, tilePouch } = drawCards(state.tilePouch);
    const playerIds = state.playerIds.map((v) => {
      if (v === null && !userIsPartOfGame) {
        userIsPartOfGame = true;
        return user.uid;
      }
      return v;
    });

    const payload = {
      tilePouch,
      playerIds,
      playerHands: {
        ...state.playerHands,
        [user.uid]: hand,
      },
    } as Partial<DbGamePayload>;

    updateGame(payload);

    setInitted(true);

    return () => setInitted(false);
  }, [state, template, user]);

  /***************/
  // Initial vote
  /***************/
  useEffect(() => {
    if (!state?.currentVote || !isGameOrganizer) return;
    if (numPlayers > 1 && !state.currentVote && !state.gameStarted) {
      const currentVote = {
        type: VoteType.START_VOTE,
        voteFinished: false,
        votes: state.playerIds
          .filter(Boolean)
          .map((id) => ({ playerId: id!, voted: false })),
      } satisfies Vote;

      updateGame({ currentVote });
    }
  }, [state?.currentVote]);

  /***************/
  // Vote for proposed move
  /***************/
  useEffect(() => {
    if (
      !isGameOrganizer ||
      state?.currentVote?.type !== VoteType.ACCEPT_PROPOSED_MOVE ||
      !template
    )
      return;

    const payload = buildMovePayload(state, template);

    if (payload) updateGame(payload);
  }, [state?.currentVote]);

  /***************/
  // Vote for reshuffle
  /***************/
  useEffect(() => {
    if (
      !isGameOrganizer ||
      state?.currentVote?.type !== VoteType.RESHUFFLE ||
      !template
    )
      return;

    // Shuffle accepted
    if (state.currentVote.votes.every((v) => !!v.voted)) {
      reshuffleGame(state, template);
    }
    // Shuffle rejected
    else if (state.currentVote.votes.every((v) => v.voted === false)) {
      updateGame({
        currentVote: null,
      });
    }
  }, [state?.currentVote]);

  /***************/
  // Vote failsafe (I've experienced some weird bugs with firebase, some kind of race condition)
  useEffect(() => {
    const failSafeEligibleTypes = [
      VoteType.RESHUFFLE,
      VoteType.ACCEPT_PROPOSED_MOVE,
      VoteType.START_VOTE,
    ] as const;

    if (
      isGameOrganizer &&
      state?.currentVote &&
      failSafeEligibleTypes.includes(state.currentVote.type) &&
      state.currentVote.votes.every((v) => v.voted === false)
    ) {
      updateGame({ currentVote: null });
    }
  }, [state?.currentVote]);

  /***************/
  // Update local player hand if a change is detected in the db
  /***************/
  useEffect(() => {
    setLocalPlayerHand(initialPlayerHand ?? DefaultGame.localPlayerHand);
  }, [initialPlayerHand]);

  /***************/
  // End of the game
  /***************/
  useEffect(() => {
    if (!state || state.gameOver || !template || !state.gameStarted) return;

    // Game is over if the pouch is empty and one player has no tiles
    const [winningPlayerId] =
      Object.entries(state.playerHands).find(
        ([_, hand]) => hand.filter(Boolean).length === 0
      ) ?? [];

    if (state.tilePouch.length === 0 && winningPlayerId) {
      // Winning player gets the points of the remaining tiles
      const score = cloneDeep(state.score);
      const points = computeRemainingTilesScore(state, template);

      score.total[winningPlayerId] += points;
      score.perTurn.push({
        playerId: winningPlayerId,
        turn: state.currentTurn + 1,
        score: points,
      });

      const payload = {
        gameOver: true,
        score,
      } satisfies Partial<DbGamePayload>;

      updateGame(payload);
    }
  }, [state?.tilePouch]);
};
