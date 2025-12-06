import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { VoteType } from "@/model/core.model";
import { authService } from "@/services/auth";
import { updateGame } from "@/services/collections/game/game";
import { DbGamePayload } from "@/services/collections/game/game.model";
import {
  useGetPlayerName,
  useGetUserConfig,
} from "@/services/collections/userConfig/userConfig.hooks";
import { useNavigate } from "react-router-dom";
import { BoardComponent } from "./BoardComponent/BoardComponent";
import { StartVoteModal } from "./VoteModals/StartVoteModal/StartVoteModal";
import { PlayerHand } from "./PlayerHand/PlayerHand";

export const PlayfieldContainer = () => {
  // Hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state, gameId } = useGameContext();
  const getPlayerName = useGetPlayerName();

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
  const showStartVoteModal =
    state?.currentVote?.type === VoteType.START_VOTE &&
    !state?.currentVote?.voteFinished;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Playfield</h1>
            <p className="text-muted-foreground mt-1">Welcome, {userName}</p>
          </div>
          <div className="flex gap-4">
            {(!state || !state.gameStarted) && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm border border-input rounded-md hover:bg-accent"
              >
                Leave Game
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm border border-input rounded-md hover:bg-accent"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground text-sm mt-2">
            Players:&nbsp;
            {(state?.playerIds ?? [])
              .filter(Boolean)
              .map(getPlayerName)
              .join(", ")}
          </p>
          {!!state && <BoardComponent />}
        </div>
        {showStartVoteModal && <StartVoteModal vote={state!.currentVote!} />}
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <PlayerHand />
        </div>
      </div>
    </div>
  );
};
