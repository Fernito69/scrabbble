import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { cn } from "@/lib/utils";
import { useGetPlayerName } from "@/services/collections/userConfig/userConfig.hooks";

interface Props {
  playerId: string;
  colorIndex?: number;
}

const colorMap = ["bg-red-300", "bg-green-300", "bg-blue-300", "bg-yellow-300"];

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
    colorMap[colorIndex ?? playerIdx]
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
