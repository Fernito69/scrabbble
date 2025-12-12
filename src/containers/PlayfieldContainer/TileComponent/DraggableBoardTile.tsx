import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { LetterLiteral } from "@/model/core.model";
import { TileComponent } from "./TileComponent";

interface Props {
  letter: LetterLiteral;
  x: number;
  y: number;
}

export const DraggableBoardTile = ({ letter, x, y }: Props) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `board-tile-${x}-${y}`,
      data: {
        letter,
        x,
        y,
        type: "board-tile",
        source: "board",
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TileComponent letter={letter} proposedMove />
    </div>
  );
};
