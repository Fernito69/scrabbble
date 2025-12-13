import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import { PlayerBadge } from "../../../PlayerBadge/PlayerBadge";
import { cn } from "@/lib/utils";

export const AcceptProposedMoveCheckbox = () => {
  // Context
  const { gameId, state } = useGameContext();
  const { user } = useAuth();

  // Mutations
  const updateGame = useUpdateGame(gameId);

  if (!state || !state.currentVote) return null;

  // Handlers
  const handleChangeVote = () => {
    if (!state.currentVote) return;
    updateGame({
      currentVote: {
        ...state.currentVote,
        votes: state.currentVote.votes.map((v) =>
          v.playerId === user!.uid ? { ...v, voted: !v.voted } : v
        ),
      },
    });
  };

  // Consts
  const isChecked = !!state.currentVote.votes.find(
    (v) => v.playerId === user!.uid
  )?.voted;
  const className = cn(
    "flex flex-col gap-1 items-center justify-center w-full h-full border-1 border rounded-sm p-2",
    isChecked ? "border-green-600 bg-green-100" : "border-red-600 bg-red-100"
  );

  // Render
  return (
    <div className={className}>
      <div className="text-muted-foreground whitespace-nowrap w-full flex flex-row gap-2 justify-center text-sm">
        Accept move from{" "}
        {state.currentPlayerId === user!.uid ? (
          "myself"
        ) : (
          <PlayerBadge playerId={state.currentPlayerId!} />
        )}
      </div>
      <Checkbox
        className="bg-white"
        checked={isChecked}
        onCheckedChange={handleChangeVote}
      />
    </div>
  );
};
