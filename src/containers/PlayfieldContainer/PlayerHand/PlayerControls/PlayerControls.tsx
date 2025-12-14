import { ConfirmationDialog } from "@/components/Dialog/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { VoteType } from "@/model/core.model";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import {
  buildProposeMovePayload,
  buildInitialReshuffleVotePayload,
  buildSkipTurnPayload,
  isMoveValid,
  buildReshufflePayload,
} from "@/services/collections/game/game.utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ReadyCheckbox } from "./ReadyCheckbox/ReadyCheckbox";
import { AcceptProposedMoveCheckbox } from "./AcceptProposedMoveCheckbox/AcceptProposedMoveCheckbox";
import { PLAYER_HAND_LENGTH } from "@/model/core.defaults";

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

  const showControls =
    !proposeMoveButtonDisabled ||
    showSkipTurnButton ||
    showInitialReshuffleButton ||
    showReshuffleButton ||
    showProposedMoveCheckbox;

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
                    className="text-sm"
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
                  <Button className="text-sm" variant={"destructive"}>
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
            description={t("playerControls.requestReshuffleConfirm")}
            onAccept={handleInitialReshuffle}
            triggerElement={
              <Button className="text-sm" variant={"destructive"}>
                {t("playerControls.reshuffleHands")}
              </Button>
            }
          />
        )}
        {showReshuffleButton && (
          <ConfirmationDialog
            title={t("playerControls.requestReshuffle")}
            description={t("playerControls.requestReshuffleConfirm")}
            onAccept={handleReshuffle}
            triggerElement={
              <Button className="text-sm">
                {t("playerControls.reshuffleHand")}
              </Button>
            }
          />
        )}
        {showProposedMoveCheckbox && <AcceptProposedMoveCheckbox />}
      </div>
    )
  );
};
