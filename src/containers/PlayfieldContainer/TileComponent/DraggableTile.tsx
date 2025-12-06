import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { LetterLiteral } from "@/model/core.model";
import { TileComponent } from "./TileComponent";

interface Props {
  id: string;
  letter: LetterLiteral;
  index: number;
  proposedMove?: boolean;
}

export const DraggableTile = ({ id, letter, index, proposedMove }: Props) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: {
        letter,
        index,
        type: "tile",
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TileComponent letter={letter} proposedMove={proposedMove} />
    </div>
  );
};
