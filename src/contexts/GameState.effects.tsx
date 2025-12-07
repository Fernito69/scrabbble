import { MAX_PLAYERS } from "@/model/core.defaults";
import { Vote, VoteType } from "@/model/core.model";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import { DbGamePayload } from "@/services/collections/game/game.model";
import {
  buildMovePayload,
  drawCards,
} from "@/services/collections/game/game.utils";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { DefaultGame, UseGameStateEffects } from "./GameState.model";

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
}: UseGameStateEffects) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mutations
  const updateGame = useUpdateGame(gameId);

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
    if (!state || !isGameOrganizer) return;
    if (numPlayers > 1 && !state.currentVote && !state.gameStarted) {
      const currentVote = {
        type: VoteType.START_VOTE,
        description: "Waiting until all players are ready to start the game",
        voteFinished: false,
        votes: state.playerIds
          .filter(Boolean)
          .map((id) => ({ playerId: id!, voted: false })),
      } satisfies Vote;

      updateGame({ currentVote });
    }
  }, [state]);

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
  // Update local player hand if a change is detected in the db
  /***************/
  useEffect(() => {
    setLocalPlayerHand(initialPlayerHand ?? DefaultGame.localPlayerHand);
  }, [initialPlayerHand]);
};
