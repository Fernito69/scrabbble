import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { LetterLiteral } from "@/model/core.model";
import { TileComponent } from "./TileComponent";

interface Props {
  letter: LetterLiteral;
  x: number;
  y: number;
  isSelected?: boolean;
  onClick?: () => void;
  wildcardValue?: LetterLiteral;
}

export const DraggableBoardTile = ({
  letter,
  x,
  y,
  isSelected,
  wildcardValue,
  onClick,
}: Props) => {
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={
        isSelected
          ? "ring-4 ring-yellow-400 rounded select-none"
          : "select-none"
      }
    >
      <TileComponent
        letter={letter}
        isProposedMove
        wildcardValue={wildcardValue}
      />
    </div>
  );
};
