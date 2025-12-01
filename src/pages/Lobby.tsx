import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";
import { useGetUserConfig } from "@/services/collections/userConfig/userConfig.hooks";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { db } from "@/config/firebase";
import { createGame } from "@/services/collections/game/game";

export const Lobby = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const handleCreateGame = async () => {
    if (!user) return;

    setIsCreatingGame(true);
    try {
      const gameId = await createGame(db, user.uid);
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error("Failed to create game:", error);
    } finally {
      setIsCreatingGame(false);
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
          <h1 className="text-4xl font-bold">Scrabbble Lobby</h1>
          <p className="text-muted-foreground">Welcome, {userName}</p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleCreateGame}
            disabled={isCreatingGame}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingGame ? "Creating Game..." : "Create New Game"}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full px-6 py-3 border border-input rounded-md hover:bg-accent"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
