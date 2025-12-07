import { ConfirmationDialog } from "@/components/Dialog/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { VoteType } from "@/model/core.model";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import { DbGamePayload } from "@/services/collections/game/game.model";
import { isMoveValid } from "@/services/collections/game/game.utils";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { SortableTile } from "../TileComponent/SortableTile";
import { AcceptProposedMoveButton } from "./AcceptProposedMoveButton/AcceptProposedMoveButton";

interface Props {}

export const PlayerHand = ({}: Props) => {
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
  const { setNodeRef, isOver } = useDroppable({
    id: "player-hand-drop-zone",
    data: {
      type: "hand-zone",
    },
  });

  // Mutations
  const updateGame = useUpdateGame(gameId);

  if (!state) return null;

  // Handlers
  const handleProposeMove = () => {
    if (!valid) {
      return toast(error);
    }

    const payload = {
      currentProposedMove: {
        playerId: user!.uid,
        move: localProposedMove,
        tentativeNewHand: localPlayerHand,
      },
      currentVote: {
        type: VoteType.ACCEPT_PROPOSED_MOVE,
        description: "Accept proposed move",
        voteFinished: false,
        votes: state.playerIds.filter(Boolean).map((id) => ({
          playerId: id!,
          voted: id === user!.uid ? true : null,
        })),
      },
    } satisfies Partial<DbGamePayload>;

    // Update game and local state
    updateGame(payload);
    setLocalProposedMove([]);
  };

  // Consts
  const { valid, error } = isMoveValid(localProposedMove);

  // Create unique IDs for each tile
  const containerCn = `w-full flex justify-center items-center w-[720px] bg-green-200 gap-2 p-2 border border-black rounded-md transition-colors ${
    isOver ? "ring-2 ring-blue-500 z-10" : ""
  }`;
  const tileIds = localPlayerHand.map((_, i) => `hand-tile-${i}`);

  const proposeMoveButtonDisabled = !isMyTurn || !valid;

  const showControls = isMyTurn || !!state.currentVote;

  // Effects
  return (
    <div className="flex gap-2 justify-center items-center w-full">
      <div ref={setNodeRef} className={containerCn}>
        <div className="grid grid-cols-7 gap-2 w-[500px] bg-green-800 p-2 border border-black rounded-md items-center justify-center">
          <SortableContext
            items={tileIds}
            strategy={horizontalListSortingStrategy}
          >
            {localPlayerHand.map((letter, i) => (
              <SortableTile
                key={tileIds[i]}
                id={tileIds[i]}
                letter={letter}
                index={i}
              />
            ))}
          </SortableContext>
        </div>
        {showControls && (
          <div className="flex-1 flex flex-row h-fit p-2 border border-black rounded-md bg-gray-100 items-center">
            {isMyTurn && (
              <ConfirmationDialog
                isDisabled={proposeMoveButtonDisabled}
                title="Propose"
                description="Are you sure you want to propose this move?"
                onAccept={handleProposeMove}
                triggerElement={
                  <Button disabled={proposeMoveButtonDisabled}>Propose</Button>
                }
              />
            )}
            <AcceptProposedMoveButton />
          </div>
        )}
      </div>
    </div>
  );
};
