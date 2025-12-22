import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { ScrabbbbbbleLogo } from "@/components/ScrabbbbbbleLogo/ScrabbbbbbleLogo";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserConfigPopover } from "@/components/UserConfigPopover/UserConfigPopover";
import { useAuth } from "@/contexts/AuthContext";
import {
  useGetUserConfig,
  useUpdateUserConfig,
} from "@/services/collections/userConfig/userConfig.hooks";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AllGames } from "./AllGames/AllGames";
import { LanguageSelectDialog } from "./LanguageSelectDialog/LanguageSelectDialog";
import { OngoingGames } from "./OngoingGames/OngoingGames";
import { PastGames } from "./PastGames/PastGames";
import { Ranking } from "./Ranking/Ranking";
import { UserConfig } from "@/services/collections/userConfig/userConfig.model";

export const LobbyContainer = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();

  // State
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  // Data
  const userConfig = useGetUserConfig();
  const updateUserConfig = useUpdateUserConfig();

  if (!userConfig) return null;

  // Handlers
  const handleTabValueChange = (value: string) => {
    updateUserConfig({ currentTab: value } satisfies Partial<UserConfig>);
  };

  // Consts
  const userName = userConfig?.displayName ?? user?.email;

  return (
    <>
      <div className="min-h-screen min-w-200 flex flex-col items-center justify-center bg-background p-8">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <ScrabbbbbbleLogo size="text-4xl" />
            <div className="text-muted-foreground items-center justify-center flex flex-row gap-2">
              {t("lobby.welcome", { userName })}
              <UserConfigPopover avatarSize={40} />
            </div>
          </div>

          <div className="flex flex-col gap-4 ">
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
        </div>
        <Separator className="my-4 max-w-2xl" />
        <Ranking />
        <Tabs
          onValueChange={handleTabValueChange}
          defaultValue={userConfig?.currentTab ?? "ongoing"}
        >
          <TabsList
            className={
              isAdmin
                ? "w-200 w-min-500 grid grid-cols-3 gap-2"
                : "w-200 w-min-500 grid grid-cols-2 gap-2"
            }
          >
            <TabsTrigger value="ongoing">{t("lobby.yourGames")}</TabsTrigger>
            <TabsTrigger value="waiting">{t("lobby.pastGames")}</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="all-last">
                {t("lobby.allLastGames")}
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="ongoing">
            <OngoingGames />
          </TabsContent>
          <TabsContent value="waiting">
            <PastGames />
          </TabsContent>
          {isAdmin && (
            <TabsContent value="all-last">
              <AllGames />
            </TabsContent>
          )}
        </Tabs>
      </div>
      {isCreatingGame && (
        <LanguageSelectDialog close={() => setIsCreatingGame(false)} />
      )}
    </>
  );
};
