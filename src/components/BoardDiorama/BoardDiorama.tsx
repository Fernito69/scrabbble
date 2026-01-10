import { cn } from "@/lib/utils";
import { Bonus, GameState, Move } from "@/model/core.model";
import { PLAYER_COLORS } from "@/services/collections/game/game.defaults";
import { useGetUserConfig } from "@/services/collections/userConfig/userConfig.hooks";

export const bonusColorMap: Record<Bonus, string> = {
  [Bonus.DOUBLE_LETTER]: "bg-gradient-to-br from-blue-300 to-blue-100",
  [Bonus.DOUBLE_WORD]: "bg-gradient-to-br from-yellow-300 to-yellow-200",
  [Bonus.TRIPLE_LETTER]: "bg-gradient-to-br from-blue-600 to-blue-400",
  [Bonus.TRIPLE_WORD]: "bg-gradient-to-br from-red-600 to-red-400",
};

interface Props {
  game: GameState;
}

export const BoardDiorama = ({ game }: Props) => {
  // Data
  const userConfig = useGetUserConfig();

  // Consts
  const { board, currentProposedMove, playerIds } = game;

  // Render
  return (
    <div className="flex justify-center items-center border border-green-800 w-fit">
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
              : "bg-gradient-to-br from-green-900 to-green-700";

            const tileOwnerId: string | undefined =
              board[yIndex][xIndex]?.tile?.ownerId;

            const playerIdx: number | undefined =
              tileOwnerId != null ? playerIds.indexOf(tileOwnerId)! : undefined;

            let inactiveTileColor: string =
              "border border-gray-400 bg-gray-100 text-gray-400 rounded-xs";

            if (playerIdx != null && userConfig?.showTilePlayerColors) {
              inactiveTileColor = cn(
                "border",
                PLAYER_COLORS[playerIdx].tile.bg,
                PLAYER_COLORS[playerIdx].tile.border
              );
            }

            const className = cn(
              squareColor,
              "w-[4px] h-[4px]",
              letter
                ? proposedMove
                  ? "border border-red-500"
                  : inactiveTileColor
                : ""
            );

            return <div key={key} className={className} />;
          })
        )}
      </div>
    </div>
  );
};
