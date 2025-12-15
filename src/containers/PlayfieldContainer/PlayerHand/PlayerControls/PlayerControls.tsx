import { ConfirmationDialog } from "@/components/Dialog/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { PLAYER_HAND_LENGTH } from "@/model/core.defaults";
import { PlayerHand, VoteType } from "@/model/core.model";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import {
  buildInitialReshuffleVotePayload,
  buildProposeMovePayload,
  buildReshufflePayload,
  buildSkipTurnPayload,
  isMoveValid,
} from "@/services/collections/game/game.utils";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AcceptProposedMoveCheckbox } from "./AcceptProposedMoveCheckbox/AcceptProposedMoveCheckbox";
import { ReadyCheckbox } from "./ReadyCheckbox/ReadyCheckbox";

export const PlayerControls = () => {
  // Hooks
  const { t } = useTranslation();

  // Context
  const { user } = useAuth();
  const {
    localPlayerHand,
    localProposedMove,
    isMyTurn,
    gameId,
    setLocalProposedMove,
    setLocalPlayerHand,
    state,
  } = useGameContext();

  // Mutations
  const updateGame = useUpdateGame(gameId);

  if (!state) return null;

  // Handlers
  const handleProposeMove = () => {
    if (!valid) {
      return toast(error);
    }

    updateGame(
      buildProposeMovePayload(localProposedMove, localPlayerHand, state, user)
    );
    setLocalProposedMove([]);
  };

  const handleSkipTurn = () => {
    if (!state || !user) return;
    updateGame(buildSkipTurnPayload(user.uid, state));
    setLocalProposedMove([]);
  };

  const handleInitialReshuffle = () => {
    if (!state) return;
    updateGame(buildInitialReshuffleVotePayload(state, user));
  };

  const handleReshuffle = () => {
    if (!state) return;
    updateGame(buildReshufflePayload(state, user));
  };

  const handleRecallTiles = () => {
    if (!state) return;
    setLocalPlayerHand((prev) => {
      const newHand = [
        ...prev.filter(Boolean),
        ...localProposedMove.map((m) => m.letter),
      ] as PlayerHand;

      if (newHand.length < PLAYER_HAND_LENGTH) {
        newHand.push(...Array(PLAYER_HAND_LENGTH - newHand.length).fill(null));
      }

      return newHand;
    });
    setLocalProposedMove([]);
  };

  // Consts
  const { valid, error } = isMoveValid(localProposedMove);

  const showReadyCheckbox =
    state.currentVote?.type === VoteType.START_VOTE &&
    !state.currentVote?.voteFinished &&
    !state.gameStarted;
  const proposeMoveButtonDisabled = !isMyTurn || !valid;
  const showSkipTurnButton = isMyTurn && !state.currentVote;
  const showReshuffleButton =
    isMyTurn &&
    !state.currentVote &&
    state.tilePouch.length >= PLAYER_HAND_LENGTH &&
    state.playerHands[user!.uid].length >= PLAYER_HAND_LENGTH;
  const showInitialReshuffleButton =
    !state.gameStarted && state.playerIds.filter(Boolean).length > 1;
  const showProposedMoveCheckbox =
    state.currentVote?.type === VoteType.ACCEPT_PROPOSED_MOVE;
  const showRecallTilesButton =
    isMyTurn && !state.currentVote && localProposedMove.length > 0;

  const showControls =
    !proposeMoveButtonDisabled ||
    showSkipTurnButton ||
    showInitialReshuffleButton ||
    showReshuffleButton ||
    showProposedMoveCheckbox ||
    showRecallTilesButton;

  // Render
  return (
    showControls && (
      <div className="flex h-24 w-fit flex-row gap-2 p-2 border border-gray-400 shadow rounded-md bg-gray-50 items-center">
        {isMyTurn && (
          <>
            {!state.currentVote && (
              <ConfirmationDialog
                isDisabled={proposeMoveButtonDisabled}
                title={t("playerControls.proposeMove")}
                description={t("playerControls.proposeMoveConfirm")}
                onAccept={handleProposeMove}
                triggerElement={
                  <Button
                    className="text-xs"
                    disabled={proposeMoveButtonDisabled}
                  >
                    {t("playerControls.proposeMove")}
                  </Button>
                }
              />
            )}
            {showSkipTurnButton && (
              <ConfirmationDialog
                title={t("playerControls.skip")}
                description={t("playerControls.skipTurnConfirm")}
                onAccept={handleSkipTurn}
                triggerElement={
                  <Button className="text-xs" variant={"destructive"}>
                    {t("playerControls.skipTurn")}
                  </Button>
                }
              />
            )}
          </>
        )}
        {showReadyCheckbox && <ReadyCheckbox vote={state.currentVote!} />}
        {showInitialReshuffleButton && (
          <ConfirmationDialog
            title={t("playerControls.requestReshuffle")}
            description={t("playerControls.requestInitialReshuffleConfirm")}
            onAccept={handleInitialReshuffle}
            triggerElement={
              <Button className="text-xs" variant={"destructive"}>
                {t("playerControls.reshuffleInitialHands")}
              </Button>
            }
          />
        )}
        {showReshuffleButton && (
          <ConfirmationDialog
            title={t("playerControls.reshuffleHand")}
            description={t("playerControls.requestReshuffleConfirm")}
            onAccept={handleReshuffle}
            triggerElement={
              <Button className="text-xs">
                {t("playerControls.reshuffleHand")}
              </Button>
            }
          />
        )}
        {showRecallTilesButton && (
          <Button
            onClick={handleRecallTiles}
            className="text-xs bg-green-600 hover:bg-green-700"
          >
            {t("playerControls.recallTiles")}
          </Button>
        )}
        {showProposedMoveCheckbox && <AcceptProposedMoveCheckbox />}
      </div>
    )
  );
};
