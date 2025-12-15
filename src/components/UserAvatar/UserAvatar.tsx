import { db } from "@/config/firebase";
import { getUserConfigSnapshot } from "@/services/collections/userConfig/userConfig";
import { UserConfig } from "@/services/collections/userConfig/userConfig.model";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  userId: string;
  diameter?: number;
  bounce?: boolean;
  shadingIndex?: number;
}

const useUserConfigSnapshot = (userId: string): UserConfig | null => {
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);

  useEffect(() => {
    if (!userId) {
      setUserConfig(null);
      return;
    }

    return getUserConfigSnapshot(db, userId, (data) => {
      setUserConfig(data);
    });
  }, [userId]);

  return userConfig;
};

const getInitials = (displayName?: string): string => {
  if (!displayName) return "?";

  const parts = displayName.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const glowColors = [
  "96, 165, 250", // blue-500
  "248, 113, 113", // red-500
  "74, 222, 128", // green-500
  "250, 204, 21", // yellow-500
] as const;

export const UserAvatar = ({
  userId,
  diameter = 40,
  bounce = false,
  shadingIndex,
}: UserAvatarProps) => {
  const userConfig = useUserConfigSnapshot(userId);
  const initials = getInitials(userConfig?.displayName);

  const glowColor = shadingIndex != null ? glowColors[shadingIndex] : undefined;
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
      <TooltipContent>
        <p>{userConfig?.displayName || "User"}</p>
      </TooltipContent>
    </Tooltip>
  );
};
