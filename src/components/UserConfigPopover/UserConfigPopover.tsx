import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/services/collections/userConfig/useConfig.utils";
import {
  useUpdateUserConfig,
  useUserConfigSnapshot,
} from "@/services/collections/userConfig/userConfig.hooks";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { authService } from "@/services/auth";

interface Props {
  avatarSize?: number;
}

export const UserConfigPopover = ({ avatarSize = 32 }: Props) => {
  const { user } = useAuth();
  const userConfig = useUserConfigSnapshot(user!.uid);
  const { t } = useTranslation();

  const updateUserConfig = useUpdateUserConfig();

  // Handlers
  const handleRename = () => {
    const displayName =
      prompt(t("userConfig.enterName"), userConfig?.displayName) ??
      userConfig?.displayName ??
      "User";

    if (displayName === userConfig?.displayName) return;

    updateUserConfig({ displayName });
  };

  const handleLogout = () => {
    authService.signOut();
  };

  // TODO: Refactor avatar shit
  const initials = getInitials(userConfig?.displayName);

  return (
    <Popover>
      <PopoverTrigger asChild className="cursor-pointer">
        <div
          className="rounded-full flex items-center justify-center overflow-hidden bg-gray-300 text-gray-700 font-semibold"
          style={{
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
            fontSize: `${avatarSize * 0.4}px`,
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
      </PopoverTrigger>
      <PopoverContent className="w-64 flex flex-col gap-2">
        <Button variant={"outline"} onClick={handleRename}>
          {t("userConfig.changeName")}
        </Button>
        <Button variant={"outline"} onClick={handleLogout}>
          {t("userConfig.logout")}
        </Button>
      </PopoverContent>
    </Popover>
  );
};
