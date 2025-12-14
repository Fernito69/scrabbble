import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface Props {
  x: number;
  y: number;
  children: ReactNode;
  squareColor: string;
  onClick?: () => void;
}

export const DroppableBoardSquare = ({
  x,
  y,
  children,
  squareColor,
  onClick,
}: Props) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `board-${x}-${y}`,
    data: {
      x,
      y,
      type: "board-square",
    },
  });

  const squareClassName = cn(
    "w-12 h-12 border border-black transition-colors",
    squareColor,
    isOver && "ring-2 ring-blue-500"
  );

  return (
    <div ref={setNodeRef} className={squareClassName} onClick={onClick}>
      {children}
    </div>
  );
};
