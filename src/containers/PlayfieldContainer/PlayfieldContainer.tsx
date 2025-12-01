import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/contexts/GameState.context";
import { authService } from "@/services/auth";
import { updateGame } from "@/services/collections/game/game";
import { DbGamePayload } from "@/services/collections/game/game.model";
import { useGetUserConfig } from "@/services/collections/userConfig/userConfig.hooks";
import { useNavigate } from "react-router-dom";

export const PlayfieldContainer = () => {
  // Hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state, gameId } = useGame();

  // Handlers
  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const handleBack = () => {
    // Remove the user from the game
    updateGame(db, gameId, {
      playerIds: state!.playerIds.map((v) =>
        v === user!.uid ? null : v
      ) as DbGamePayload["playerIds"],
    });
    navigate("/");
  };

  // Data
  const userConfig = useGetUserConfig();

  // Consts
  const userName = userConfig?.displayName ?? user?.email;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Playfield</h1>
            <p className="text-muted-foreground mt-1">Welcome, {userName}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm border border-input rounded-md hover:bg-accent"
            >
              Back
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm border border-input rounded-md hover:bg-accent"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground text-lg">
            Game board will be here
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            This is a placeholder for the Playfield component
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            {/* Implement get user name  */}
            Players: {state?.playerIds.join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
};
