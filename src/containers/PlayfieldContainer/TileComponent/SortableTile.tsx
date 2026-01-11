import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LetterLiteral } from "@/model/core.model";
import { TileComponent } from "./TileComponent";

interface Props {
  id: string;
  letter: LetterLiteral | null;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export const SortableTile = ({
  id,
  letter,
  index,
  isSelected,
  onClick,
}: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      letter,
      index,
      type: "tile",
      source: "hand",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
      className={`flex w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-600 border border-black rounded-md items-center justify-center ${
        isSelected ? "ring-4 ring-yellow-400" : ""
      }`}
    >
      {letter != null ? <TileComponent letter={letter} /> : null}
    </div>
  );
};
