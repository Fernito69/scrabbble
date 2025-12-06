import { useGameContext } from "@/contexts/GameState.context";
import { Bonus, Move } from "@/model/core.model";
import { TileComponent } from "../TileComponent/TileComponent";
import { DroppableBoardSquare } from "./DroppableBoardSquare";
import { DraggableBoardTile } from "../TileComponent/DraggableBoardTile";

const bonusColorMap: Record<Bonus, string> = {
  [Bonus.DOUBLE_LETTER]: "bg-blue-200",
  [Bonus.DOUBLE_WORD]: "bg-yellow-200",
  [Bonus.TRIPLE_LETTER]: "bg-blue-600 text-white",
  [Bonus.TRIPLE_WORD]: "bg-red-600 text-white",
};

const bonusMessageMap: Record<Bonus, string[]> = {
  [Bonus.DOUBLE_LETTER]: ["Double", "Letter"],
  [Bonus.DOUBLE_WORD]: ["Double", "Word"],
  [Bonus.TRIPLE_LETTER]: ["Triple", "Letter"],
  [Bonus.TRIPLE_WORD]: ["Triple", "Word"],
};

export const BoardComponent = () => {
  // Context
  const { state, template, localProposedMove } = useGameContext();

  // Render
  if (!template || !state) return null;

  const { board, currentProposedMove } = state;

  return (
    <div className="flex justify-center items-center">
      <div className="flex justify-center items-center p-8 rounded-xl bg-green-200 border-green-400 border-1">
        <div className="grid grid-cols-15 gap-0 w-[720px]">
          {board.map((row, yIndex) =>
            row.map(({ tile, bonus }, xIndex) => {
              const key = `${xIndex}-${yIndex}`;

              // Check whether it's a proposed move
              const proposedMove: Move | undefined = (
                localProposedMove ?? currentProposedMove?.move
              )?.find((m) => m.x === xIndex && m.y === yIndex);

              const letter = proposedMove?.letter ?? tile?.letter;

              const squareColor = bonus
                ? bonusColorMap[bonus ?? Bonus.DOUBLE_LETTER]
                : "bg-green-600";

              // Empty square
              if (!letter) {
                return (
                  <DroppableBoardSquare
                    key={key}
                    x={xIndex}
                    y={yIndex}
                    squareColor={squareColor}
                  >
                    <div className="text-[10px] flex flex-col items-center justify-center h-full">
                      {bonus &&
                        bonusMessageMap[bonus].map((v, i) => (
                          <p key={i}>{v}</p>
                        ))}
                    </div>
                  </DroppableBoardSquare>
                );
              }

              // Tile
              return (
                <DroppableBoardSquare
                  key={key}
                  x={xIndex}
                  y={yIndex}
                  squareColor={squareColor}
                >
                  {proposedMove ? (
                    <DraggableBoardTile letter={letter} x={xIndex} y={yIndex} />
                  ) : (
                    <TileComponent letter={letter} proposedMove={false} />
                  )}
                </DroppableBoardSquare>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
