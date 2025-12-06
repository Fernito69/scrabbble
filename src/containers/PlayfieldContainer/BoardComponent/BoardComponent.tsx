import { useGameContext } from "@/contexts/GameState.context";
import { cn } from "@/lib/utils";
import { Bonus, Move } from "@/model/core.model";
import { TileComponent } from "../TileComponent/TileComponent";

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
  const { state: { board, currentProposedMove } = {}, template } =
    useGameContext();

  // Render
  if (!board || !template) return null;

  return (
    <div className="flex justify-center items-center">
      <div className="flex justify-center items-center p-8 rounded-xl bg-green-200 border-green-400 border-1">
        <div className="grid grid-cols-15 gap-0 w-[720px]">
          {board.map((row, yIndex) =>
            row.map(({ tile, bonus }, xIndex) => {
              const key = `${xIndex}-${yIndex}`;

              // Check whether it's a proposed move
              const proposedMove: Move | undefined =
                currentProposedMove?.move?.find(
                  (m) => m.x === xIndex && m.y === yIndex
                );

              const letter = proposedMove?.letter ?? tile?.letter;

              // Empty square
              if (!letter) {
                const squareColor = bonus
                  ? bonusColorMap[bonus ?? Bonus.DOUBLE_LETTER]
                  : "bg-green-600";

                const squareClassName = cn(
                  "w-12 h-12 border border-black",
                  squareColor
                );

                return (
                  <div key={key} className={squareClassName}>
                    <div className="text-[10px] flex flex-col items-center justify-center h-full">
                      {bonus &&
                        bonusMessageMap[bonus].map((v, i) => (
                          <p key={i}>{v}</p>
                        ))}
                    </div>
                  </div>
                );
              }

              // Tile
              return (
                <TileComponent letter={letter} proposedMove={!!proposedMove} />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
