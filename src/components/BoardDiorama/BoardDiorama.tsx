import { cn } from "@/lib/utils";
import { GameState, Move } from "@/model/core.model";
import { bonusColorMap } from "@/services/collections/game/game.utils";

interface Props {
  game: GameState;
}
export const BoardDiorama = ({ game }: Props) => {
  // Consts
  const { board, currentProposedMove } = game;

  // Render
  return (
    <div className="flex justify-center items-center border border-green-800 min-w-[60px]">
      <div className="grid grid-cols-15 gap-0">
        {board.map((row, yIndex) =>
          row.map(({ tile, bonus }, xIndex) => {
            const key = `${xIndex}-${yIndex}`;

            // Check whether it's a proposed move
            const proposedMove: Move | undefined =
              currentProposedMove?.move?.find(
                (m) => m.x === xIndex && m.y === yIndex
              );

            const letter = proposedMove?.letter ?? tile?.letter;

            const squareColor = letter
              ? proposedMove
                ? "bg-yellow-300"
                : "bg-white"
              : bonus
              ? bonusColorMap[bonus]
              : "bg-green-600";

            const className = cn(
              squareColor,
              "w-[4px] h-[4px]",
              letter
                ? proposedMove
                  ? "border border-red-500"
                  : "border border-gray-600"
                : ""
            );

            return <div key={key} className={className} />;
          })
        )}
      </div>
    </div>
  );
};
