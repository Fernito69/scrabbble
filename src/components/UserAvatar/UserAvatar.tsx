import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PLAYER_COLORS } from "@/services/collections/game/game.defaults";
import { getInitials } from "@/services/collections/userConfig/useConfig.utils";
import { useUserConfigSnapshot } from "@/services/collections/userConfig/userConfig.hooks";

interface UserAvatarProps {
  userId: string;
  diameter?: number;
  bounce?: boolean;
  shadingIndex?: number;
  hidePicture?: boolean;
}

export const UserAvatar = ({
  userId,
  diameter = 40,
  bounce = false,
  shadingIndex,
  hidePicture = false,
}: UserAvatarProps) => {
  const userConfig = useUserConfigSnapshot(userId);
  const initials = getInitials(userConfig?.displayName);

  const glowColor =
    shadingIndex != null ? PLAYER_COLORS[shadingIndex].glow : undefined;
  const glowStyle = glowColor
    ? {
        boxShadow: `
          0 0 2px rgba(${glowColor}, 0.9),
          0 0 4px rgba(${glowColor}, 0.8),
          0 0 6px rgba(${glowColor}, 0.7),
          0 0 8px rgba(${glowColor}, 0.6),
          0 0 10px rgba(${glowColor}, 0.5)
        `,
      }
    : {};

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "rounded-full flex items-center justify-center overflow-hidden bg-gray-300 text-gray-700 font-semibold",
            bounce ? "animate-bounce" : ""
          )}
          style={{
            width: `${diameter}px`,
            height: `${diameter}px`,
            fontSize: `${diameter * 0.4}px`,
            ...glowStyle,
          }}
        >
          {userConfig?.photoURL ? (
            <img
              src={userConfig.photoURL}
              alt={userConfig.displayName || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent className="flex flex-col items-center justify-center max-w-[600px] max-h-[600px] px-2">
        {userConfig?.photoURL && !hidePicture ? (
          <img
            src={userConfig.photoURL}
            alt={userConfig.displayName || "User"}
            className="max-w-[592px] max-h-[592px] border border-gray-300 rounded-sm mx-2 mb-2"
          />
        ) : null}
        <p className="font-semibold">{userConfig?.displayName || "User"}</p>
      </TooltipContent>
    </Tooltip>
  );
};
