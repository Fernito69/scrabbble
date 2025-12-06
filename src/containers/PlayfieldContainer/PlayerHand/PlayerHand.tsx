import { useGameContext } from "@/contexts/GameState.context";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTile } from "../TileComponent/SortableTile";

interface Props {}

export const PlayerHand = ({}: Props) => {
  const { localPlayerHand } = useGameContext();

  const { setNodeRef, isOver } = useDroppable({
    id: "player-hand-drop-zone",
    data: {
      type: "hand-zone",
    },
  });

  // Create unique IDs for each tile
  const tileIds = localPlayerHand.map((_, i) => `hand-tile-${i}`);

  return (
    <div className="flex justify-center items-center w-full">
      <div
        ref={setNodeRef}
        className={`w-full flex justify-center items-center w-[720px] bg-green-200 p-2 border border-black rounded-md transition-colors ${
          isOver ? "ring-2 ring-blue-500 z-10" : ""
        }`}
      >
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
      </div>
    </div>
  );
};
