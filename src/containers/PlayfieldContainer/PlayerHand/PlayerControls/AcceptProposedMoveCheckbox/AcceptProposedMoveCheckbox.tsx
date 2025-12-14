import { UserAvatar } from "@/components/UserAvatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { cn } from "@/lib/utils";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import { Check, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export const AcceptProposedMoveCheckbox = () => {
  // Hooks
  const { t } = useTranslation();

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

  const className = cn(
    "flex flex-col gap-1 items-center justify-center w-full h-100 p-2"
  );

  // Render
  return (
    <div className={className}>
      <div className="text-xs flex flex-row gap-2 items-center">
        {t("acceptMove.acceptFrom")}
        <UserAvatar
          userId={state.currentPlayerId!}
          glow={state.currentPlayerId === user!.uid}
          shadingIndex={state.playerIds.indexOf(state.currentPlayerId!)}
          diameter={24}
        />
      </div>
      <div className="grid grid-cols-4 gap-2 items-center">
        {state.playerIds.map((id) => {
          if (id === null)
            return (
              <div
                className="flex flex-col gap-1 items-center justify-center w-full h-full border rounded-sm p-1 border-gray-600 bg-gray-100"
                key={id}
              >
                -
              </div>
            );

          const isChecked: boolean | null = state.currentVote?.votes.find(
            (v) => v.playerId === id
          )?.voted!;
          const className = cn(
            "flex flex-col gap-1 items-center justify-center w-full h-full border rounded-sm p-1",
            isChecked === null
              ? "border-gray-500 bg-gray-200"
              : isChecked
              ? "border-green-600 bg-green-100"
              : "border-red-600 bg-red-100"
          );

          return (
            <div className={className} key={id}>
              <UserAvatar
                userId={id}
                diameter={24}
                shadingIndex={state.playerIds.indexOf(id)}
              />
              {id === user!.uid ? (
                <Checkbox
                  className="bg-white"
                  checked={isChecked}
                  onCheckedChange={handleChangeVote}
                />
              ) : isChecked === null ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : isChecked ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
