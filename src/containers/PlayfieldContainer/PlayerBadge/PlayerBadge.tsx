import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { cn } from "@/lib/utils";
import { PLAYER_COLORS } from "@/services/collections/game/game.defaults";
import { useGetPlayerName } from "@/services/collections/userConfig/userConfig.hooks";

interface Props {
  playerId: string;
  colorIndex?: number;
}

export const PlayerBadge = ({ playerId, colorIndex }: Props) => {
  // Context
  const { user } = useAuth();
  const { state } = useGameContext();

  // Hooks
  const getPlayerName = useGetPlayerName();

  // Consts

  const playerIdx = state?.playerIds.indexOf(playerId) ?? -1;
  const className = cn(
    "flex flex-row gap-2 py-[2px] px-2 rounded-full w-fit items-center",
    PLAYER_COLORS[colorIndex ?? playerIdx].badgeBg
  );
  const isCurrentPlayer = user?.uid === playerId;

  return (
    <div className={className}>
      {getPlayerName(playerId)}
      {isCurrentPlayer && (
        <div className="flex items-center text-white bg-black rounded-md px-1 py-0 h-4 text-xs">
          YOU
        </div>
      )}
    </div>
  );
};
