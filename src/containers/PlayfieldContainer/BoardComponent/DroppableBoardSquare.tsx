import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface Props {
  x: number;
  y: number;
  children: ReactNode;
  squareColor: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export const DroppableBoardSquare = ({
  x,
  y,
  children,
  squareColor,
  onClick,
  isSelected,
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
    "w-12 h-12 border border-black transition-colors relative",
    squareColor,
    isOver && "ring-2 ring-blue-500",
    isSelected && "border-2 border-yellow-400"
  );

  return (
    <div ref={setNodeRef} className={squareClassName} onClick={onClick}>
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-yellow-400/40 animate-pulse flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
