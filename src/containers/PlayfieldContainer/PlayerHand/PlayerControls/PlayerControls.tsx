import { ConfirmationDialog } from "@/components/Dialog/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { SendHorizontal, Shuffle, SkipForward, Undo } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useClickToSelect } from "../../useClickToSelect.hook";
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
  const clickToSelect = useClickToSelect();

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
    setLocalPlayerHand(state.playerHands[user!.uid]);
    setLocalProposedMove([]);
    updateGame(buildReshufflePayload(state, user));
  };

  const handleRecallTiles = () => {
    if (!state) return;
    clickToSelect.clearSelection();
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
  const { valid, error } = isMoveValid(localProposedMove, state.currentTurn);

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
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ConfirmationDialog
                      isDisabled={proposeMoveButtonDisabled}
                      title={t("playerControls.proposeMove")}
                      description={t("playerControls.proposeMoveConfirm")}
                      onAccept={handleProposeMove}
                      triggerElement={
                        <Button
                          size="icon"
                          disabled={proposeMoveButtonDisabled}
                        >
                          <SendHorizontal className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("playerControls.proposeMove")}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {showSkipTurnButton && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ConfirmationDialog
                      title={t("playerControls.skip")}
                      description={t("playerControls.skipTurnConfirm")}
                      onAccept={handleSkipTurn}
                      triggerElement={
                        <Button size="icon" variant={"destructive"}>
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("playerControls.skipTurn")}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </>
        )}
        {showReadyCheckbox && <ReadyCheckbox vote={state.currentVote!} />}
        {showInitialReshuffleButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ConfirmationDialog
                  title={t("playerControls.requestReshuffle")}
                  description={t(
                    "playerControls.requestInitialReshuffleConfirm"
                  )}
                  onAccept={handleInitialReshuffle}
                  triggerElement={
                    <Button size="icon" variant={"destructive"}>
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("playerControls.reshuffleInitialHands")}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {showReshuffleButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ConfirmationDialog
                  title={t("playerControls.reshuffleHand")}
                  description={t("playerControls.requestReshuffleConfirm")}
                  onAccept={handleReshuffle}
                  triggerElement={
                    <Button
                      size="icon"
                      className="bg-yellow-500 hover:bg-yellow-400"
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("playerControls.reshuffleHand")}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {showRecallTilesButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleRecallTiles}
                size="icon"
                className="bg-green-600 hover:bg-green-700"
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("playerControls.recallTiles")}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {showProposedMoveCheckbox && <AcceptProposedMoveCheckbox />}
      </div>
    )
  );
};
