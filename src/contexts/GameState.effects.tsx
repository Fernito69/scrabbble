import { MAX_PLAYERS } from "@/model/core.defaults";
import { PlayerIds } from "@/model/core.model";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import { DbGamePayload } from "@/services/collections/game/game.model";
import {
  drawCards,
  playNotificationSound,
} from "@/services/collections/game/game.utils";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { DefaultGame, UseGameStateEffects } from "./GameState.model";

export const useGameStateEffects = ({
  gameId,
  state,
  template,
  numPlayers,
  initialPlayerHand,
  initted,
  setInitted,
  isMyTurn,
  setLocalPlayerHand,
  hasError,
}: UseGameStateEffects) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Mutations
  const updateGame = useUpdateGame(gameId);

  /***************/
  // Indicate player turn
  /***************/
  useEffect(() => {
    if (isMyTurn) {
      playNotificationSound();
    }
  }, [isMyTurn]);

  /***************/
  // Indicate vote
  /***************/
  useEffect(() => {
    if (!!state?.currentVote && state.currentVote.proposerId !== user?.uid) {
      playNotificationSound(1);
    }
  }, [!!state?.currentVote]);

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
    }) as PlayerIds;

    const payload = {
      tilePouch,
      playerIds,
      currentVote: state.currentVote
        ? {
            ...state.currentVote,
            votes: [
              ...state.currentVote.votes,
              { playerId: user.uid, voted: null },
            ],
          }
        : null,
      playerHands: {
        ...state.playerHands,
        [user.uid]: hand,
      },
    } satisfies Partial<DbGamePayload>;

    updateGame(payload);

    setInitted(true);

    return () => setInitted(false);
  }, [state, template, user]);

  /***************/
  // Update local player hand if a change is detected in the db
  /***************/
  useEffect(() => {
    setLocalPlayerHand(initialPlayerHand ?? DefaultGame.localPlayerHand);
  }, [initialPlayerHand]);
};
