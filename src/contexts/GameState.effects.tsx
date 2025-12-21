import { MAX_PLAYERS, PLAYER_HAND_LENGTH } from "@/model/core.defaults";
import { PlayerIds } from "@/model/core.model";
import { useAddMessage } from "@/services/collections/game/chat/chat.hooks";
import { ChatMessageBase } from "@/services/collections/game/chat/chat.model";
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
  localPlayerHand,
}: UseGameStateEffects) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Mutations
  const updateGame = useUpdateGame(gameId);
  const addChatMessage = useAddMessage(gameId);

  /***************/
  // HACK: there's a bug that duplicates a tile when you're moving it around.
  // While I don't figure  out why, this is a fugly workaround
  /***************/
  const TILER_ERROR_KEY = "tileError";
  useEffect(() => {
    const tileError = localStorage.getItem(TILER_ERROR_KEY);
    if (tileError) {
      localStorage.removeItem(TILER_ERROR_KEY);
      toast(t("lobby.tileError"));
    }
  }, []);

  useEffect(() => {
    if (localPlayerHand.length > PLAYER_HAND_LENGTH) {
      localStorage.setItem(TILER_ERROR_KEY, JSON.stringify(TILER_ERROR_KEY));
      window.location.reload();
    }
  }, [localPlayerHand]);

  /***************/
  // Indicate player should play
  /***************/
  useEffect(() => {
    if (
      (isMyTurn && !state?.currentVote) ||
      (!isMyTurn &&
        state?.currentVote &&
        state.currentVote.votes.some(
          (v) => v.playerId === user?.uid && v.voted === null
        ))
    ) {
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
      toast(t("lobby.tooManyPlayers"));
      navigate("/");
      return;
    }

    // If player doesn't belong to the game, redirect to lobby
    if (!userIsPartOfGame && state.gameStarted) {
      toast(t("lobby.notPartOfGame"));
      navigate("/");
      return;
    }

    // If already started, redirect to lobby
    if (state.gameStarted) {
      toast(t("lobby.alreadyStarted"));
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

    // Add welcome message
    addChatMessage({
      text: t("lobby.userJoined", { userName: user?.displayName ?? "User" }),
    } satisfies ChatMessageBase);

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
