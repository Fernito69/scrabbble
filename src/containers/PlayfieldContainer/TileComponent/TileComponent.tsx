import { useGameContext } from "@/contexts/GameState.context";
import { cn } from "@/lib/utils";
import { LetterLiteral } from "@/model/core.model";
import { PLAYER_COLORS } from "@/services/collections/game/game.defaults";
import { useGetUserConfig } from "@/services/collections/userConfig/userConfig.hooks";
import { Star } from "lucide-react";

interface Props {
  letter: LetterLiteral;
  wildcardValue?: LetterLiteral;
  isProposedMove?: boolean;
  x?: number;
  y?: number;
}
export const TileComponent = ({
  letter,
  isProposedMove = false,
  wildcardValue,
  x,
  y,
}: Props) => {
  // Data
  const userConfig = useGetUserConfig();

  // Context
  const { template, getPlayerNumber, state } = useGameContext();

  // Consts
  const letterScore = template?.scoreMap[letter];

  if (letterScore == null) return null;

  const tileOwnerId: string | undefined =
    y != null && x != null ? state?.board[y][x]?.tile?.ownerId : undefined;
  const playerIdx: number | undefined =
    tileOwnerId != null ? getPlayerNumber(tileOwnerId, true) : undefined;

  let inactiveTileColor: string =
    "border-r-gray-400 border-t-gray-400 border-l-gray-300 border-b-gray-300 bg-gray-100 text-gray-400";

  if (userConfig?.showTilePlayerColors && playerIdx != null) {
    inactiveTileColor = cn(
      PLAYER_COLORS[playerIdx].tile.bg,
      PLAYER_COLORS[playerIdx].tile.border,
      PLAYER_COLORS[playerIdx].tile.text
    );
  }

  const tileClassName = cn(
    "h-12 w-12 flex items-center justify-center text-2xl rounded-md shadow select-none border-2",
    isProposedMove
      ? "animate-border-spin animate-bg-cycle text-red-800"
      : inactiveTileColor
  );

  const scoreClassName = cn(
    "text-red-800 font-semibold",
    userConfig?.showTilePlayerColors &&
      playerIdx != null &&
      PLAYER_COLORS[playerIdx].tile.text != null
      ? PLAYER_COLORS[playerIdx].tile.text
      : isProposedMove
      ? "text-gray-500 opacity-50"
      : ""
  );

  // Render
  return (
    <div className="relative h-12 w-12">
      <div className={tileClassName}>
        {wildcardValue != null ? (
          wildcardValue.toUpperCase()
        ) : letter !== "0" ? (
          letter.toUpperCase()
        ) : (
          <Star className="text-yellow-500 h-5 w-5" />
        )}
      </div>
      {letterScore > 0 && (
        <div
          className={"absolute bottom-[1px] right-1 text-[10px]"}
          style={{ zIndex: isProposedMove ? 100 : undefined }}
        >
          <span className={scoreClassName}>{letterScore}</span>
        </div>
      )}
    </div>
  );
};
