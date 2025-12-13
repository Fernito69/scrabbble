import { ConfirmationDialog } from "@/components/Dialog/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { VoteType } from "@/model/core.model";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import {
  buildProposeMovePayload,
  buildReshuffleVotePayload,
  buildSkipTurnPayload,
  isMoveValid,
} from "@/services/collections/game/game.utils";
import { toast } from "sonner";
import { ReadyCheckbox } from "./ReadyCheckbox/ReadyCheckbox";
import { AcceptProposedMoveCheckbox } from "./AcceptProposedMoveCheckbox/AcceptProposedMoveCheckbox";

export const PlayerControls = () => {
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

  const handleReshuffle = () => {
    if (!state) return;
    updateGame(buildReshuffleVotePayload(state, user));
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
    !state.gameStarted && state.playerIds.filter(Boolean).length > 1;
  const showProposedMoveCheckbox =
    state.currentVote?.type === VoteType.ACCEPT_PROPOSED_MOVE;

  const showControls =
    !proposeMoveButtonDisabled ||
    showSkipTurnButton ||
    showReshuffleButton ||
    showProposedMoveCheckbox;

  // Render
  return (
    showControls && (
      <div className="flex h-16 w-fit flex-row gap-2 p-2 border border-black rounded-md bg-gray-100 items-center">
        {isMyTurn && (
          <>
            <ConfirmationDialog
              isDisabled={proposeMoveButtonDisabled}
              title="Propose move"
              description="Are you sure you want to propose this move?"
              onAccept={handleProposeMove}
              triggerElement={
                <Button
                  className="text-sm"
                  disabled={proposeMoveButtonDisabled}
                >
                  Propose move
                </Button>
              }
            />
            {showSkipTurnButton && (
              <ConfirmationDialog
                title="Skip"
                description="Are you sure you want to skip your turn?"
                onAccept={handleSkipTurn}
                triggerElement={
                  <Button className="text-sm" variant={"destructive"}>
                    Skip turn
                  </Button>
                }
              />
            )}
          </>
        )}
        {showReadyCheckbox && <ReadyCheckbox vote={state.currentVote!} />}
        {showReshuffleButton && (
          <ConfirmationDialog
            title="Request reshuffle"
            description="What a shitty hand! Do you want to request a reshuffle?"
            onAccept={handleReshuffle}
            triggerElement={
              <Button className="text-sm" variant={"destructive"}>
                Reshuffle hands
              </Button>
            }
          />
        )}
        {showProposedMoveCheckbox && <AcceptProposedMoveCheckbox />}
      </div>
    )
  );
};
