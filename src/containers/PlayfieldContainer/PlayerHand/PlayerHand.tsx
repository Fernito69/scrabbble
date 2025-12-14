import { useGameContext } from "@/contexts/GameState.context";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTile } from "../TileComponent/SortableTile";
import { PlayerControls } from "./PlayerControls/PlayerControls";

interface Props {}

export const PlayerHand = ({}: Props) => {
  // Context
  const { localPlayerHand, state } = useGameContext();
  const { setNodeRef, isOver } = useDroppable({
    id: "player-hand-drop-zone",
    data: {
      type: "hand-zone",
    },
  });

  if (!state) return null;

  // Create unique IDs for each tile
  const containerCn = `shadow w-fit flex justify-center items-center w-[720px] bg-green-200 gap-2 p-2 border border-black rounded-md transition-colors ${
    isOver ? "ring-2 ring-blue-500 z-10" : ""
  }`;
  const tileIds = localPlayerHand.map((_, i) => `hand-tile-${i}`);

  // Effects
  return (
    <div className="flex gap-2 justify-center items-center w-full">
      <div ref={setNodeRef} className={containerCn}>
        <div className="grid grid-cols-7 gap-2 w-[500px] shadow-md bg-green-800 p-2 border border-black rounded-md items-center justify-center">
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
        <PlayerControls />
      </div>
    </div>
  );
};
