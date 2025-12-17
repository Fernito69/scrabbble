import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { ScrabbbbbbleLogo } from "@/components/ScrabbbbbbleLogo/ScrabbbbbbleLogo";
import { UserConfigPopover } from "@/components/UserConfigPopover/UserConfigPopover";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserConfig } from "@/services/collections/userConfig/userConfig.hooks";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSelectDialog } from "./LanguageSelectDialog/LanguageSelectDialog";
import { OngoingGames } from "./OngoingGames/OngoingGames";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PastGames } from "./PastGames/PastGames";
import { Separator } from "@/components/ui/separator";

export const LobbyContainer = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // State
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  // Data
  const userConfig = useGetUserConfig();

  // Consts
  const userName = userConfig?.displayName ?? user?.email;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <ScrabbbbbbleLogo size="text-4xl" />
          <div className="text-muted-foreground items-center justify-center flex flex-row gap-2">
            {t("lobby.welcome", { userName })}
            <UserConfigPopover avatarSize={40} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <button
              onClick={() => setIsCreatingGame(true)}
              disabled={isCreatingGame}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("lobby.createGame")}
            </button>
            <LanguageSwitcher />
          </div>
        </div>
        {isCreatingGame && (
          <LanguageSelectDialog close={() => setIsCreatingGame(false)} />
        )}
      </div>
      <Separator className="my-4 text-muted-foreground w-full max-w-2xl" />
      <Tabs defaultValue="ongoing">
        <TabsList className="w-full grid grid-cols-2 gap-4">
          <TabsTrigger value="ongoing">{t("lobby.yourGames")}</TabsTrigger>
          <TabsTrigger value="waiting">{t("lobby.pastGames")}</TabsTrigger>
        </TabsList>
        <TabsContent value="ongoing">
          <OngoingGames />
        </TabsContent>
        <TabsContent value="waiting">
          <PastGames />
        </TabsContent>
      </Tabs>
    </div>
  );
};
