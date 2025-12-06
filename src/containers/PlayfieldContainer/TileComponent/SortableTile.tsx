import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LetterLiteral } from "@/model/core.model";
import { TileComponent } from "./TileComponent";

interface Props {
  id: string;
  letter: LetterLiteral | null;
  index: number;
}

export const SortableTile = ({ id, letter, index }: Props) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex w-16 h-16 bg-gray-500 border border-black rounded-md items-center justify-center"
    >
      {letter != null ? <TileComponent letter={letter} /> : null}
    </div>
  );
};
