import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";

import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";
import { useGetUserConfig } from "@/services/collections/userConfig/userConfig.hooks";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LanguageSelectDialog } from "./LanguageSelectDialog/LanguageSelectDialog";
import { OngoingGames } from "./OngoingGames/OngoingGames";
import { ScrabbbbbbleLogo } from "@/components/ScrabbbbbbleLogo/ScrabbbbbbleLogo";

export const LobbyContainer = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  // Handlers
  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  // Data
  const userConfig = useGetUserConfig();

  // Consts
  const userName = userConfig?.displayName ?? user?.email;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <ScrabbbbbbleLogo size="text-4xl" />
          <p className="text-muted-foreground">
            {t("lobby.welcome", { userName })}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => setIsCreatingGame(true)}
            disabled={isCreatingGame}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingGame ? t("lobby.creatingGame") : t("lobby.createGame")}
          </button>

          <div className="flex gap-4">
            <LanguageSwitcher />
            <button
              onClick={handleSignOut}
              className="flex-1 px-6 py-3 border border-input rounded-md hover:bg-accent"
            >
              {t("lobby.signOut")}
            </button>
          </div>
        </div>
        {isCreatingGame && (
          <LanguageSelectDialog close={() => setIsCreatingGame(false)} />
        )}
      </div>
      <OngoingGames />
    </div>
  );
};
